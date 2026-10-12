"use client";
import { useState } from "react";
import type { Experiment, Formula, Notebook } from "./experiments";
import { snapshotFormula, measuredAmount } from "./experiments";
import type { Fraction, Recipe } from "./recipes";
import { formatExactDecimal, formatKitchenAmount } from "./scaling";

export function ExperimentNotebook({ recipe, notebook, target, selectedId, onView, onSave, onPromote, error, ready }: {
  recipe: Recipe; notebook: Notebook; target: Fraction; selectedId?: string;
  onView: (id?: string) => void; onSave: (experiment: Experiment) => boolean;
  onPromote: (id: string) => void; error: string; ready: boolean;
}) {
  const [logging, setLogging] = useState(false);
  const [draft, setDraft] = useState<{ formula: Formula; version: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string>();
  const selected = notebook.experiments.find(item => item.id === selectedId);

  function startLog() {
    setDraft({ formula: snapshotFormula(recipe, target), version: selected?.version ?? recipe.formulaLabel?.split(" · ")[0] ?? "Cook" });
    setLogging(true);
  }
  return <section className="experiment-notebook" aria-label="Recipe experiments">
    <header className="notebook-heading">
      <div><p className="eyebrow">Cooking laboratory</p><h2>Experiment history</h2></div>
      {!recipe.concept && <button type="button" className="notebook-button" disabled={!ready} onClick={startLog}>Log this cook</button>}
    </header>
    <p className="notebook-note">Record what changed and what happened. Only you choose a new preferred formula. Notes and preferences are saved on this device.</p>
    <p role="status" className="notebook-message">{error}</p>
    {selectedId && <button type="button" className="notebook-button" onClick={() => onView()}>Return to current recipe</button>}
    {!notebook.experiments.length && <p>No experiments yet. Log a cook to preserve your first result.</p>}
    <div className="experiment-list">
      {[...notebook.experiments].reverse().map(experiment => <details key={experiment.id} open={selectedId === experiment.id || undefined}>
        <summary><span>{experiment.version} — {experiment.title}</span><span className="experiment-status">{notebook.preferredId === experiment.id ? "Preferred" : experiment.concept ? "Concept" : experiment.status === "proposed" ? "Proposed · Untested" : experiment.status}{experiment.date ? ` · ${experiment.date}` : ""}</span></summary>
        <div className="experiment-content">
          <p><strong>Hypothesis</strong> {experiment.hypothesis}</p>
          <p><strong>Changes</strong> {experiment.changes}</p>
          <p className="notebook-note">Exact snapshot · {experiment.formula.scale.base.numerator / (experiment.formula.scale.base.denominator ?? 1)} {experiment.formula.scale.kind === "egg" ? "egg(s)" : experiment.formula.scale.label.toLowerCase()}</p>
          {experiment.formula.ingredientGroups.map((group, index) => <div key={index}>
            {group.title && <h3>{group.title}</h3>}
            <ul className="snapshot-ingredients">{group.items.map((item, i) => <li key={i}><span>{item.name}{item.note && <small>{item.note}</small>}</span><span>{item.amount ? (item.unit === "g" ? formatExactDecimal({ numerator: item.amount.numerator, denominator: item.amount.denominator ?? 1 }) : formatKitchenAmount({ numerator: item.amount.numerator, denominator: item.amount.denominator ?? 1 })) : "By feel"} {item.unit}</span></li>)}</ul>
          </div>)}
          {experiment.observations && <p><strong>Observations</strong> {experiment.observations}</p>}
          {experiment.outcome && <p><strong>Outcome</strong> {experiment.outcome}</p>}
          <div className="notebook-actions">
            {!experiment.concept && <button type="button" className="notebook-button" onClick={() => { onView(experiment.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Cook this version</button>}
            {!experiment.concept && ["tested", "preferred"].includes(experiment.status) && notebook.preferredId !== experiment.id && <button type="button" className="notebook-button" disabled={!ready} onClick={() => setConfirmId(experiment.id)}>Make preferred</button>}
          </div>
          {confirmId === experiment.id && <div className="promotion-confirmation">
            <p>Use {experiment.version} as the default on this device? All historical formulas will stay in the notebook.</p>
            <button type="button" className="notebook-button" onClick={() => { onPromote(experiment.id); setConfirmId(undefined); }}>Confirm preferred formula</button>{" "}
            <button type="button" className="notebook-button" onClick={() => setConfirmId(undefined)}>Cancel</button>
          </div>}
        </div>
      </details>)}
    </div>
    {logging && draft && <form className="cook-log" onSubmit={event => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      const formula = structuredClone(draft.formula);
      formula.ingredientGroups.forEach((group, gi) => group.items.forEach((item, ii) => {
        if (!item.amount) return;
        const value = String(fields.get(`amount-${gi}-${ii}`));
        item.amount = measuredAmount(item.amount, value);
      }));
      if (formula.scale.kind === "egg") {
        const eggs = formula.ingredientGroups.flatMap(group => group.items).filter(item => item.unit === "egg" || item.unit === "eggs");
        if (eggs.length) formula.scale.base = { numerator: eggs.reduce((total, item) => total + (item.amount?.numerator ?? 0) / (item.amount?.denominator ?? 1), 0) };
      }
      const method = String(fields.get("method") ?? "").trim();
      formula.method = method ? method.split("\n").map(line => line.trim()).filter(Boolean) : undefined;
      const experiment: Experiment = { id: crypto.randomUUID(), version: draft.version, title: String(fields.get("title")).trim(), date: String(fields.get("date")), status: fields.get("status") === "rejected" ? "rejected" : "tested", hypothesis: selected?.hypothesis ?? "Record the result of this formula.", changes: String(fields.get("changes")).trim(), observations: String(fields.get("observations")).trim(), outcome: String(fields.get("outcome")).trim(), formula };
      if (onSave(experiment)) setLogging(false);
    }}>
      <h3>Log a cook — {draft.version}</h3>
      <p className="notebook-note">Amounts start at your selected scale. Adjust them to what you actually used; they are saved with this cook. Record any method changes below.</p>
      <label>Title<input name="title" required maxLength={160} defaultValue={`${draft.version} cook`} /></label>
      <label>Date<input name="date" type="date" required defaultValue={new Date().toLocaleDateString("en-CA")} /></label>
      <details><summary>Ingredient amounts used</summary>{draft.formula.ingredientGroups.map((group, gi) => <div key={gi}>{group.title && <h4>{group.title}</h4>}{group.items.map((item, ii) => item.amount && <label key={ii}>{item.name} ({item.unit ?? "source unit"})<input type="number" name={`amount-${gi}-${ii}`} required min={item.unit === "egg" || item.unit === "eggs" ? 1 : 0} step={item.unit === "egg" || item.unit === "eggs" ? 1 : "any"} defaultValue={item.amount.numerator / (item.amount.denominator ?? 1)} /></label>)}</div>)}</details>
      <label>Method used (one step per line)<textarea name="method" maxLength={12000} defaultValue={draft.formula.method?.join("\n") ?? ""} /></label>
      <label>Changes<textarea name="changes" required maxLength={3000} defaultValue="No ingredient changes; cooked the displayed formula." /></label>
      <label>Observations<textarea name="observations" required maxLength={3000} placeholder="Texture, flavour, cook time, crispness after 2 and 5 minutes…" /></label>
      <label>Outcome<textarea name="outcome" required maxLength={3000} placeholder="Keep, change or retry?" /></label>
      <label>Status<select name="status"><option value="tested">Tested</option><option value="rejected">Rejected</option></select></label>
      <div className="notebook-actions"><button className="notebook-button" type="submit">Save cook</button><button className="notebook-button" type="button" onClick={() => setLogging(false)}>Cancel</button></div>
    </form>}
  </section>;
}
