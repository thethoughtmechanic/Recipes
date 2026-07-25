import test from "node:test";
import assert from "node:assert/strict";
import {
  formatExactDecimal,
  formatKitchenAmount,
  formatTallyTarget,
  scaleFraction,
} from "../app/scaling.ts";

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
