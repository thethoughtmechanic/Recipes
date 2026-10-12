import test from "node:test";
import assert from "node:assert/strict";
import { recipes } from "../app/recipes.ts";
import { snapshotFormula, measuredAmount, appendExperiment, notebookFor, preferredRecipe, promoteExperiment, parseNotebooks } from "../app/experiments.ts";
import { formatExactDecimal, scaleFraction, formatRecipeYield } from "../app/scaling.ts";

const everyday = recipes.find(recipe => recipe.id === "everyday-crispy-waffles");
const overnight = recipes.find(recipe => recipe.id === "overnight-yeasted-waffles");
const byName = (formula, name) => formula.ingredientGroups.flatMap(group => group.items).find(item => item.name === name);

test("waffle collection contains three distinct recipes, with honest validation labels", () => {
  assert.equal(recipes.filter(recipe => recipe.collection === "Waffles").length, 3);
  assert.equal(new Set(recipes.map(recipe => recipe.id)).size, recipes.length);
  assert.match(everyday.formulaLabel, /V1 · Tested · V2 next/);
  assert.equal(everyday.experiments[1].status, "proposed");
  assert.match(overnight.formulaLabel, /Untested/);
  const liege = recipes.find(recipe => recipe.id === "liege-waffles");
  assert.equal(liege.concept, true);
  assert.equal(liege.ingredientGroups.length, 0);
});

test("V1 and V2 keep exact independent formulas and real observations", () => {
  const [v1, v2] = everyday.experiments;
  assert.equal(v1.date, "2026-10-11");
  assert.equal(byName(v1.formula, "Bread flour").amount.numerator, 70);
  assert.equal(byName(v1.formula, "2% milk").amount.numerator, 125);
  assert.equal(byName(v2.formula, "All-purpose flour").amount.numerator, 70);
  assert.equal(byName(v2.formula, "2% milk").amount.numerator, 100);
  assert.match(v1.observations, /chewy/);
  assert.match(v2.formula.method.join(" "), /do not separate or whip/);
  const copy = snapshotFormula(v2.formula);
  copy.ingredientGroups[0].items[1].amount.numerator = 200;
  assert.equal(byName(v2.formula, "All-purpose flour").amount.numerator, 70);
});

test("both everyday formulas scale by whole eggs without changing stored quantities", () => {
  for (const experiment of everyday.experiments) {
    for (const target of everyday.scale.options) {
      const milk = byName(experiment.formula, "2% milk");
      assert.equal(formatExactDecimal(scaleFraction(milk.amount, target, experiment.formula.scale.base)), String(milk.amount.numerator * target.numerator));
      const egg = byName(experiment.formula, "Large egg");
      assert.equal(formatExactDecimal(scaleFraction(egg.amount, target, experiment.formula.scale.base)), String(target.numerator));
    }
  }
});

test("overnight source formula and optional variation are preserved in its snapshot", () => {
  const snapshot = overnight.experiments[0].formula;
  assert.deepEqual(snapshot, snapshotFormula(overnight));
  const amounts = { "Large eggs": 2, "All-purpose flour": 220, Cornstarch: 20, Milk: 340, "Unsalted butter, melted": 85, "Granulated sugar": 15, "Instant yeast": 2, "Fine salt": 4, "Vanilla extract": 5 };
  for (const [name, amount] of Object.entries(amounts)) assert.equal(byName(snapshot, name).amount.numerator, amount);
  assert.equal(byName(snapshot, "Fine or medium cornmeal").amount.numerator, 25);
});

test("recording a scaled cook captures quantities, base and yield at that scale", () => {
  const cook = snapshotFormula(overnight, { numerator: 3 });
  assert.deepEqual(cook.scale.base, { numerator: 3 });
  assert.equal(byName(cook, "Milk").amount.numerator / (byName(cook, "Milk").amount.denominator ?? 1), 510);
  assert.equal(formatRecipeYield(cook, { numerator: 3 }), "About 9 round waffles");
  assert.equal(formatRecipeYield(cook, { numerator: 2 }), "About 6 round waffles");
  assert.equal(byName(overnight, "Milk").amount.numerator, 340);
});

test("only an explicit tested promotion changes the preferred recipe", () => {
  const notebook = notebookFor(everyday, {});
  assert.throws(() => promoteExperiment(notebook, "everyday-v2"));
  assert.throws(() => promoteExperiment(notebook, "missing"));
  const cook = { ...structuredClone(everyday.experiments[1]), id: "v2-cook", status: "tested", observations: "Crisp after five minutes." };
  const withCook = { experiments: [...notebook.experiments, cook] };
  assert.equal(byName(preferredRecipe(everyday, withCook), "2% milk").amount.numerator, 125);
  const promoted = promoteExperiment(withCook, cook.id);
  const preferred = preferredRecipe(everyday, promoted);
  assert.equal(byName(preferred, "2% milk").amount.numerator, 100);
  assert.match(preferred.formulaLabel, /Preferred/);
  assert.equal(byName(everyday, "2% milk").amount.numerator, 125);
  assert.deepEqual(promoted.experiments, withCook.experiments);
  assert.throws(() => promoteExperiment({ experiments: [{ ...cook, status: "rejected" }] }, cook.id));
  const liege = recipes.find(recipe => recipe.id === "liege-waffles");
  assert.throws(() => promoteExperiment(notebookFor(liege, {}), "liege-v1"));
});

test("experiment capability works for existing recipes and preserves their original formula", () => {
  const banana = recipes.find(recipe => recipe.id === "staub-banana-bread");
  const cook = { ...everyday.experiments[0], id: "banana-cook", formula: snapshotFormula(banana) };
  const saved = appendExperiment(banana, {}, cook);
  saved[banana.id].preferredId = cook.id;
  const notebook = notebookFor(banana, saved);
  assert.equal(notebook.experiments.length, 2);
  assert.equal(notebook.experiments[0].version, "Original");
  assert.deepEqual(notebook.experiments[0].formula, snapshotFormula(banana));
  assert.deepEqual(preferredRecipe(banana, notebook).ingredientGroups, banana.ingredientGroups);
  const laterSource = structuredClone(banana);
  laterSource.ingredientGroups[0].items[0].amount.numerator = 999;
  assert.notEqual(notebookFor(laterSource, saved).experiments[0].formula.ingredientGroups[0].items[0].amount.numerator, 999);
});

test("notebooks survive serialization and malformed data is rejected", () => {
  const saved = { [everyday.id]: { experiments: [everyday.experiments[0]], preferredId: "everyday-v1" } };
  assert.deepEqual(parseNotebooks(JSON.stringify(saved)), JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(parseNotebooks(null), {});
  for (const bad of ["{", "null", "[]", '{"recipe":{"experiments":[{}]}}']) assert.throws(() => parseNotebooks(bad));
  const corrupt = structuredClone(saved);
  corrupt[everyday.id].experiments[0].formula.scale.base.numerator = 0;
  assert.throws(() => parseNotebooks(JSON.stringify(corrupt)));
});

test("measured quantities preserve repeating source fractions and parse decimal edits", () => {
  const third = { numerator: 85, denominator: 3 };
  assert.deepEqual(measuredAmount(third, String(85 / 3)), third);
  assert.deepEqual(measuredAmount(third, "28.5"), { numerator: 57, denominator: 2 });
  assert.deepEqual(measuredAmount(third, "1e-3"), { numerator: 1, denominator: 1000 });
});
