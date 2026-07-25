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
