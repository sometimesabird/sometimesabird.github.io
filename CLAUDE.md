# CLAUDE.md

## Project Overview

Personal academic website for George Beknazar-Yuzbashev, hosted on GitHub Pages at **www.george.by**. George is an Economics PhD student at Columbia University researching political economics, behavioral economics, and experimental economics.

## Architecture

Static HTML website — no build system, no SSG (Jekyll/Hugo), no templating engine. All pages are hand-coded HTML/CSS served directly by GitHub Pages.

## File Structure

| File | Role |
|---|---|
| `index.html` | Homepage: bio, navigation, social links |
| `research.html` | Research page: publications and working papers with collapsible accordions |
| `fun.html` | Lighthearted redirect page |
| `uninstall.html` | Browser extension uninstall callback (Firebase integration) |
| `styles.css` | Main stylesheet — Gruvbox dark color scheme |
| `bootstrap-styles.css` | Bootstrap v5.3.3 accordion component styles (minified, custom color overrides) |
| `favicon.ico` | Site icon |
| `CNAME` | Custom domain: `www.george.by` |
| `LICENSE` | GPL-3.0 |

## Tech Stack

- **HTML/CSS** — hand-written, no preprocessors
- **Bootstrap 5.3.3** — JS bundle loaded from CDN (accordion/collapse only)
- **Color scheme** — Gruvbox dark (`#282828` background, `#ebdbb2` text, `#cc241d` accent)
## Key Conventions

- Navigation is a simple three-link bar: Home / Research / Fun
- Research papers use Bootstrap accordion components for expandable abstracts
- Coauthor names link to their personal websites
- Social links (GitHub, Bitbucket, Twitter, Instagram) are in the homepage footer area
- The site is minimal by design — avoid adding unnecessary complexity, frameworks, or build steps

## Deployment

Push to `master` branch → GitHub Pages serves the site automatically at `www.george.by` (configured via `CNAME`).

## Things to Avoid

- Do not introduce build tools, bundlers, or static site generators
- Do not change the Gruvbox color scheme unless explicitly asked
- Do not add files to subdirectories — the site uses a flat structure
