# Portfolio Site Design

## Purpose

Replace kgalvan.dev — currently outdated — with a new personal/professional
site built from scratch. Audience is employers and other professional
contacts. Primary goal: read as deliberately designed and technically
credible, not templated or AI-generated ("not vibe-coded"). Secondary goal:
convey personality (understated — cafes, hockey-tough) without literal
imagery.

Implementation will be carried out by Fable (Claude model) based on a
follow-up implementation plan derived from this spec.

## Stack & Architecture

- **Framework:** Astro, static output. Zero JS shipped by default; React
  components used only for the few genuinely interactive elements (hover
  states, any future stat/interaction widgets).
- **Content:** Astro content collections, authored as MDX files in the repo
  (`src/content/projects/`, `src/content/blog/`). No CMS, no database, no
  backend — content changes are just file edits + git push.
- **Hosting:** Vercel. `kgalvan.dev` (existing domain) repointed to the
  Vercel deployment.
- **Repo:** New public GitHub repo named `kgalvan.dev`, replacing the old
  site's codebase.
- **Contact:** Plain links (email, LinkedIn, GitHub) — no contact form, no
  form backend, zero maintenance surface.
- **Resume:** PDF served from `public/`, linked via a "Download Résumé"
  button in the hero.

## Visual Identity

- **Theme:** Dark-only (no light mode toggle). Warm charcoal background
  (not cold blue-black), not a stark near-black terminal theme.
- **Accent:** Single ice-blue accent color, used for rules, links, hover
  states, and small label/kicker text. (Earlier explored an amber/ice
  duotone and an amber-only variant — ice-forward alone won out.)
- **Typography:** Bold sans-serif for headlines; monospace for
  kickers/labels/small callouts (a technical accent, used sparingly, not as
  a terminal-prompt gimmick).
- **Texture:** Subtle grain overlay for warmth, applied lightly.
- **Personality:** Conveyed through tone and copy voice and color
  temperature (warm dark, not sterile), never through literal icons
  (no hockey sticks, no coffee cups).
- **No homepage stat/metrics band.** An earlier version had a hard-numbers
  row (RLS policies, test count, rows analyzed) directly under the hero.
  Rejected: it was Conosi-specific, which made the homepage read like a
  single-company pitch, and a bold "impressive numbers" band is also a
  common tell of a templated/AI-generated portfolio. Real numbers instead
  live inside each Project case study, where they're contextualized.

## Hero Copy Direction

Headline: **"Full-stack, by necessity and by choice."**

Rationale: earlier drafts leaned on Conosi/mobile-app framing (kicker:
"Founding Engineer — Conosi"; lede centered on feed-ranking/release
pipelines), which read as narrowly "mobile dev" — inaccurate, since Kevin
also works across web and data (NASA Ames, the Yelp analytics project, and
web-facing work in the incoming ThermalWorks role). This headline turns
"why should I believe you're versatile" into an actual, true reason — being
the sole engineer on Conosi forced range across every layer — rather than
asserting "full-stack" as an empty buzzword. Kicker drops the company name
and leads with role + location instead (e.g. "Software Engineer — San Jose,
CA"). Exact final copy (headline, kicker, lede, CTA labels) is an
implementation-time detail Fable can execute against this direction, not
copy that needs to be pixel-frozen here.

## Sections & Order

Nav/page order: **Home → Experience → Projects → About → Blog → Contact**

Rationale for order: proof-of-work (Experience, then Projects) comes right
after the hero, since that's what a hiring manager scans for first. About
humanizes after credibility is established. Blog and Contact close the
page since Blog is thin at launch and Contact is naturally a terminal
action.

1. **Home** — hero (headline, kicker, lede, CTAs: "View Projects",
   "Download Résumé"). No stat row (see above).

2. **Experience** — lean timeline entries, dates + role + company +
   1-2 line summary each. Not a duplicate of the Projects deep-dive copy.
   - Founding Engineer, Conosi (05/2025–Present) — links through to the
     Conosi case study in Projects for detail.
   - Project Management Intern, NASA Ames Research Center (01/2022–05/2022).

3. **Projects** — deep case studies (problem → approach → outcome), pulled
   from and expanding on the actual resume bullets. Two entries at launch:
   - **Conosi** (flagship case study). Includes a real **"View on App
     Store"** link, since Conosi is live and shipped — this is a stronger
     credibility signal than a project card is, given it's the same
     product referenced in Experience but is deliberately treated as a
     project too because this is where its detailed narrative and stats
     (feed-ranking design, 79+ RLS policies, 173-test suite, etc.) belong.
   - **Yelp Open Dataset Challenge** — PySpark/Databricks/Tableau personal
     project, linking to the Databricks notebook and the published Tableau
     Public dashboards per the resume.

4. **About** — personal-angle copy, background and working style, written
   with restraint (no literal icons/imagery for the hockey/cafe angle).

5. **Blog** — scaffolded MDX pipeline (content collection + listing page +
   post template), launches with 0–1 seed posts. Empty-state handled (see
   Edge Cases). More posts added over time by adding MDX files.

6. **Contact** — plain links: email, LinkedIn, GitHub. No form.

## Content Sourcing

All Experience/Projects copy is drawn from Kevin's actual resume
(`KevinGalvanResume-2.pdf`) and the career-context memory in this project's
memory directory (`career-context-pointer.md`), not invented or generic
phrasing. Specific facts to preserve accuracy on:
- Conosi: institutional backing (SJSU College of Education, Harvard/USC law
  clinic legal support), the specific technical bullets (feed-ranking
  algorithm, RLS policy count, test suite size, release pipeline).
- NASA Ames: Chart.js visualizations, MongoDB pipeline, quantified impact
  (25% reduction in manual analysis time, 40% improvement in data
  accessibility).
- Yelp Open Dataset Challenge: dataset scale (8.6M reviews, 160K
  businesses, 8 metros), fuzzy-matching methodology and error rate (7.16%
  misclassification), geodesic filtering methodology, Tableau Public
  publication.

The incoming ThermalWorks role is **not** part of this site's launch
content — it is pre-offer and unconfirmed as of 2026-07-03, and should not
be published until Kevin confirms it's settled.

## Edge Cases

- Styled 404 page matching the site's visual identity (not a bare
  framework default).
- Blog index handles the zero-post state with a "more soon"-style
  placeholder rather than an empty/broken list.

## Verification Before Handoff

Before considering the implementation complete:
- Astro build succeeds with no errors.
- Lighthouse performance and accessibility checks pass, with particular
  attention to WCAG AA contrast for the ice-blue accent against the warm
  charcoal background (both for text and for interactive states).
- Responsive check at mobile, tablet, and desktop breakpoints.
- All resume-derived facts spot-checked against the source PDF for
  accuracy (dates, numbers, technology names).
- Resume PDF download link and all Contact/External links (App Store,
  Databricks notebook, Tableau Public, LinkedIn, GitHub) verified to
  resolve correctly.

## Explicitly Out of Scope (for this spec)

- Light mode / theme toggle.
- Contact form or any form backend.
- CMS or headless content backend.
- ThermalWorks content (pending confirmation).
- Final, locked hero/section copy — this spec fixes direction and
  rationale; exact wording is an implementation-time detail.
