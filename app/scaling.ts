import type { Fraction } from "./recipes";

export type ScaledAmount = {
  numerator: number;
  denominator: number;
};

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }

  return x || 1;
}

export function reduceFraction(
  numerator: number,
  denominator = 1,
): ScaledAmount {
  const divisor = gcd(numerator, denominator);
  const sign = denominator < 0 ? -1 : 1;

  return {
    numerator: (numerator / divisor) * sign,
    denominator: Math.abs(denominator / divisor),
  };
}

export function scaleFraction(
  amount: Fraction,
  target: Fraction,
  base: Fraction,
): ScaledAmount {
  const amountDenominator = amount.denominator ?? 1;
  const targetDenominator = target.denominator ?? 1;
  const baseDenominator = base.denominator ?? 1;

  return reduceFraction(
    amount.numerator * target.numerator * baseDenominator,
    amountDenominator * targetDenominator * base.numerator,
  );
}

function isTerminating(denominator: number): boolean {
  let remaining = Math.abs(denominator);

  while (remaining % 2 === 0) remaining /= 2;
  while (remaining % 5 === 0) remaining /= 5;

  return remaining === 1;
}

export function formatExactDecimal(amount: ScaledAmount): string {
  if (amount.denominator === 1) return String(amount.numerator);

  const value = amount.numerator / amount.denominator;

  if (isTerminating(amount.denominator)) {
    return Number(value.toFixed(6)).toString();
  }

  return `${value.toFixed(3)}…`;
}

const vulgarFractions: Record<string, string> = {
  "1/2": "½",
  "1/3": "⅓",
  "2/3": "⅔",
  "1/4": "¼",
  "3/4": "¾",
  "1/5": "⅕",
  "2/5": "⅖",
  "3/5": "⅗",
  "4/5": "⅘",
  "1/8": "⅛",
  "3/8": "⅜",
  "5/8": "⅝",
  "7/8": "⅞",
};

export function formatKitchenAmount(amount: ScaledAmount): string {
  if (amount.denominator === 1) return String(amount.numerator);

  const whole = Math.trunc(amount.numerator / amount.denominator);
  const remainder = Math.abs(amount.numerator % amount.denominator);
  const fraction = vulgarFractions[`${remainder}/${amount.denominator}`];

  if (fraction) {
    return `${whole === 0 ? "" : whole}${fraction}`;
  }

  return formatExactDecimal(amount);
}

export function formatTallyTarget(amount: ScaledAmount): string {
  return (amount.numerator / amount.denominator).toFixed(1);
}

export function formatScaleFactor(
  target: Fraction,
  base: Fraction,
): string {
  const scaled = scaleFraction({ numerator: 1 }, target, base);
  return formatExactDecimal(scaled);
}
