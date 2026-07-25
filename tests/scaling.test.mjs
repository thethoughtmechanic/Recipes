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

test("source fractions stay readable after scaling", () => {
  const dashi = scaleFraction(
    { numerator: 2, denominator: 3 },
    { numerator: 2 },
    { numerator: 1 },
  );

  assert.equal(formatKitchenAmount(dashi), "1⅓");
});

test("every recipe has an optimized paper-collage image", async () => {
  assert.equal(recipes.length, 15);

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
