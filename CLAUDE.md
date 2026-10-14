# CLAUDE.md

## Project Overview

Personal academic website for George Beknazar-Yuzbashev, hosted on GitHub Pages at **www.george.by**. George is an Economics PhD student at Columbia University researching political economics, behavioral economics, and experimental economics.

## Architecture

Static HTML website — no build system, no SSG (Jekyll/Hugo), no templating engine. All pages are hand-coded HTML/CSS served directly by GitHub Pages. GitHub Pages still runs its default Jekyll pass on every push, which copies the pages through unchanged; That pass skips anything whose name starts with an underscore, which keeps `_testing/` off the published site; `_config.yml` excludes the remaining repo-only files.

## File Structure

| File | Role |
|---|---|
| `index.html` | Homepage: sidebar (photo, name, position, nav, contact) + job-market line, JMP card, selected work |
| `assets/headshot.jpg` | 512×512 headshot used in the sidebar and as the social-preview image |
| `assets/cv.pdf` | CV, linked from the sidebar button |
| `assets/jmp.pdf` | Job market paper, linked from the homepage card and research page; a copy of `~/Dropbox/Research/mental_health/paper/paper.pdf`, so re-copy it when the paper is revised |
| `research.html` | Research page: job market paper, publications, and working papers, each with a short summary and an expandable abstract |
| `fun.html` | Lighthearted redirect page |
| `styles.css` | Main stylesheet — Gruvbox dark color scheme |
| `favicon.ico` | Site icon |
| `CNAME` | Custom domain: `www.george.by` |
| `_config.yml` | Exclude list for repo-only files at the root (currently `CLAUDE.md`) |
| `_testing/` | Drafts, design experiments, and old page versions (e.g. `index2.html`, `research-old.html`, `design-*.html`, `text-*.html`, the old Bootstrap stylesheet); kept in the repo, never published |
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

## Deployment

Push to `master` branch → GitHub Pages serves the site automatically at `www.george.by` (configured via `CNAME`).

## Things to Avoid

- Do not introduce build tools, bundlers, or static site generators
- Do not delete `_config.yml`: it is configuration for GitHub Pages' built-in Jekyll pass, not an added build step, and removing it publishes `CLAUDE.md`
- Do not change the Gruvbox color scheme unless explicitly asked
- Keep published pages and the stylesheet flat at the root, and put PDFs and images in `assets/`. Put drafts, design experiments, and old page versions in `_testing/`, never at the root; the leading underscore is what keeps the folder unpublished, so do not rename it without one. Links from `_testing/` to root files need a `../` prefix
