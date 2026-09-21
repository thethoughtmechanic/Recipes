import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  formatExactDecimal,
  formatKitchenAmount,
  formatTallyTarget,
  scaleFraction,
} from "../app/scaling.ts";
import {
  availableCategories,
  normalizeSearchText,
  recipeSearchText,
  stableRecipeNumber,
} from "../app/library.ts";
import { categories, recipes } from "../app/recipes.ts";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

test("whole-egg scaling keeps exact rational values", () => {
  const flour = scaleFraction(
    { numerator: 85 },
    { numerator: 1 },
    { numerator: 3 },
  );

  assert.deepEqual(flour, { numerator: 85, denominator: 3 });
  assert.equal(formatExactDecimal(flour), "28.333…");
});

test("the Tally target rounds only for the scale display", () => {
  const exact = { numerator: 85, denominator: 3 };

  assert.equal(formatExactDecimal(exact), "28.333…");
  assert.equal(formatTallyTarget(exact), "28.3");
  assert.deepEqual(exact, { numerator: 85, denominator: 3 });
});

test("Dutch Baby preserves its exact formula and separate scale targets", () => {
  const recipe = recipes.find((item) => item.id === "dutch-baby");
  const expected = {
    "All-purpose flour": ["56.667…", "56.7"],
    "Milk": ["80", "80.0"],
    "Sugar": ["8", "8.0"],
    "Unsalted butter": ["38", "38.0"],
  };
  for (const [name, values] of Object.entries(expected)) {
    const ingredient = recipe.ingredientGroups[0].items.find((item) => item.name === name);
    assert.ok(ingredient, name);
    const scaled = scaleFraction(ingredient.amount, { numerator: 2 }, recipe.scale.base);
    assert.deepEqual([formatExactDecimal(scaled), formatTallyTarget(scaled)], values);
  }
  const butter = recipe.ingredientGroups[0].items.find((item) => item.name === "Unsalted butter");
  assert.equal(formatExactDecimal(scaleFraction(butter.amount, { numerator: 3 }, recipe.scale.base)), "57");
  const oil = recipe.ingredientGroups[0].items.find((item) => item.name === "Neutral oil");
  assert.equal(oil.scalable, false);
  assert.equal(oil.amount, undefined);
});

test("Original Plum Torte scales its metric formula by whole eggs", () => {
  const recipe = recipes.find((item) => item.id === "original-plum-torte");

  assert.ok(recipe);
  assert.equal(recipe.scale.kind, "egg");
  assert.deepEqual(recipe.scale.base, { numerator: 2 });

  const ingredients = recipe.ingredientGroups.flatMap((group) => group.items);
  const expected = {
    "Granulated sugar": [150, "225.0"],
    "Unsalted butter, softened": [115, "172.5"],
    "Unbleached flour, sifted": [125, "187.5"],
    "Purple plums, pitted and halved": [450, "675.0"],
  };

  for (const [name, [baseGrams, threeEggTarget]] of Object.entries(expected)) {
    const ingredient = ingredients.find((item) => item.name === name);
    assert.ok(ingredient, name);
    assert.equal(ingredient.unit, "g");
    assert.equal(ingredient.amount.numerator, baseGrams);
    assert.equal(
      formatTallyTarget(
        scaleFraction(ingredient.amount, { numerator: 3 }, recipe.scale.base),
      ),
      threeEggTarget,
    );
  }
});

test("source fractions stay readable after scaling", () => {
  const dashi = scaleFraction(
    { numerator: 2, denominator: 3 },
    { numerator: 2 },
    { numerator: 1 },
  );

  assert.equal(formatKitchenAmount(dashi), "1⅓");
});

test("every recipe has an optimized paper-collage image", async () => {
  assert.equal(recipes.length, 17);

  await Promise.all(
    recipes.map((recipe) =>
      access(`${projectRoot}/public/recipes/${recipe.id}.webp`),
    ),
  );
});

test("search ignores accents and includes useful recipe metadata", () => {
  const crepes = recipes.find((recipe) => recipe.id === "weekend-crepes");

  assert.ok(crepes);
  assert.equal(normalizeSearchText("Crêpes"), "crepes");
  assert.match(recipeSearchText(crepes), /crepes/);
  assert.match(recipeSearchText(crepes), /10-inch pan/);
});

test("empty categories stay out of the filter row", () => {
  const visible = availableCategories(categories, recipes);

  assert.ok(visible.includes("Sweets"));
  assert.ok(!visible.includes("Drink"));
});

test("recipe numbering stays stable after filtering", () => {
  const crepes = recipes.find((recipe) => recipe.id === "weekend-crepes");

  assert.ok(crepes);
  assert.equal(stableRecipeNumber(recipes, crepes.id), 3);
});
