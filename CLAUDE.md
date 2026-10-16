# CLAUDE.md

## Project Overview

Personal academic website for George Beknazar-Yuzbashev, hosted on GitHub Pages at **www.george.by**. George is an Economics PhD student at Columbia University researching political economics, behavioral economics, and experimental economics.

## Architecture

Static HTML website — no build system, no SSG (Jekyll/Hugo), no templating engine. All pages are hand-coded HTML/CSS served directly by GitHub Pages. GitHub Pages still runs its default Jekyll pass on every push, which copies the pages through unchanged; That pass skips anything whose name starts with an underscore, which keeps `_testing/` off the published site; `_config.yml` excludes the remaining repo-only files.

Every page can be drawn in one of six themes, chosen on `fun.html` and kept in the browser. The default is Neumorphic (`theme-neu.css`); the site's earlier flat look lives on as the Flat theme in `styles.css`. See **Themes** below before touching any page or stylesheet.

## File Structure

| File | Role |
|---|---|
| `index.html` | Homepage: sidebar (photo, name, position, nav, contact) + job-market line, JMP card, selected work |
| `assets/headshot.jpg` | 512×512 headshot used in the sidebar and as the social-preview image |
| `assets/headshot-full.jpg` | 1536×2304 uncropped version of the Columbia headshot (`headshot.jpg` is its top square), shown when the sidebar photo is clicked; lazy, so it only downloads once the sidebar photo is hovered, focused, or opened |
| `assets/cv.pdf` | CV, linked from the sidebar button |
| `assets/jmp.pdf` | Job market paper, linked from the homepage card and research page; a copy of `~/Dropbox/Research/mental_health/paper/paper.pdf`, so re-copy it when the paper is revised |
| `research.html` | Research page: job market paper, publications, and working papers, each with a short summary and an expandable abstract |
| `fun.html` | Fun page: a research line and the theme picker, two sections of equal rank under the heading |
| `styles.css` | The Flat theme, the site's earlier look: Gruvbox dark, flat panels. Holds the research and fun page rules too; the pages have no style blocks of their own |
| `theme-neu.css` | The Neumorphic theme, the default, and Neumorphic Reactive (soft raised and pressed surfaces, dark and light palettes, the pointer lamp's variables) |
| `theme-desk.css` | The Skeuomorphic Desk theme (leather blotter, paper, sticky note); Courier Prime from `assets/fonts/` |
| `theme-instrument.css` | The Skeuomorphic Instrument theme (brushed faceplate, bakelite keys, amber readout); IBM Plex Mono from `assets/fonts/` |
| `theme-glass.css` | The Liquid Glass theme: drifting pools of the Gruvbox accents behind sheets of nearly clear glass (backdrop blur, a light-catching rim, a pointer glint), with edge refraction through an SVG filter where the browser allows it |
| `theme.js` | Runs after every page: wires the picker on `fun.html` and swaps the stylesheet in place, adds what a theme needs beyond the shared markup (the neumorphic sun/moon key, the instrument's screws, the glass's refraction filter), and drives the neumorphic pointer lamp and the glass's pointer light |
| `glow.js` | Text brightens under the cursor, on every theme |
| `assets/fonts/` | Self-hosted latin woff2 subsets of Courier Prime (400, 700, 400 italic) and IBM Plex Mono (400, 500), with their SIL Open Font License texts |
| `favicon.ico` | Site icon |
| `CNAME` | Custom domain: `www.george.by` |
| `_config.yml` | Exclude list for repo-only files at the root (currently `CLAUDE.md`) |
| `_testing/` | Drafts, design experiments, and old page versions (e.g. `index2.html`, `research-old.html`, `design-*.html`, `text-*.html`, the old Bootstrap stylesheet; the `glass-*` Liquid Glass homepage studies with their gallery `glass-proposals.html`, of which 04b became `theme-glass.css`); kept in the repo, never published |
| `LICENSE` | GPL-3.0 |

## Tech Stack

- **HTML/CSS** — hand-written, no preprocessors
- **Color scheme** — Gruvbox dark (`#282828` background, `#ebdbb2` text, `#cc241d` accent)
## Key Conventions

- Navigation is a simple three-link bar: Home / Research / Fun
- Research papers use native `<details>` elements for expandable abstracts
- Coauthor names link to their personal websites
- Social links (GitHub, Bitbucket, Twitter, Instagram) are in the homepage footer area
- The site is minimal by design — avoid adding unnecessary complexity, frameworks, or build steps

## Themes

Six themes, picked on `fun.html` by name only: Neumorphic (the default) and Neumorphic Reactive (`theme-neu.css`; Reactive makes the pointer the only lamp), Flat (`styles.css`), Skeuomorphic Desk (`theme-desk.css`), Skeuomorphic Instrument (`theme-instrument.css`), Liquid Glass (`theme-glass.css`). The choice lives in `localStorage` as `theme`, with `theme-light` for the neumorphic dark/light key, and applies to every page.

- **One stylesheet per page view.** An identical inline script in the `<head>` of `index.html`, `research.html` and `fun.html` reads the choice, sets `html.theme-*` classes and the two metas, and `document.write`s that theme's `<link>` before paint, so no page is ever styled twice and no other theme flashes first; a `<noscript>` link loads `theme-neu.css`, and the `<html>` tag carries `class="theme-neu"` statically for that case (the script re-marks it). Keep the three copies of that script identical. `?theme=desk` or `?theme=neu&light` previews a theme without saving it.
- **The markup is shared.** All five stylesheets are written against the same HTML. Two wrappers exist for one theme each and are `display: contents` or unstyled everywhere else: `.stamp` around the job-market line (Desk's rubber stamp) and `.glass` around the JMP card's text (Instrument's window). `theme.js` adds and removes the rest (`.theme-toggle`, `.screws`, `.lens-filter` and the `html.lens-ok` mark), so the other themes never see them.
- **Every change to a page is a change to five stylesheets.** A new element or class must be drawn in `styles.css`, `theme-neu.css`, `theme-desk.css`, `theme-instrument.css` and `theme-glass.css`, and each has a print block to extend. Do not add page-specific `<style>` blocks to the pages: they would apply under every theme.
- **The lamp.** `theme.js` writes `--lx --ly --lm --la --lc` on each surface named in its `SURFACES` list; the "the lamp" block of `theme-neu.css` redeclares the shadow variables on the same list. A new neumorphic surface goes in both. `?lamp=x,y` pins the pointer at viewport coordinates for screenshots.
- **The glass light.** The same way for Liquid Glass: `theme.js` (`shine`) writes `--ang --px --py --lw` on each surface in its own `SURFACES` list, and "the material" block of `theme-glass.css` draws the rim and the glint from them on the same list. A new glass surface goes in both. Glass is never stacked on glass: only the sheets (sidebar, card, wells, status pill, badges) carry `backdrop-filter`; keys on them are tinted, rimmed shapes. The refraction (`backdrop-filter: url(#lens)`) is Chromium-only and gated by `html.lens-ok`; the plain blur is the fallback.
- The prototypes the themes were ported from (`_testing/neu-*`, `_testing/skeu-*`, `_testing/glass-*`) stay there for comparison and are not loaded by the site.

## Deployment

Push to `master` branch → GitHub Pages serves the site automatically at `www.george.by` (configured via `CNAME`).

## Things to Avoid

- Do not introduce build tools, bundlers, or static site generators
- Do not delete `_config.yml`: it is configuration for GitHub Pages' built-in Jekyll pass, not an added build step, and removing it publishes `CLAUDE.md`
- Do not change the Gruvbox color scheme unless explicitly asked
- Do not load fonts or anything else from third parties; the two web fonts the skeuomorphic themes use are self-hosted in `assets/fonts/`
- Keep published pages and the stylesheet flat at the root, and put PDFs and images in `assets/`. Put drafts, design experiments, and old page versions in `_testing/`, never at the root; the leading underscore is what keeps the folder unpublished, so do not rename it without one. Links from `_testing/` to root files need a `../` prefix
