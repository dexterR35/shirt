# Start the local app

The React/Vite application now exists. From this directory:

```sh
npm ci
npm run dev
```

Read `README.md` for commands, `docs/BASE_ANALYSIS.md` for the mandatory original PNG analysis, and `docs/STATUS.md` for actual coverage. The architecture document remains the product specification; its descriptions of the initial unimplemented handoff are historical.

All 735 teams are in the app. Every Home/Away slot has a discovery-search checkpoint, and all 297 workbook URLs were checked. Fifteen kit adaptations are downloadable; two are drafts and 1,453 still need visual research. Do not confuse search coverage with finished SVG coverage.

For continued implementation/research, retain AGENTS.md and the architecture/acceptance requirements. Start each remaining variant from its own file in `data/research/results`, follow the saved official leads, inspect the correct front image, record source/season/color evidence and create a versioned kit configuration. Never infer Away by swapping Home colors. Preserve the original source PNG, its vector light layer and canonical team IDs. Keep logos, sponsors and lettering out of exported shirts.

Run `npm run research:checkpoint`, `npm run catalog:build`, `npm test`, `npm run test:e2e` and `npm run build` after adding reviewed revisions. Do not overwrite an existing ready revision.
