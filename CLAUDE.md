# Portfolio Project — Allen K Lau

## Project Overview
This is Allen's personal portfolio site — a single-page timeline layout (`timeline.html`) showcasing career history and projects. It's a self-contained HTML file (no framework, no build step) with inline CSS and JavaScript.

## Site Structure
- **timeline.html** — the entire site (HTML + CSS + JS, all-in-one)
- **Assets/** — images and media used on the site
  - `Home_Page/MAI.png` — Microsoft AI / Copilot thumbnail
  - `Expressions Program/Expressions_Thumbnail.gif` — animated thumbnail for Expressions entry
- **References/** — design reference screenshots and videos (not displayed on the site)
- **Notes/** — project notes and screenshots
- **Fonts/** — (currently empty, fonts loaded via Google Fonts)

## Design System
- **Fonts**: Inter (body, UI), EB Garamond (descriptions, editorial text)
- **Colors**:
  - `--red: #c0392b` — accent (red line, active states, section labels)
  - `--text: #1c1c1c` — primary text
  - `--muted: #999` — secondary/description text
  - `--bg: #eae8e4` — warm off-white background
- **Font sizes**: Small and precise — 11px–15px range
- **Style**: Minimal, editorial, lots of whitespace

## Layout Anatomy
- **Red line**: Fixed horizontal line at 35vh — acts as a "scanner" as you scroll
- **Ruler**: Vertical tick marks on the left (at 26vw) — ticks bulge when near the red line
- **Nav**: Fixed top-right — Work | About | PLAY + animated bear SVG
- **Intro**: Top-left — name and tagline
- **Timeline rows**: Each has a left column (company name, dates) and right column (project entries)
- **Thumbnails**: 240×240px, grayscale by default, saturate when closest to red line, 3D tilt on hover

## Key Interactive Features
- Tick ruler bulge animation on scroll
- Company name "ghost" labels that pin to the red line
- "Boop" sound effect when scrolling past a new company
- Expressions thumbnail: static canvas → animated GIF on hover
- Bear SVG in nav with ear/nose/eye animations + speed slider + SVG/GIF export
- Thumbnails: grayscale → color (closest to red line), 3D tilt on hover

## Terminology
- **Product names** — the company/team labels on the left side of the timeline (e.g., "Microsoft AI", "Google Messages", "Google AI Research")
- **Top level nav** — the fixed nav bar at top-right (Work | About | PLAY + bear SVG + speed slider + SVG/GIF buttons)
- **Dates** — the year/time markers on the left side of the timeline (e.g., "Present", "2026", "2022")
- **Project groups** — the content blocks on the right side of the timeline, each containing a project title, optional thumbnail, and optional description/status text (e.g., "Copilot, MSAN" with MAI thumbnail, "Extensions Framework" with EXT thumbnail)
- **Current timeline line** — the fixed horizontal line at 35vh (previously called "red line") that acts as a scanner as you scroll on the main page; changes color per company section
- **Current description line (CDL)** — the same fixed horizontal line at 35vh on subpages (e.g., extensions.html); same position and style as the current timeline line
- **Project details** — the labels on the left side of the ticks on subpages (e.g., "Summary", "Basic interaction"); same styling and ghost-pinning behavior as product names on the main page
- **Details group** — the content blocks on the right side of the ticks on subpages, each containing a thumbnail image and descriptive text; analogous to project groups on the main page
- **Intro text** — the top-left block containing the name/title ("Allen K Lau — Designing interfaces & other curiosities") and the tagline below it

## Career Timeline (top to bottom)
1. **Microsoft AI** — Copilot, MSAN (Present) — Monetization
2. **Google Messages** — Extensions Framework — Making Messages an open platform
3. **Expressions Program** — Custom animated thumbnail entry
4. **Gemini in Messages** — AI integration (Shipped 2024)
5. **RCS & Chat Features** — Rich communication for Android
6. **Google Search** — Search Answers redesign
7. **Google** — Assistant, Proactive suggestions (2022)

## Coding Conventions
- Everything lives in one HTML file — no separate CSS/JS files
- CSS custom properties (variables) for layout and color
- Vanilla JavaScript — no libraries or frameworks
- Inline styles used occasionally for one-off positioning
- Comments use `<!-- ── Section ── -->` for HTML, `/* ─── Section ─── */` for CSS, `// ── Section ──` for JS

## When Making Changes
- Always edit `timeline.html` directly
- Preserve the minimal, editorial aesthetic
- Keep font sizes small (11–15px range)
- Maintain the warm, muted color palette
- Test scroll interactions — many elements depend on scroll position relative to the red line
- New entries follow the `.row > .row-left + .row-right > .entry` pattern
