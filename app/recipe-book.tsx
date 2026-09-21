"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  categories,
  recipes,
  type Fraction,
  type Ingredient,
  type Recipe,
  type ScaleOption,
} from "./recipes";
import {
  availableCategories,
  normalizeSearchText,
  recipeSearchText,
  stableRecipeNumber,
  type ActiveCategory,
} from "./library";
import {
  formatExactDecimal,
  formatKitchenAmount,
  formatScaleFactor,
  formatTallyTarget,
  scaleFraction,
} from "./scaling";

function recipeFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const id = window.location.hash.replace(/^#recipe=/, "");
  return recipes.some((recipe) => recipe.id === id) ? id : null;
}

function openRecipe(id: string) {
  window.history.pushState({ fromRecipeLibrary: true }, "", `#recipe=${id}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  window.scrollTo({ top: 0, behavior: "instant" });
}

function closeRecipe() {
  if (window.history.state?.fromRecipeLibrary) {
    window.history.back();
    return;
  }
  // A direct recipe link has no library entry to return to.
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  window.scrollTo({ top: 0, behavior: "instant" });
}

function scaleLabel(recipe: Recipe, option: ScaleOption) {
  const singular = option.numerator === (option.denominator ?? 1);
  if (recipe.scale.kind === "egg") return `${option.label} ${singular ? "egg" : "eggs"}`;
  if (recipe.scale.kind === "egg-white") return `${option.label} egg ${singular ? "white" : "whites"}`;
  if (recipe.scale.label === "Bowls") return `${option.label} ${singular ? "bowl" : "bowls"}`;
  if (recipe.scale.kind === "weight") return `${option.label} of ${recipe.scale.label}`;
  return option.label;
}

function metaItems(recipe: Recipe) {
  return [
    recipe.yield ? { label: "Yield", value: recipe.yield } : null,
    recipe.vessel ? { label: "Vessel", value: recipe.vessel } : null,
    recipe.heat ? { label: "Heat", value: recipe.heat } : null,
    recipe.time ? { label: "Time", value: recipe.time } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
}

const subscribeToWakeLockSupport = () => () => {};
const getWakeLockSupport = () => "wakeLock" in navigator;
const getServerWakeLockSupport = () => false;

function useScreenWakeLock() {
  const supported = useSyncExternalStore(
    subscribeToWakeLockSupport,
    getWakeLockSupport,
    getServerWakeLockSupport,
  );
  const [active, setActive] = useState(false);
  const [wanted, setWanted] = useState(false);
  const wantedRef = useRef(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if (
      !("wakeLock" in navigator) ||
      document.visibilityState !== "visible" ||
      sentinelRef.current
    ) {
      return;
    }

    try {
      const sentinel = await navigator.wakeLock.request("screen");
      sentinelRef.current = sentinel;
      setActive(true);
      sentinel.addEventListener(
        "release",
        () => {
          if (sentinelRef.current === sentinel) {
            sentinelRef.current = null;
          }
          setActive(false);
        },
        { once: true },
      );
    } catch {
      wantedRef.current = false;
      setWanted(false);
      setActive(false);
    }
  }, []);

  useEffect(() => {
    if (!supported) return;

    const restoreWhenVisible = () => {
      if (document.visibilityState === "visible" && wantedRef.current) {
        void requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", restoreWhenVisible);
    return () => {
      document.removeEventListener("visibilitychange", restoreWhenVisible);
      wantedRef.current = false;
      void sentinelRef.current?.release();
      sentinelRef.current = null;
    };
  }, [requestWakeLock, supported]);

  const toggle = useCallback(async () => {
    if (wantedRef.current) {
      wantedRef.current = false;
      setWanted(false);
      await sentinelRef.current?.release();
      return;
    }

    wantedRef.current = true;
    setWanted(true);
    await requestWakeLock();
  }, [requestWakeLock]);

  return { supported, active, wanted, toggle };
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
  const isOne = scaled.numerator === scaled.denominator;
  const unit = ingredient.unit === "egg" || ingredient.unit === "eggs"
    ? (isOne ? "egg" : "eggs")
    : ingredient.unit === "white" || ingredient.unit === "whites"
      ? (isOne ? "white" : "whites")
      : ingredient.unit;

  return (
    <div className="ingredient-measure">
      <span className="ingredient-value">
        {value}
        {unit ? (
          <span className="ingredient-unit">{unit}</span>
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
  pendingTarget,
  checkedCount,
  onResolve,
  status,
}: {
  recipe: Recipe;
  target: ScaleOption;
  onChange: (option: ScaleOption) => void;
  pendingTarget: ScaleOption | null;
  checkedCount: number;
  onResolve: (choice: "clear" | "keep" | "cancel") => void;
  status: string;
}) {
  const factor = formatScaleFactor(target, recipe.scale.base);
  const panelRef = useRef<HTMLElement>(null);
  const choiceRef = useRef<HTMLDivElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (pendingTarget) {
      choiceRef.current?.focus();
    } else if (wasPending.current) {
      panelRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
    }
    wasPending.current = Boolean(pendingTarget);
  }, [pendingTarget]);

  return (
    <section className="scale-panel" ref={panelRef}>
      <span className="scale-kicker">
        {recipe.scale.kind === "fixed" ? "Formula" : "Scale by"}
      </span>
      <h2 className="scale-title">{recipe.scale.label}</h2>
      <div className="scale-options" role="group" aria-label={`Scale by ${recipe.scale.label}`}>
        {recipe.scale.options.map((option) => (
          <button
            className="scale-option"
            type="button"
            key={`${option.numerator}/${option.denominator ?? 1}`}
            aria-label={scaleLabel(recipe, option)}
            disabled={Boolean(pendingTarget)}
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
      {pendingTarget ? (
        <div
          className="scale-confirmation"
          role="group"
          aria-labelledby="scale-change-title"
          aria-describedby="scale-change-description"
          tabIndex={-1}
          ref={choiceRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") onResolve("cancel");
          }}
        >
          <h3 id="scale-change-title">Change to {scaleLabel(recipe, pendingTarget)}?</h3>
          <p id="scale-change-description">
            Amounts will update. {checkedCount} {checkedCount === 1 ? "ingredient is" : "ingredients are"} checked.
          </p>
          <div className="scale-confirmation-actions">
            <button type="button" onClick={() => onResolve("clear")}>Clear checks &amp; change</button>
            <button type="button" onClick={() => onResolve("keep")}>Keep checks &amp; change</button>
            <button type="button" onClick={() => onResolve("cancel")}>Cancel</button>
          </div>
        </div>
      ) : null}
      <p className="scale-status" role="status">{status}</p>
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
  const [pendingTarget, setPendingTarget] = useState<ScaleOption | null>(null);
  const [scaleStatus, setScaleStatus] = useState("");
  const mainRef = useRef<HTMLElement>(null);
  const wakeLock = useScreenWakeLock();

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, []);

  const requestScaleChange = (option: ScaleOption) => {
    if (option.numerator === target.numerator && (option.denominator ?? 1) === (target.denominator ?? 1)) return;
    if (checked.size) {
      setPendingTarget(option);
      setScaleStatus("");
    } else {
      setTarget(option);
      setScaleStatus(`Amounts updated for ${scaleLabel(recipe, option)}.`);
    }
  };

  const resolveScaleChange = (choice: "clear" | "keep" | "cancel") => {
    if (!pendingTarget) return;
    if (choice !== "cancel") {
      setTarget(pendingTarget);
      if (choice === "clear") setChecked(new Set());
      setScaleStatus(`Amounts updated for ${scaleLabel(recipe, pendingTarget)}. ${choice === "clear" ? "Checks cleared." : "Checks kept. Review what you have already measured."}`);
    }
    setPendingTarget(null);
  };

  const toggleIngredient = (key: string) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <main className={`recipe-app tone-${recipe.tone}`} ref={mainRef} tabIndex={-1} aria-label={recipe.title}>
      <header className="topbar">
        <button className="back-button" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span>
          Recipes
        </button>
        <div className="topbar-actions">
          {wakeLock.supported ? (
            <button
              className="wake-lock-button"
              type="button"
              aria-pressed={wakeLock.wanted}
              onClick={() => void wakeLock.toggle()}
            >
              <span className="wake-lock-status" aria-hidden="true">
                {wakeLock.active ? "●" : "○"}
              </span>
              {wakeLock.active ? "Screen awake" : "Keep awake"}
            </button>
          ) : null}
          <span className="topbar-count formula-book-label">
            Misu’s formula book
          </span>
        </div>
      </header>

      <article className="recipe-shell">
        <header className="recipe-header">
          <div className="recipe-title-block">
            <p className="eyebrow">
              {recipe.category} · {recipe.tags.join(" · ")}
            </p>
            <h1>{recipe.title}</h1>
          </div>
          <figure className="recipe-hero-art">
            <Image
              src={`/recipes/${recipe.id}.webp`}
              alt={`Paper-collage illustration of ${recipe.title}`}
              fill
              priority
              unoptimized
              sizes="(max-width: 979px) 100vw, 44vw"
            />
            <figcaption className="recipe-mobile-title">
              <span className="eyebrow">
                {recipe.category} · {recipe.tags.join(" · ")}
              </span>
              <h1 className="recipe-mobile-heading">{recipe.title}</h1>
            </figcaption>
          </figure>
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
            <ScalePanel
              recipe={recipe}
              target={target}
              onChange={requestScaleChange}
              pendingTarget={pendingTarget}
              checkedCount={checked.size}
              onResolve={resolveScaleChange}
              status={scaleStatus}
            />
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
            {recipe.ingredientGroups.some((group) => group.items.some((ingredient) => ingredient.unit === "g")) ? (
              <p className="tally-explainer">Tally is the target for a 0.1g scale. The formula amount appears above it.</p>
            ) : null}

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
            {recipe.method?.length ? (
              <section className="method-panel">
                <h2 className="section-label">Method</h2>
                <ol className="method-list">
                  {recipe.method.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </section>
            ) : null}
          </section>
        </div>
      </article>
    </main>
  );
}

function RecipeLibrary({ onSelect }: { onSelect: (id: string) => void }) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ActiveCategory>("All");
  const normalizedQuery = normalizeSearchText(query.trim());
  const visibleCategories = useMemo(
    () => availableCategories(categories, recipes),
    [],
  );

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
  const isFiltered = category !== "All" || normalizedQuery.length > 0;

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
        <span className="topbar-count" aria-live="polite">
          {isFiltered
            ? `${filteredRecipes.length} of ${recipes.length} formulas`
            : `${recipes.length} formulas`}
        </span>
      </header>

      <div className="home-shell">
        <section className="hero">
          <h1>Cook by weight.</h1>
          <p className="hero-copy">
            Your recipes, scaled to what you have.
          </p>
        </section>

        <section className="library-controls" aria-label="Recipe filters">
          <label className="search-wrap">
            <span className="search-label">Find a recipe or ingredient</span>
            <input
              className="search-input"
              ref={searchRef}
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
            {visibleCategories.map((option) => (
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
                id={`recipe-card-${recipe.id}`}
                type="button"
                onClick={() => onSelect(recipe.id)}
              >
                <span className="recipe-card-image" aria-hidden="true">
                  <Image
                    src={`/recipes/${recipe.id}.webp`}
                    alt=""
                    fill
                    unoptimized
                    priority={index < 3}
                    sizes="(max-width: 679px) 108px, (max-width: 979px) 50vw, 33vw"
                  />
                </span>
                <span className="recipe-card-copy">
                  <span className="recipe-index">
                    {String(stableRecipeNumber(recipes, recipe.id)).padStart(
                      2,
                      "0",
                    )}{" "}
                    · {recipe.category}
                  </span>
                  <span className="recipe-card-title">{recipe.title}</span>
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
            <div className="empty-state">
              <p>No recipes match. Try another ingredient or category.</p>
              <button className="text-button" type="button" onClick={() => {
                searchRef.current?.focus();
                setQuery("");
                setCategory("All");
              }}>Clear filters</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export function RecipeBook() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const libraryPosition = useRef({ scrollY: 0, recipeId: "" });

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const syncFromHash = () => setSelectedId(recipeFromHash());
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);

    return () => {
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  useEffect(() => {
    if (selectedId) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    if (!libraryPosition.current.recipeId) return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: libraryPosition.current.scrollY, behavior: "instant" });
      document.getElementById(`recipe-card-${libraryPosition.current.recipeId}`)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedId]);

  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedId);

  return (
    <>
      <div hidden={Boolean(selectedRecipe)}>
        <RecipeLibrary onSelect={(id) => {
          libraryPosition.current = { scrollY: window.scrollY, recipeId: id };
          openRecipe(id);
        }} />
      </div>
      {selectedRecipe ? <RecipeDetail
        key={selectedRecipe.id}
        recipe={selectedRecipe}
        onBack={closeRecipe}
      /> : null}
    </>
  );
}
