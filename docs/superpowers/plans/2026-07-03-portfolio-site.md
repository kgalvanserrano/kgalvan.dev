# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the new kgalvan.dev portfolio site per `docs/superpowers/specs/2026-07-03-portfolio-design.md`.

**Architecture:** Astro static site, MDX content collections for Projects and Blog, a plain TypeScript data module for Experience (no collection needed for two lean entries), single dark "ice-forward" theme, deployed to Vercel with the existing `kgalvan.dev` domain repointed.

**Tech Stack:** Astro (latest stable, static output), TypeScript (strict), MDX, Vitest (for logic-only unit tests — see testing note below). No React/UI framework integration — see decision note below.

## Global Constraints

- Dark-only theme. No light mode toggle. (spec)
- No contact form, no CMS, no backend/database. Content is files in the repo. (spec)
- Single accent color: ice-blue. No amber, no duotone. (spec)
- No homepage stats/metrics band. Numbers live inside Project case studies only. (spec)
- Hero headline is **"Full-stack, by necessity and by choice."** Kicker leads with role + location, not company name. (spec)
- Section order: Home → Experience → Projects → About → Blog → Contact. (spec)
- Conosi appears in both Experience (lean, dates-only) and Projects (full case study + "View on App Store" link). (spec)
- ThermalWorks is **not** published anywhere on this site — pre-offer, unconfirmed. (spec)
- Resume-derived facts (dates, numbers, tech names) must match `KevinGalvanResume-2.pdf` exactly. (spec)
- **Engineering decision — no React/UI framework:** the spec allows "React islands... for the few interactive bits," but every interactive element in the approved mockups (nav hover, card border hover, link hover) is pure CSS `:hover`. No task in this plan needs client-side JS. Per YAGNI, `@astrojs/react` is **not** installed. If a future feature genuinely needs client-side interactivity, add the integration then — don't install unused dependencies now.
- **Engineering decision — testing strategy:** this is a static-content site with almost no runtime logic. Tasks split into two kinds of "test":
  - **Logic-only modules** (`src/lib/*.ts`, `src/data/*.ts`) that don't touch the `astro:content` runtime: real Vitest unit tests, plain TS in/out, no Astro-specific mocking.
  - **Astro components/pages/content collections**: the test gate is `npm run check` (`astro check`, catches prop-type and schema errors) followed by `npm run build` (`astro build`, catches render errors and Zod schema-validation failures on content frontmatter). This avoids coupling the plan to Astro's content-collection test APIs, which are more version-sensitive than the stable `astro check` / `astro build` commands. This matches the spec's own Verification section, which never asked for component-level unit tests.

---

## File Structure

```
package.json
astro.config.mjs
tsconfig.json
vitest.config.ts
public/
  resume.pdf
src/
  content.config.ts
  data/
    experience.ts
  lib/
    blog.ts
  styles/
    global.css
  layouts/
    BaseLayout.astro
  components/
    Nav.astro
    Footer.astro
    Hero.astro
    ExperienceTimeline.astro
    ProjectCard.astro
    ProjectsTeaser.astro
    About.astro
  content/
    projects/
      conosi.mdx
      yelp-open-dataset-challenge.mdx
    blog/
      (empty at launch)
  pages/
    index.astro
    404.astro
    projects/
      [slug].astro
    blog/
      index.astro
      [slug].astro
docs/
  (this plan + spec, already present)
```

---

### Task 1: Project scaffold & tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`
- Create: `.gitignore` (already exists from spec commit — verify it covers `node_modules/`, `dist/`, `.astro/`)

**Interfaces:**
- Produces: an Astro project scaffold with `npm run dev`, `npm run build`, `npm run check`, `npm run test` scripts available to every later task.

- [ ] **Step 1: Scaffold the Astro project**

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --skip-houston
```

If the CLI prompts interactively despite the flags (version drift), answer: template = "Empty", TypeScript = "Strict", install dependencies = "No" (we'll install explicitly next), git = "No" (already a git repo).

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install --save-dev vitest
```

- [ ] **Step 3: Add Vitest config**

`vitest.config.ts`:
```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Add npm scripts**

Edit `package.json` `"scripts"` to include:
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  }
}
```

- [ ] **Step 5: Verify the scaffold builds and tests run**

Run: `npm run build`
Expected: build succeeds, `dist/` created.

