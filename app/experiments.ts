import type { Recipe } from "./recipes";
import { scaleFraction, formatRecipeYield, reduceFraction } from "./scaling.ts";
import type { Fraction } from "./recipes";

export type Formula = Pick<Recipe, "scale" | "ingredientGroups" | "method" | "notes" | "yield" | "yieldCount" | "vessel" | "heat" | "time">;
export type Experiment = {
  id: string;
  version: string;
  title: string;
  date?: string;
  status: "proposed" | "tested" | "preferred" | "rejected";
  hypothesis: string;
  changes: string;
  observations: string;
  outcome: string;
  formula: Formula;
  concept?: boolean;
};
export type Notebook = { experiments: Experiment[]; preferredId?: string };
export type Notebooks = Record<string, Notebook>;
export const NOTEBOOK_KEY = "misus-recipe-experiments-v1";

/** Copy all cooking metadata so later edits never change a historical cook. */
export function snapshotFormula(recipe: Formula, target: Fraction = recipe.scale.base): Formula {
  const copy = structuredClone(recipe);
  const factor = scaleFraction({ numerator: 1 }, target, recipe.scale.base);
  copy.ingredientGroups = copy.ingredientGroups.map(group => ({ ...group, items: group.items.map(item => ({ ...item,
    amount: item.amount && item.scalable !== false && factor.numerator !== factor.denominator ? scaleFraction(item.amount, target, recipe.scale.base) : item.amount,
  })) }));
  if (copy.yieldCount) {
    copy.yieldCount.amount *= factor.numerator / factor.denominator;
    if (copy.yieldCount.maximum !== undefined) copy.yieldCount.maximum *= factor.numerator / factor.denominator;
  }
  if (factor.numerator !== factor.denominator) copy.yield = formatRecipeYield(recipe as Recipe, target);
  copy.scale.base = structuredClone(target);
  // Only formula fields enter the snapshot (never recipe identity or history).
  const { scale, ingredientGroups, method, notes, yield: sourceYield, yieldCount, vessel, heat, time } = copy;
  return { scale, ingredientGroups, method, notes, yield: sourceYield, yieldCount, vessel, heat, time };
}

export function notebookFor(recipe: Recipe, saved: Notebooks): Notebook {
  const local = saved[recipe.id];
  return { experiments: [...(recipe.experiments ?? []), ...(local?.experiments ?? [])], preferredId: local?.preferredId };
}

export function appendExperiment(recipe: Recipe, saved: Notebooks, experiment: Experiment): Notebooks {
  const local = saved[recipe.id] ?? { experiments: [] };
  const baseline: Experiment[] = !recipe.experiments?.length && !local.experiments.length ? [{
    id: `${recipe.id}-original`, version: "Original", title: "Original recipe snapshot", status: "proposed",
    hypothesis: "Preserve the original formula; validation status is unknown.", changes: "Original source formula, before local experiments.", observations: "", outcome: "", formula: snapshotFormula(recipe),
  }] : [];
  return { ...saved, [recipe.id]: { ...local, experiments: [...baseline, ...local.experiments, structuredClone(experiment)] } };
}

export function preferredRecipe(recipe: Recipe, notebook: Notebook): Recipe {
  const preferred = notebook.experiments.find(item => item.id === notebook.preferredId && !item.concept && (item.status === "tested" || item.status === "preferred"));
  return preferred ? { ...recipe, ...structuredClone(preferred.formula), formulaLabel: `${preferred.version} · Preferred`, concept: false } : recipe;
}

export function promoteExperiment(notebook: Notebook, id: string): Notebook {
  const experiment = notebook.experiments.find(item => item.id === id);
  if (!experiment || experiment.concept || !experiment.formula.ingredientGroups.length || !["tested", "preferred"].includes(experiment.status)) {
    throw new Error("Cook and record this formula before making it preferred.");
  }
  return { ...notebook, preferredId: id };
}

function isFormula(value: unknown): value is Formula {
  if (!value || typeof value !== "object") return false;
  const formula = value as Formula;
  return Boolean(formula.scale && ["egg", "egg-white", "batch", "weight", "fixed"].includes(formula.scale.kind) &&
    formula.scale.base?.numerator > 0 && (formula.scale.base.denominator ?? 1) > 0 &&
    Array.isArray(formula.scale.options) && formula.scale.options.length && formula.scale.options.every(option => option.numerator > 0 && (option.denominator ?? 1) > 0 && typeof option.label === "string") &&
    Array.isArray(formula.ingredientGroups) && formula.ingredientGroups.every(group => Array.isArray(group.items) && group.items.every(item => typeof item.name === "string" && (!item.amount || (Number.isFinite(item.amount.numerator) && (item.amount.denominator ?? 1) > 0)))) &&
    (!formula.method || (Array.isArray(formula.method) && formula.method.every(step => typeof step === "string"))) &&
    (!formula.notes || (Array.isArray(formula.notes) && formula.notes.every(note => typeof note === "string"))));
}

export function parseNotebooks(raw: string | null): Notebooks {
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid notebook data");
  for (const notebook of Object.values(parsed) as Notebook[]) {
    if (!notebook || !Array.isArray(notebook.experiments) || (notebook.preferredId !== undefined && typeof notebook.preferredId !== "string")) throw new Error("Invalid notebook data");
    for (const item of notebook.experiments) {
      if (!item || !["proposed", "tested", "preferred", "rejected"].includes(item.status) ||
        ![item.id, item.version, item.title, item.hypothesis, item.changes, item.observations, item.outcome].every(value => typeof value === "string") || !isFormula(item.formula)) throw new Error("Invalid experiment data");
    }
  }
  return parsed;
}

/** Retain exact repeating fractions when the cook leaves an amount unchanged. */
export function measuredAmount(original: Fraction, input: string): Fraction {
  const value = Number(input);
  if (value === original.numerator / (original.denominator ?? 1)) return structuredClone(original);
  const [mantissa, exponent = "0"] = value.toString().split("e");
  const places = Math.max(0, (mantissa.split(".")[1]?.length ?? 0) - Number(exponent));
  const denominator = 10 ** places;
  return reduceFraction(Math.round(value * denominator), denominator);
}
