# SHS Atlas

A student-made 3D map of Adlai E. Stevenson High School, replacement for the broken SHSmaps (Lincolnshire, IL): every building and level, every numbered room, hallways and walls, and walking directions between any two rooms. Unofficial — not a Stevenson or District 125 site.

## Layout
- `site/` — the published website: `index.html` (beta front page, from `src/home.html`) and `map.html` (the map). Both are generated; don't edit them by hand
- `src/` — the page shell (`shell.html`), app code (`main.js`, `nav.js`, `navui.js`, `glue.js`) and data (`plan.js` rooms/halls/walls, `pub.js` room facts, `halllabels.js`, `vlinks.js` stairs/elevators)
- `tools/trace/` — the scripts used to trace rooms and walls from the floor plans
- `docs/` — product and design notes (`PRODUCT.md`, `DESIGN.md`)
- `functions/_middleware.js` — beta password lock, checked on Cloudflare's servers (password in the `BETA_PASSWORD` variable)

## Build
```
python3 build.py
```
Then commit `site/`. Hosting auto-deploys from `site/` on every push to `main`.