Run: `npm run test`
Expected: "No test files found" (exit code non-zero from Vitest is fine here — no tests exist yet; if it hard-fails the process, add a placeholder `src/lib/.gitkeep`-style empty test dir is NOT needed, just confirm the command runs without a config error).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts src public
git commit -m "chore: scaffold Astro project with TypeScript strict and Vitest"
```

---

### Task 2: Design tokens & base layout

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: CSS custom properties (`--color-bg`, `--color-text`, `--color-accent`, `--font-sans`, `--font-mono`) usable by every component. `BaseLayout.astro` accepts props `{ title: string; description: string }` and renders `<slot />` for page content, importing `global.css`.

- [ ] **Step 1: Write global design tokens**

`src/styles/global.css`:
```css
:root {
  --color-bg: #17130f;
  --color-text: #ece7de;
  --color-text-dim: rgba(236, 231, 222, 0.6);
  --color-border: rgba(255, 255, 255, 0.08);
  --color-accent: #7dc4e0;
  --font-sans: -apple-system, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', Menlo, monospace;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}

body {
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.05;
  background-image: radial-gradient(circle, #fff 1px, transparent 1px);
  background-size: 3px 3px;
  pointer-events: none;
  z-index: 0;
}

a {
  color: inherit;
}

a:hover {
  color: var(--color-accent);
}
```

- [ ] **Step 2: Write BaseLayout**

`src/layouts/BaseLayout.astro`:
```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Verify type-check passes**

Run: `npm run check`
Expected: no errors (BaseLayout has no consumers yet, but should type-check standalone).

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro
git commit -m "feat: add design tokens and base layout"
```

---

### Task 3: Content collections config + seed Project entries

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/projects/conosi.mdx`
- Create: `src/content/projects/yelp-open-dataset-challenge.mdx`

**Interfaces:**
- Produces: a `projects` collection with schema `{ title: string; summary: string; dateRange: string; order: number; externalLink?: { label: string; href: string } }`, consumed later by `ProjectsTeaser.astro` and `pages/projects/[slug].astro`.

- [ ] **Step 1: Define the content config**

`src/content.config.ts`:
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    dateRange: z.string(),
    order: z.number(),
    externalLink: z
      .object({
        label: z.string(),
        href: z.string().url(),
      })
      .optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
```

- [ ] **Step 2: Verify a missing required field fails the build (red)**

Create a temporary throwaway file `src/content/projects/_tmp-invalid.mdx`:
```mdx
---
title: "Temp Invalid Entry"
dateRange: "2020"
order: 99
---

Body text.
```

Run: `npm run build`
Expected: FAIL — Zod validation error citing the missing `summary` field on `_tmp-invalid.mdx`.

Delete the temp file: `rm src/content/projects/_tmp-invalid.mdx`

- [ ] **Step 3: Write the real Conosi entry**

`src/content/projects/conosi.mdx`:
```mdx
---
title: "Conosi"
summary: "A consumer EdTech platform taken solo from concept to App Store submission, with institutional backing from SJSU's College of Education and legal support from Harvard and USC law clinics."
dateRange: "05/2025 - Present"
order: 1
externalLink:
  label: "View on App Store"
  href: "https://apps.apple.com/app/conosi"
---

## Problem

Conosi needed a feed that stayed fast and relevant as its user base grew,
a data layer that couldn't leak one university community's content into
another's, and a release process that didn't depend on anyone but me.

## Approach

- Designed and shipped a custom feed-ranking algorithm — engagement
  scoring, recency decay, follow multipliers, and fresh-post promotion —
  over-fetching 3x candidates server-side and ranking down to a top-20
  feed, keeping client payloads lean for fast scroll performance.
- Optimized feed rendering and media handling with memoized post
  components, session-level view caching, and on-device HEIC-to-JPEG
  transcoding, cutting image payload sizes and keeping scroll performance
  smooth on iOS.
- Owned data security end-to-end: authored 79+ Row-Level Security
  policies across 3 audit rounds, and enforced atomic server-side
  operations to eliminate race conditions in high-frequency interactions
  (likes, follows, DM creation).
- Built real-time 1:1 messaging from scratch, including
  deduplication-safe conversation creation under concurrent requests.
- Implemented layered content moderation — client-side filtering plus
  server-side validation — so no unsafe post reaches the database.

## Outcome

Built the full release pipeline solo: TypeScript strict mode, a
173-test Jest suite, EAS production builds, TestFlight distribution, and
App Store submission. Conosi is live today.

**Stack:** React Native, Expo, TypeScript, Supabase (PostgreSQL, Row-Level
Security), Jest, EAS Build.
```

> **Verify before implementation:** confirm the real App Store URL for
> Conosi with Kevin before this goes live — the `href` above is a
> placeholder shape only, not a confirmed link. Do not publish an
> unconfirmed URL.

- [ ] **Step 4: Write the real Yelp Open Dataset Challenge entry**

`src/content/projects/yelp-open-dataset-challenge.mdx`:
```mdx
---
title: "Yelp Open Dataset Challenge"
summary: "A personal data-analytics project investigating whether college proximity skews restaurant ratings, using PySpark on Databricks and Tableau."
dateRange: "01/2022 - 06/2022"
order: 2
externalLink:
  label: "View Tableau Dashboard"
  href: "https://public.tableau.com/"
---

## Problem

Does being near a college campus change how a restaurant gets rated?
Answering that at scale meant cleaning and joining two messy,
independent datasets — Yelp reviews and college campus locations — across
8 metro areas.

## Approach

- Processed 8.6M Yelp reviews and 160K business profiles across 8 metro
  areas using PySpark on Databricks.
- Implemented two-pass fuzzy matching using Levenshtein distance to
  classify 49K+ restaurants as chain or independent, identifying and
  correcting a 7.16% misclassification rate.
- Computed geodesic distance pairings between 49K restaurants and 1,044
  college campuses using geopy, filtering to 38K+ restaurants within 3.5
  miles of a campus for the final analysis.

## Outcome

Built interactive Tableau dashboards — heatmaps, box plots — published
to Tableau Public, presenting findings across all 8 metro areas for
stakeholder review.

**Stack:** PySpark, Spark SQL, Databricks, Tableau, geopy.
```

> **Verify before implementation:** confirm the real Tableau Public
> dashboard URL with Kevin before this goes live — the `href` above is a
> placeholder shape only.

- [ ] **Step 5: Verify the real entries pass the build (green)**

Run: `npm run build`
Expected: PASS — both entries validate against the schema.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/content/projects
git commit -m "feat: add projects content collection with Conosi and Yelp case studies"
```

---

### Task 4: Blog collection + sorting util

**Files:**
- Create: `src/lib/blog.ts`
- Test: `src/lib/blog.test.ts`
- Modify: `src/content.config.ts` (already has `blog` collection from Task 3 — no change needed, this task just adds the consuming util)

**Interfaces:**
- Produces: `getSortedPosts(entries: BlogEntry[]): BlogEntry[]` — filters out `draft: true` entries, sorts remaining by `pubDate` descending. Type `BlogEntry = { data: { title: string; description: string; pubDate: Date; draft: boolean }; id: string }`, matching the shape of a `CollectionEntry<'blog'>` closely enough for the pure function's purposes (the function only reads `.data`, so it accepts any object with that shape — no `astro:content` import needed, keeping this a dependency-free unit test).
- Consumed by: `pages/blog/index.astro` (Task 13).

- [ ] **Step 1: Write the failing test**

`src/lib/blog.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getSortedPosts, type BlogEntry } from './blog';

function makePost(overrides: Partial<BlogEntry['data']> & { id: string }): BlogEntry {
  const { id, ...data } = overrides;
  return {
    id,
    data: {
      title: 'Untitled',
      description: '',
      pubDate: new Date('2026-01-01'),
      draft: false,
      ...data,
    },
  };
}

describe('getSortedPosts', () => {
  it('sorts posts by pubDate descending', () => {
    const older = makePost({ id: 'older', pubDate: new Date('2026-01-01') });
    const newer = makePost({ id: 'newer', pubDate: new Date('2026-06-01') });

    const result = getSortedPosts([older, newer]);

    expect(result.map((p) => p.id)).toEqual(['newer', 'older']);
  });

  it('excludes draft posts', () => {
    const published = makePost({ id: 'published', draft: false });
    const draft = makePost({ id: 'draft', draft: true });

    const result = getSortedPosts([published, draft]);

    expect(result.map((p) => p.id)).toEqual(['published']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/blog.test.ts`
Expected: FAIL — `Cannot find module './blog'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

`src/lib/blog.ts`:
```ts
export interface BlogEntry {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    draft: boolean;
  };
}

export function getSortedPosts<T extends BlogEntry>(entries: T[]): T[] {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/blog.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/blog.ts src/lib/blog.test.ts
git commit -m "feat: add blog post sorting/filtering util with tests"
```

---

### Task 5: Experience data module

**Files:**
- Create: `src/data/experience.ts`
- Test: `src/data/experience.test.ts`

**Interfaces:**
- Produces: `experienceEntries: ExperienceEntry[]` where `ExperienceEntry = { role: string; org: string; dateRange: string; summary: string; caseStudyHref?: string }`, ordered most-recent-first.
- Consumed by: `ExperienceTimeline.astro` (Task 8).

- [ ] **Step 1: Write the failing test**

`src/data/experience.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { experienceEntries } from './experience';

describe('experienceEntries', () => {
  it('lists Conosi first, most recent role first', () => {
    expect(experienceEntries[0].org).toBe('Conosi');
    expect(experienceEntries[0].role).toBe('Founding Engineer');
  });

  it('includes the NASA Ames internship with accurate dates', () => {
    const nasa = experienceEntries.find((e) => e.org === 'NASA Ames Research Center');
    expect(nasa).toBeDefined();
    expect(nasa?.dateRange).toBe('01/2022 - 05/2022');
  });

  it('links the Conosi entry to its Projects case study', () => {
    const conosi = experienceEntries.find((e) => e.org === 'Conosi');
    expect(conosi?.caseStudyHref).toBe('/projects/conosi');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/data/experience.test.ts`
Expected: FAIL — `Cannot find module './experience'`.

- [ ] **Step 3: Write the implementation**

`src/data/experience.ts`:
```ts
export interface ExperienceEntry {
  role: string;
  org: string;
  dateRange: string;
  summary: string;
  caseStudyHref?: string;
}

export const experienceEntries: ExperienceEntry[] = [
  {
    role: 'Founding Engineer',
    org: 'Conosi',
    dateRange: '05/2025 - Present',
    summary:
      'Sole engineer taking a consumer EdTech platform from concept to App Store submission.',
    caseStudyHref: '/projects/conosi',
  },
  {
    role: 'Project Management Intern',
    org: 'NASA Ames Research Center',
    dateRange: '01/2022 - 05/2022',
    summary:
      'Built data visualizations and a MongoDB pipeline for spacecraft mission data on a 6-person cross-functional team.',
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/data/experience.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/experience.ts src/data/experience.test.ts
git commit -m "feat: add experience data module with tests"
```

---

### Task 6: Nav and Footer components

**Files:**
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`

**Interfaces:**
- Produces: `Nav.astro` (no props — static links to `/#experience`, `/#projects`, `/#about`, `/blog`, `/#contact`) and `Footer.astro` (no props — renders `id="contact"`, static links to email/LinkedIn/GitHub). Both consumed by `BaseLayout.astro` (Task 2, wired in Task 11) or directly by `index.astro`.

- [ ] **Step 1: Write Nav**

`src/components/Nav.astro`:
```astro
<nav class="nav">
  <a class="logo" href="/">KG</a>
  <div class="links">
    <a href="/#experience">Experience</a>
    <a href="/#projects">Projects</a>
    <a href="/#about">About</a>
    <a href="/blog">Blog</a>
    <a href="/#contact">Contact</a>
  </div>
</nav>

<style>
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 22px 48px;
    position: sticky;
    top: 0;
    background: rgba(23, 19, 15, 0.85);
    backdrop-filter: blur(6px);
    z-index: 5;
    border-bottom: 1px solid var(--color-border);
  }

  .logo {
    font-weight: 800;
    letter-spacing: -0.01em;
    text-decoration: none;
  }

  .links {
    display: flex;
    gap: 28px;
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  .links a {
    text-decoration: none;
  }
</style>
```

- [ ] **Step 2: Write Footer**

`src/components/Footer.astro`:
```astro
<footer class="footer" id="contact">
  <div>&copy; Kevin Galvan</div>
  <div class="links">
    <a href="mailto:kevin.galvanserrano@gmail.com">Email</a>
    <a href="https://linkedin.com/in/kevingalvanserrano">LinkedIn</a>
    <a href="https://github.com/kgalvanserrano">GitHub</a>
  </div>
</footer>

<style>
  .footer {
    padding: 44px 48px;
    border-top: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    opacity: 0.6;
  }

  .links {
    display: flex;
    gap: 22px;
  }

  .links a {
    text-decoration: none;
  }
</style>
```

- [ ] **Step 3: Verify type-check and build**

Run: `npm run check`
Expected: no errors.

Run: `npm run build`
Expected: PASS (components aren't consumed by a page yet, but should compile standalone without errors — Astro's build only errors on files actually reachable from a page, so this step confirms no syntax errors via `check` primarily).

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.astro src/components/Footer.astro
git commit -m "feat: add Nav and Footer components"
```

---

### Task 7: Hero component

**Files:**
- Create: `src/components/Hero.astro`

**Interfaces:**
- Produces: `Hero.astro` (no props — static copy per the spec's hero direction). Consumed by `index.astro` (Task 11).

- [ ] **Step 1: Write Hero**

`src/components/Hero.astro`:
```astro
<section class="hero">
  <div class="kicker">SOFTWARE ENGINEER — SAN JOSE, CA</div>
  <div class="rule"></div>
  <h1>Full-stack, by necessity<br />and by <span class="accent">choice</span>.</h1>
  <p class="lede">
    Kevin Galvan. Solo founder work means every layer is your problem —
    mobile, backend, data. I've stayed there on purpose. Currently
    building at Conosi.
  </p>
  <div class="cta-row">
    <a class="btn primary" href="/#projects">View Projects</a>
    <a class="btn ghost" href="/resume.pdf" download>Download Résumé</a>
  </div>
</section>

<style>
  .hero {
    padding: 90px 48px 60px 48px;
  }

  .kicker {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-accent);
    letter-spacing: 0.08em;
    margin-bottom: 18px;
  }

  .rule {
    width: 46px;
    height: 3px;
    background: var(--color-accent);
    margin-bottom: 20px;
  }

  h1 {
    font-size: 52px;
    font-weight: 800;
    line-height: 1.06;
    letter-spacing: -0.015em;
    margin: 0 0 20px 0;
    max-width: 700px;
  }

  .accent {
    color: var(--color-accent);
  }

  .lede {
    font-size: 17px;
    opacity: 0.68;
    max-width: 480px;
    line-height: 1.55;
    margin-bottom: 34px;
  }

  .cta-row {
    display: flex;
    gap: 16px;
  }

  .btn {
    font-size: 13px;
    letter-spacing: 0.03em;
    padding: 12px 22px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
  }

  .btn.primary {
    background: var(--color-accent);
    color: var(--color-bg);
  }

  .btn.ghost {
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--color-text);
  }
</style>
```

- [ ] **Step 2: Verify type-check passes**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: add Hero component"
```

---

### Task 8: ExperienceTimeline component

**Files:**
- Create: `src/components/ExperienceTimeline.astro`

**Interfaces:**
- Consumes: `experienceEntries` from `src/data/experience.ts` (Task 5).
- Produces: `ExperienceTimeline.astro` (no props), renders `id="experience"` section. Consumed by `index.astro` (Task 11).

- [ ] **Step 1: Write ExperienceTimeline**

`src/components/ExperienceTimeline.astro`:
```astro
---
import { experienceEntries } from '../data/experience';
---

<section class="section" id="experience">
  <div class="eyebrow">CAREER</div>
  <h2>Experience</h2>
  <div class="timeline">
    {
      experienceEntries.map((entry) => (
        <div class="item">
          <div class="date">{entry.dateRange}</div>
          <div class="body">
            <h3>
              {entry.role}, {entry.org}
            </h3>
            <p>{entry.summary}</p>
            {entry.caseStudyHref && <a href={entry.caseStudyHref}>Read the case study →</a>}
          </div>
        </div>
      ))
    }
  </div>
</section>

<style>
  .section {
    padding: 60px 48px;
    border-top: 1px solid var(--color-border);
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-accent);
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }

  h2 {
    font-size: 26px;
    font-weight: 800;
    margin: 0 0 26px 0;
  }

  .timeline {
    display: flex;
    flex-direction: column;
  }

  .item {
    display: flex;
    gap: 24px;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .item:last-child {
    border-bottom: none;
  }

  .date {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-accent);
    width: 130px;
    flex-shrink: 0;
    padding-top: 2px;
  }

  .body h3 {
    margin: 0 0 4px 0;
    font-size: 15.5px;
  }

  .body p {
    margin: 0 0 6px 0;
    opacity: 0.6;
    font-size: 13px;
  }

  .body a {
    font-size: 13px;
    text-decoration: none;
    color: var(--color-accent);
  }
</style>
```

- [ ] **Step 2: Verify type-check passes**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ExperienceTimeline.astro
git commit -m "feat: add ExperienceTimeline component"
```

---

### Task 9: ProjectCard + ProjectsTeaser components

**Files:**
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/ProjectsTeaser.astro`

**Interfaces:**
- Consumes: `projects` collection via `getCollection('projects')` (Task 3).
- Produces: `ProjectCard.astro` props `{ title: string; summary: string; href: string; externalLink?: { label: string; href: string } }`. `ProjectsTeaser.astro` (no props), renders `id="projects"` section, sorted by `data.order` ascending. Consumed by `index.astro` (Task 11).

- [ ] **Step 1: Write ProjectCard**

`src/components/ProjectCard.astro`:
```astro
---
interface Props {
  title: string;
  summary: string;
  href: string;
  externalLink?: { label: string; href: string };
}

const { title, summary, href, externalLink } = Astro.props;
---

<div class="card">
  <a class="main" href={href}>
    <h3>{title}</h3>
    <p>{summary}</p>
  </a>
  {
    externalLink && (
      <a class="external" href={externalLink.href} target="_blank" rel="noopener noreferrer">
        {externalLink.label} ↗
      </a>
    )
  }
</div>

<style>
  .card {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 26px 30px;
    transition: border-color 0.15s;
  }

  .card:hover {
    border-color: var(--color-accent);
  }

  .main {
    display: block;
    text-decoration: none;
    margin-bottom: 10px;
  }

  h3 {
    margin: 0 0 6px 0;
    font-size: 19px;
    color: var(--color-text);
  }

  p {
    margin: 0;
    opacity: 0.6;
    font-size: 13.5px;
    max-width: 480px;
  }

  .external {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-accent);
    text-decoration: none;
  }
</style>
```

- [ ] **Step 2: Write ProjectsTeaser**

`src/components/ProjectsTeaser.astro`:
```astro
---
import { getCollection } from 'astro:content';
import ProjectCard from './ProjectCard.astro';

const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
---

<section class="section" id="projects">
  <div class="eyebrow">SELECTED WORK</div>
  <h2>Projects</h2>
  <div class="projects">
    {
      projects.map((project) => (
        <ProjectCard
          title={project.data.title}
          summary={project.data.summary}
          href={`/projects/${project.id}`}
          externalLink={project.data.externalLink}
        />
      ))
    }
  </div>
</section>

<style>
  .section {
    padding: 60px 48px;
    border-top: 1px solid var(--color-border);
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-accent);
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }

  h2 {
    font-size: 26px;
    font-weight: 800;
    margin: 0 0 26px 0;
  }

  .projects {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
</style>
```

- [ ] **Step 3: Verify type-check and build**

Run: `npm run check`
Expected: no errors.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectCard.astro src/components/ProjectsTeaser.astro
git commit -m "feat: add ProjectCard and ProjectsTeaser components"
```

---

### Task 10: About component

**Files:**
- Create: `src/components/About.astro`

**Interfaces:**
- Produces: `About.astro` (no props), renders `id="about"` section. Consumed by `index.astro` (Task 11).

- [ ] **Step 1: Write About**

`src/components/About.astro`:
```astro
<section class="section" id="about">
  <div class="eyebrow">WHO'S BUILDING THIS</div>
  <h2>About</h2>
  <p>
    I'm a first-generation college graduate (BS, Management Information
    Systems, San Jose State University) who spent four years chasing a
    tech career the hard way — building Conosi solo, from an empty repo
    to the App Store, before landing a team-based engineering role.
    Most of my best thinking happens away from a desk — a laptop, a
    coffee, and a few hours is usually all it takes. Outside of
    engineering I play hockey, which has a way of teaching you that
    speed without control just means you fall down faster.
  </p>
</section>

<style>
  .section {
    padding: 60px 48px;
    border-top: 1px solid var(--color-border);
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-accent);
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }

  h2 {
    font-size: 26px;
    font-weight: 800;
    margin: 0 0 26px 0;
  }

  p {
    opacity: 0.65;
    font-size: 14px;
    max-width: 560px;
    line-height: 1.6;
  }
</style>
```

> **Verify before implementation:** this is the one section with real
> autobiographical claims (first-gen grad, hockey, works from cafes).
> Confirm the exact wording with Kevin before publishing — this plan's
> copy is a direction, not final, per the spec's note that hero/section
> copy is an implementation-time detail.

- [ ] **Step 2: Verify type-check passes**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/About.astro
git commit -m "feat: add About component"
```

---

### Task 11: Homepage assembly

**Files:**
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: `BaseLayout` (Task 2), `Nav`/`Footer` (Task 6), `Hero` (Task 7), `ExperienceTimeline` (Task 8), `ProjectsTeaser` (Task 9), `About` (Task 10).

- [ ] **Step 1: Write the homepage**

`src/pages/index.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import ExperienceTimeline from '../components/ExperienceTimeline.astro';
import ProjectsTeaser from '../components/ProjectsTeaser.astro';
import About from '../components/About.astro';
import Footer from '../components/Footer.astro';
---

<BaseLayout
  title="Kevin Galvan — Software Engineer"
  description="Founding Engineer at Conosi. Mobile, web, and data — I build across the whole stack."
>
  <Nav />
  <Hero />
  <ExperienceTimeline />
  <ProjectsTeaser />
  <About />
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Verify build succeeds**

Run: `npm run build`
Expected: PASS — `dist/index.html` generated.

- [ ] **Step 3: Manual check — nav anchors resolve**

Run: `npm run preview` and open the printed local URL. Click each Nav
link (Experience, Projects, About) and confirm the page scrolls to the
matching section. Click Blog and Contact and confirm they navigate to
`/blog` and scroll to the footer, respectively. Stop the preview server
(Ctrl+C) when done.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: assemble homepage from Hero, Experience, Projects, About sections"
```

---

### Task 12: Project case-study page template

**Files:**
- Create: `src/pages/projects/[slug].astro`

**Interfaces:**
- Consumes: `projects` collection (Task 3), `BaseLayout`, `Nav`, `Footer`.

- [ ] **Step 1: Write the dynamic route**

`src/pages/projects/[slug].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---

<BaseLayout title={`${project.data.title} — Kevin Galvan`} description={project.data.summary}>
  <Nav />
  <article class="case-study">
    <div class="meta">{project.data.dateRange}</div>
    <h1>{project.data.title}</h1>
    {
      project.data.externalLink && (
        <a class="external" href={project.data.externalLink.href} target="_blank" rel="noopener noreferrer">
          {project.data.externalLink.label} ↗
        </a>
      )
    }
    <div class="prose">
      <Content />
    </div>
  </article>
  <Footer />
</BaseLayout>

<style>
  .case-study {
    padding: 70px 48px;
    max-width: 760px;
  }

  .meta {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-accent);
    margin-bottom: 12px;
  }

  h1 {
    font-size: 34px;
    font-weight: 800;
    margin: 0 0 16px 0;
  }

  .external {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--color-accent);
    text-decoration: none;
    margin-bottom: 30px;
  }

  .prose {
    opacity: 0.85;
    line-height: 1.7;
    font-size: 15px;
  }

  .prose h2 {
    font-size: 19px;
    margin-top: 34px;
  }
</style>
```

- [ ] **Step 2: Verify both case studies build**

Run: `npm run build`
Expected: PASS — `dist/projects/conosi/index.html` and
`dist/projects/yelp-open-dataset-challenge/index.html` both generated.

- [ ] **Step 3: Manual check — App Store link present on Conosi**

Run: `npm run preview`, open `/projects/conosi`, confirm the "View on App
Store" link renders and points to the URL in the frontmatter. Stop the
preview server when done.

- [ ] **Step 4: Commit**

```bash
git add src/pages/projects
git commit -m "feat: add project case-study page template"
```

---

### Task 13: Blog pages + 404

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`
- Create: `src/pages/404.astro`

**Interfaces:**
- Consumes: `blog` collection (Task 3), `getSortedPosts` (Task 4), `BaseLayout`, `Nav`, `Footer`.

- [ ] **Step 1: Write the blog index with empty-state handling**

`src/pages/blog/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';
import { getSortedPosts } from '../../lib/blog';

const allPosts = await getCollection('blog');
const posts = getSortedPosts(allPosts);
---

<BaseLayout title="Blog — Kevin Galvan" description="Writing on engineering, data, and building solo.">
  <Nav />
  <section class="section">
    <div class="eyebrow">WRITING</div>
    <h1>Blog</h1>
    {
      posts.length === 0 ? (
        <p class="empty">Nothing published yet — check back soon.</p>
      ) : (
        <div class="posts">
          {posts.map((post) => (
            <a class="post" href={`/blog/${post.id}`}>
              <h3>{post.data.title}</h3>
              <p>{post.data.description}</p>
            </a>
          ))}
        </div>
      )
    }
  </section>
  <Footer />
</BaseLayout>

<style>
  .section {
    padding: 70px 48px;
    max-width: 760px;
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-accent);
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }

  h1 {
    font-size: 34px;
    font-weight: 800;
    margin: 0 0 30px 0;
  }

  .empty {
    opacity: 0.6;
    font-size: 14px;
  }

  .posts {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .post {
    text-decoration: none;
    display: block;
  }

  .post h3 {
    margin: 0 0 4px 0;
    font-size: 18px;
    color: var(--color-text);
  }

  .post p {
    margin: 0;
    opacity: 0.6;
    font-size: 13.5px;
  }
</style>
```

- [ ] **Step 2: Write the blog post template**

`src/pages/blog/[slug].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<BaseLayout title={`${post.data.title} — Kevin Galvan`} description={post.data.description}>
  <Nav />
  <article class="post">
    <h1>{post.data.title}</h1>
    <div class="prose">
      <Content />
    </div>
  </article>
  <Footer />
</BaseLayout>

<style>
  .post {
    padding: 70px 48px;
    max-width: 760px;
  }

  h1 {
    font-size: 34px;
    font-weight: 800;
    margin: 0 0 30px 0;
  }

  .prose {
    opacity: 0.85;
    line-height: 1.7;
    font-size: 15px;
  }
</style>
```

- [ ] **Step 3: Write the 404 page**

`src/pages/404.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
---

<BaseLayout title="Not Found — Kevin Galvan" description="Page not found.">
  <Nav />
  <section class="section">
    <div class="eyebrow">404</div>
    <h1>Nothing here.</h1>
    <p>
      <a href="/">Back to the homepage →</a>
    </p>
  </section>
  <Footer />
</BaseLayout>

<style>
  .section {
    padding: 120px 48px;
    text-align: center;
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-accent);
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }

  h1 {
    font-size: 30px;
    font-weight: 800;
    margin: 0 0 20px 0;
  }

  a {
    color: var(--color-accent);
    text-decoration: none;
  }
</style>
```

- [ ] **Step 4: Verify build and empty-state**

Run: `npm run build`
Expected: PASS. Since `src/content/blog/` has no entries yet, confirm
`dist/blog/index.html` contains the "Nothing published yet" copy (grep
it: `grep -o "Nothing published yet" dist/blog/index.html`, expect one
match).

- [ ] **Step 5: Commit**

```bash
git add src/pages/blog src/pages/404.astro
git commit -m "feat: add blog index/post pages with empty-state, and 404 page"
```

---

### Task 14: Resume asset, Vercel deployment, and repo publish

**Files:**
- Create: `public/resume.pdf`
- Create: `README.md`

**Interfaces:** none (final integration task).

- [ ] **Step 1: Add the resume PDF**

```bash
cp ~/Downloads/KevinGalvanResume-2.pdf public/resume.pdf
```

- [ ] **Step 2: Verify the download link works**

Run: `npm run build && npm run preview`, open `/`, click "Download
Résumé," confirm `resume.pdf` downloads and opens correctly. Stop the
preview server when done.

- [ ] **Step 3: Write deployment README**

`README.md`:
```markdown
# kgalvan.dev

Personal portfolio site. Astro, static output, MDX content collections.

## Development

    npm install
    npm run dev

## Deployment (Vercel)

1. In the Vercel dashboard, import this GitHub repo as a new project.
2. Framework preset: Astro (auto-detected). Build command: `astro build`.
   Output directory: `dist`.
3. Under the project's Domains settings, add `kgalvan.dev` and follow
   Vercel's instructions to repoint the domain's DNS (A/CNAME records)
   from its current host to Vercel.
4. Every push to `main` deploys automatically once connected.

## Adding a blog post

Add a new `.mdx` file to `src/content/blog/` with frontmatter matching
the schema in `src/content.config.ts` (`title`, `description`, `pubDate`,
optional `draft`). Push to `main` to publish.
```

- [ ] **Step 4: Commit**

```bash
git add public/resume.pdf README.md
git commit -m "chore: add resume asset and deployment README"
```

- [ ] **Step 5: Create the GitHub repo and push — REQUIRES USER CONFIRMATION**

This step is visible to others and hard to fully reverse (a public repo
under Kevin's account). **Stop and confirm with Kevin before running
this** — do not run it automatically as part of a batch.

```bash
gh repo create kgalvanserrano/kgalvan.dev --public --source=. --remote=origin
git push -u origin main
```

- [ ] **Step 6: Point kgalvan.dev at Vercel — MANUAL, requires Kevin's own accounts**

This cannot be done by an agent — it requires Kevin's own Vercel account
login and access to the domain's DNS settings. Hand off to Kevin using
the steps in `README.md`'s Deployment section.

---

## Self-Review Notes

- **Spec coverage:** stack/architecture (Tasks 1, 14), visual identity
  (Tasks 2, 7), no-stat-row decision (Task 7 has no stat row), hero copy
  (Task 7), section order (Task 11's assembly order), Conosi
  dual-placement (Tasks 5, 8, 3, 9, 12), Experience/Projects/About/Blog/
  Contact sections (Tasks 8/9/10/13/6), edge cases — 404 and empty blog
  state (Task 13), resume download (Task 14), deployment (Task 14). All
  spec sections have a corresponding task.
- **Unconfirmed content flagged:** Conosi's App Store URL and the Yelp
  project's Tableau Public URL are placeholder-shaped in Task 3 and
  explicitly flagged as needing confirmation before publishing — real
  URLs, not invented ones, must replace them. Same for About's
  autobiographical copy in Task 10.
- **Type consistency check:** `ExperienceEntry.caseStudyHref` (Task 5) is
  read by `ExperienceTimeline.astro` (Task 8) as `entry.caseStudyHref`.
  `ProjectCard` props (Task 9) — `title`, `summary`, `href`,
  `externalLink` — match how `ProjectsTeaser.astro` calls it. The
  `projects` collection schema's `externalLink` shape (Task 3: `{ label,
  href }`) matches what `ProjectCard` and `[slug].astro` (Task 12)
  destructure. `getSortedPosts` (Task 4) signature matches how
  `blog/index.astro` (Task 13) calls it.
