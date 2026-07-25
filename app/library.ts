import type { Category, Recipe } from "./recipes";

export type ActiveCategory = "All" | Category;

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function recipeSearchText(recipe: Recipe): string {
  const ingredients = recipe.ingredientGroups
    .flatMap((group) => group.items)
    .map((ingredient) => ingredient.name)
    .join(" ");
  const groupTitles = recipe.ingredientGroups
    .map((group) => group.title ?? "")
    .join(" ");

  return normalizeSearchText(
    [
      recipe.title,
      recipe.category,
      recipe.tags.join(" "),
      recipe.vessel ?? "",
      recipe.heat ?? "",
      groupTitles,
      ingredients,
    ].join(" "),
  );
}

export function availableCategories(
  categories: ActiveCategory[],
  recipes: Recipe[],
): ActiveCategory[] {
  return categories.filter(
    (category) =>
      category === "All" ||
      recipes.some((recipe) => recipe.category === category),
  );
}

export function stableRecipeNumber(recipes: Recipe[], id: string): number {
  return recipes.findIndex((recipe) => recipe.id === id) + 1;
}
