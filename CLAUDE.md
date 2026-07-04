# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Kevin Galvan's personal portfolio site (kgalvan.dev) — Astro static site, TypeScript strict, MDX content collections. Built to spec from `docs/superpowers/specs/2026-07-03-portfolio-design.md`, implemented per `docs/superpowers/plans/2026-07-03-portfolio-site.md`. Read the spec and plan before making architectural changes — they contain the rationale (and explicit rejections, e.g. why there's no homepage stats band) behind decisions that aren't obvious from the code alone.

## Commands

- `npm run dev` — local dev server
- `npm run build` — `astro build`; also the schema-validation gate for content collections (Zod errors on MDX frontmatter surface here, not in `check`)
- `npm run check` — `astro check`; type-checks `.astro` files and props
- `npm run test` — `vitest run` (all tests)
- `npm run test -- src/lib/blog.test.ts` — run a single test file
- `npm run preview` — serve the built `dist/` output

## Architecture

**Content model:** `src/content.config.ts` defines two Astro content collections, both loaded via `glob` from MDX files — `projects` (`src/content/projects/*.mdx`, schema includes `order` for manual sort and an optional `externalLink`) and `blog` (`src/content/blog/*.mdx`, includes `draft`). Experience is deliberately **not** a collection — it's a plain typed array in `src/data/experience.ts`, since there are only two lean entries with no prose body. Adding a blog post is a file drop into `src/content/blog/`; no code change needed.

**No React/UI framework.** `@astrojs/react` is intentionally not installed. Every interactive element in the approved design (nav hover, card border hover, link hover) is pure CSS `:hover` — see the plan's Global Constraints for the explicit YAGNI reasoning. Only add the integration when a feature genuinely needs client-side JS, not preemptively.

**Testing is split by layer**, not applied uniformly:
- `src/lib/*.ts` and `src/data/*.ts` (pure logic, no `astro:content` import) get real Vitest unit tests, e.g. `src/lib/blog.ts` / `blog.test.ts`.
- `.astro` components, pages, and content collections are gated by `npm run check` (prop/type errors) + `npm run build` (render errors, Zod schema failures on frontmatter) instead of component-level unit tests — this avoids coupling to Astro's version-sensitive content-collection test APIs.

**Design tokens** live as CSS custom properties in `src/styles/global.css` (`--color-bg`, `--color-text`, `--color-accent`, `--font-sans`, `--font-mono`), imported once by `src/layouts/BaseLayout.astro`. Theme is dark-only by design — do not add a light-mode toggle or a second token set.

**Page structure:** homepage (`src/pages/index.astro`) assembles section components in a fixed order — Nav → Hero → ExperienceTimeline → ProjectsTeaser → About → Footer(Contact) — matching the nav's `Home → Experience → Projects → About → Blog → Contact` order. Projects and Blog posts each get a dynamic `[slug].astro` route rendering the MDX body via `render()`. Conosi intentionally appears in both Experience (dates-only) and Projects (full case study + App Store link) — this duplication is deliberate, not a bug.

**Content accuracy constraint:** all Experience/Projects copy must trace back to `KevinGalvanResume-2.pdf` (dates, numbers, tech names) — don't invent or generalize resume-derived facts. ThermalWorks is explicitly excluded from this site's content (pre-offer, unconfirmed) until Kevin says otherwise.

## In-progress implementation

This repo is being built task-by-task per the plan using the `subagent-driven-development` workflow. `.superpowers/sdd/progress.md` is the ledger of which plan tasks are actually committed — trust it (and `git log`) over assumptions about how much of the site exists. Per-task briefs/reports/review diffs also live under `.superpowers/sdd/`.
