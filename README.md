# Misu’s Recipe Book

A mobile-first, installable personal recipe book built from Corey’s Google
Slides collection.

The app keeps the source recipes concise while adding:

- search and category filters;
- whole-egg, egg-white, weight, or batch scaling;
- rational arithmetic so repeating values remain explicit;
- a separate 0.1g Fellow Tally target;
- original paper-collage artwork for every recipe;
- offline access through a service worker.

## Local development

```bash
pnpm install
pnpm dev
```

Run `pnpm test` before publishing. It builds the Cloudflare/Vinext app and
checks the scaling behavior against representative formulas.

## Recipe experiments

Collections are optional recipe metadata, rendered once as expandable groups
within the normal recipe grid; Waffles contains Everyday Crispy,
Overnight Yeasted, and an unsweetened Liège-style dough trial. The existing overnight formula is
unchanged. Everyday opens on tested V1; V2 remains proposed until cooked.

Every recipe has an Experiment history below its cooking view. Open a snapshot
with **Cook this version**, use the existing scale/checklists, then **Log this
cook**. The form captures the selected batch, lets you correct quantities and
method steps, and records date, changes, observations, outcome and status.
Only a tested snapshot can be deliberately promoted with **Make preferred**.
Historical formulas and the original baseline are kept independently.

Notebook entries and preferred formulas use browser localStorage. They work
offline after the app has loaded, stay on that browser/device, and do not sync
between devices. Clearing site data removes personal entries; seeded waffle
history remains in source. Saving failures keep the form open. Corrupt saved
data is left untouched rather than overwritten.

New source recipes remain in `app/recipes.ts`; optional collections, formula
labels and seeded snapshots are data-only additions. Liège-style V2 is a complete no-added-sugar dough experiment with kneading,
rising, proofing and cooking instructions; it is explicitly untested. The prior
pearl-sugar concept remains in history as shelved. No backend or authentication was added.

Validation: `pnpm test` builds and runs all scaling and experiment tests;
`pnpm exec tsc --noEmit` checks types. Browser QA needs the supported Sites
control-browser environment.

Artwork: the two new assets in `public/recipes/` were generated with the built-in
imagegen tool using layered torn-paper food collage, ivory paper, cobalt and
periwinkle cloth. Everyday depicts round golden batter waffles with butter;
Liège depicts plain golden brioche-style waffles without pearl sugar or glaze.
