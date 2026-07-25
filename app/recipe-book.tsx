"use client";

import { useEffect, useMemo, useState } from "react";
import {
  categories,
  recipes,
  type Category,
  type Fraction,
  type Ingredient,
  type Recipe,
  type ScaleOption,
} from "./recipes";
import {
  formatExactDecimal,
  formatKitchenAmount,
  formatScaleFactor,
  formatTallyTarget,
  scaleFraction,
} from "./scaling";

type ActiveCategory = "All" | Category;

function recipeFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const id = window.location.hash.replace(/^#recipe=/, "");
  return recipes.some((recipe) => recipe.id === id) ? id : null;
}

function recipeSearchText(recipe: Recipe): string {
  const ingredients = recipe.ingredientGroups
    .flatMap((group) => group.items)
    .map((ingredient) => ingredient.name)
    .join(" ");

  return [
    recipe.title,
    recipe.category,
    recipe.tags.join(" "),
    ingredients,
  ]
    .join(" ")
    .toLowerCase();
}

function openRecipe(id: string) {
  window.history.pushState(null, "", `#recipe=${id}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  window.scrollTo({ top: 0, behavior: "auto" });
}

function closeRecipe() {
  window.history.pushState(null, "", window.location.pathname);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  window.scrollTo({ top: 0, behavior: "auto" });
}

function metaItems(recipe: Recipe) {
  return [
    recipe.yield ? { label: "Yield", value: recipe.yield } : null,
    recipe.vessel ? { label: "Vessel", value: recipe.vessel } : null,
    recipe.heat ? { label: "Heat", value: recipe.heat } : null,
    recipe.time ? { label: "Time", value: recipe.time } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
}

function IngredientMeasure({
  ingredient,
  target,
  base,
}: {
  ingredient: Ingredient;
  target: Fraction;
  base: Fraction;
}) {
  if (!ingredient.amount) {
    return (
      <div className="ingredient-measure">
        <span className="source-measure">By feel</span>
      </div>
    );
  }

  const scaled =
    ingredient.scalable === false
      ? scaleFraction(ingredient.amount, base, base)
      : scaleFraction(ingredient.amount, target, base);
  const isGram = ingredient.unit === "g";
  const value = isGram
    ? formatExactDecimal(scaled)
    : formatKitchenAmount(scaled);

  return (
    <div className="ingredient-measure">
      <span className="ingredient-value">
        {value}
        {ingredient.unit ? (
          <span className="ingredient-unit">{ingredient.unit}</span>
        ) : null}
      </span>
      {isGram ? (
        <span className="tally-target">
          Tally {formatTallyTarget(scaled)}g
        </span>
      ) : (
        <span className="source-measure">Source unit</span>
      )}
    </div>
  );
}

function ScalePanel({
  recipe,
  target,
  onChange,
}: {
  recipe: Recipe;
  target: ScaleOption;
  onChange: (option: ScaleOption) => void;
}) {
  const factor = formatScaleFactor(target, recipe.scale.base);

  return (
    <section className="scale-panel">
      <span className="scale-kicker">
        {recipe.scale.kind === "fixed" ? "Formula" : "Scale by"}
      </span>
      <h2 className="scale-title">{recipe.scale.label}</h2>
      <div className="scale-options" aria-label={`Scale by ${recipe.scale.label}`}>
        {recipe.scale.options.map((option) => (
          <button
            className="scale-option"
            type="button"
            key={`${option.numerator}/${option.denominator ?? 1}`}
            aria-pressed={
              option.numerator === target.numerator &&
              (option.denominator ?? 1) === (target.denominator ?? 1)
            }
            onClick={() => onChange(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="scale-explainer">
        {recipe.scale.kind === "fixed"
          ? "This recipe is recorded by feel, so no false precision is added."
          : `Exact factor ${factor}×. Gram values stay unrounded; the Tally target shows what your 0.1g scale can display.`}
      </p>
    </section>
  );
}

function RecipeDetail({
  recipe,
  onBack,
}: {
  recipe: Recipe;
  onBack: () => void;
}) {
  const defaultTarget =
    recipe.scale.options.find(
      (option) =>
        option.numerator === recipe.scale.base.numerator &&
        (option.denominator ?? 1) === (recipe.scale.base.denominator ?? 1),
    ) ?? recipe.scale.options[0];
  const [target, setTarget] = useState<ScaleOption>(defaultTarget);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggleIngredient = (key: string) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <main className={`recipe-app tone-${recipe.tone}`}>
      <header className="topbar">
        <button className="back-button" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span>
          Recipes
        </button>
        <span className="topbar-count">Misu’s formula book</span>
      </header>

      <article className="recipe-shell">
        <header className="recipe-header">
          <div>
            <p className="eyebrow">
              {recipe.category} · {recipe.tags.join(" · ")}
            </p>
            <h1>{recipe.title}</h1>
          </div>
          <div className="recipe-meta">
            {metaItems(recipe).map((item) => (
              <div className="recipe-meta-item" key={item.label}>
                <span className="recipe-meta-label">{item.label}</span>
                <span className="recipe-meta-value">{item.value}</span>
              </div>
            ))}
          </div>
        </header>

        <div className="recipe-body">
          <aside className="recipe-sidebar">
            <ScalePanel recipe={recipe} target={target} onChange={setTarget} />
            {recipe.notes?.length || recipe.sourceUrl ? (
              <section className="notes-panel">
                <h2 className="section-label">Notes</h2>
                {recipe.notes?.length ? (
                  <ul className="notes-list">
                    {recipe.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : null}
                {recipe.sourceUrl ? (
                  <a
                    className="source-link"
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open original source ↗
                  </a>
                ) : null}
              </section>
            ) : null}
            <p className="screen-note">
              Pan size and cooking time remain source notes. They do not scale
              automatically.
            </p>
          </aside>

          <section className="formula-panel">
            <header className="formula-header">
              <h2 className="section-label">Ingredients</h2>
              {checked.size ? (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setChecked(new Set())}
                >
                  Clear checks
                </button>
              ) : (
                <span className="section-label">Tap to check</span>
              )}
            </header>

            {recipe.ingredientGroups.map((group, groupIndex) => (
              <div
                className="ingredient-group"
                key={group.title ?? `group-${groupIndex}`}
              >
                {group.title ? (
                  <h3 className="ingredient-group-title">{group.title}</h3>
                ) : null}
                {group.items.map((ingredient, ingredientIndex) => {
                  const key = `${groupIndex}-${ingredientIndex}-${ingredient.name}`;
                  const isChecked = checked.has(key);

                  return (
                    <div
                      className="ingredient-row"
                      data-checked={isChecked}
                      key={key}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onClick={() => toggleIngredient(key)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleIngredient(key);
                        }
                      }}
                    >
                      <span className="ingredient-check" aria-hidden="true">
                        {isChecked ? "✓" : ""}
                      </span>
                      <span>
                        <span className="ingredient-name">{ingredient.name}</span>
                        {ingredient.note ? (
                          <span className="ingredient-note">{ingredient.note}</span>
                        ) : null}
                      </span>
                      <IngredientMeasure
                        ingredient={ingredient}
                        target={target}
                        base={recipe.scale.base}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </section>
        </div>
      </article>
    </main>
  );
}

function RecipeLibrary({ onSelect }: { onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ActiveCategory>("All");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredRecipes = useMemo(
    () =>
      recipes.filter((recipe) => {
        const categoryMatch =
          category === "All" || recipe.category === category;
        const queryMatch =
          normalizedQuery.length === 0 ||
          recipeSearchText(recipe).includes(normalizedQuery);
        return categoryMatch && queryMatch;
      }),
    [category, normalizedQuery],
  );

  return (
    <main className="recipe-app">
      <header className="topbar">
        <button
          className="brand-button"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Misu’s
          <span className="brand-subtitle">Recipe book</span>
        </button>
        <span className="topbar-count">{recipes.length} formulas</span>
      </header>

      <div className="home-shell">
        <section className="hero">
          <p className="eyebrow">Weights first · Whole eggs · No guesswork</p>
          <h1>Cook by weight.</h1>
          <p className="hero-copy">
            A personal formula book for exact ratios, sensible batches, and the
            notes that matter.
          </p>
        </section>

        <section className="library-controls" aria-label="Recipe filters">
          <label className="search-wrap">
            <span className="search-label">Find a recipe or ingredient</span>
            <input
              className="search-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pancakes, egg white, ginger…"
            />
            <span className="search-mark" aria-hidden="true">
              ⌕
            </span>
          </label>
          <div className="filter-row" aria-label="Filter by category">
            {categories.map((option) => (
              <button
                className="filter-chip"
                key={option}
                type="button"
                aria-pressed={category === option}
                onClick={() => setCategory(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section className="recipe-grid" aria-live="polite">
          {filteredRecipes.length ? (
            filteredRecipes.map((recipe, index) => (
              <button
                className={`recipe-card tone-${recipe.tone}`}
                key={recipe.id}
                type="button"
                onClick={() => onSelect(recipe.id)}
              >
                <span className="recipe-mark" aria-hidden="true">
                  <span>{recipe.mark}</span>
                </span>
                <span>
                  <span className="recipe-index">
                    {String(index + 1).padStart(2, "0")} · {recipe.category}
                  </span>
                  <h2>{recipe.title}</h2>
                  <span className="recipe-card-tags">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <span className="recipe-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="card-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))
          ) : (
            <p className="empty-state">
              No recipes match. Try another ingredient or category.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export function RecipeBook() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const syncFromHash = () => setSelectedId(recipeFromHash());
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedId);

  if (selectedRecipe) {
    return (
      <RecipeDetail
        key={selectedRecipe.id}
        recipe={selectedRecipe}
        onBack={closeRecipe}
      />
    );
  }

  return <RecipeLibrary onSelect={openRecipe} />;
}
