Thank you to atelier ([atelier.place](atelier.place/)) for the original codebase. The session board heavily adapts from [their tooling](https://github.com/atelier-vancouver/website/), which Calvin graciously directed me towards.

# UBC AI Safety Facilitator Tools

This app bundles two browser-based tools used to run UBC AI Safety events:

- `Session Board` for co-working sessions, intros, timers, notes, and question-of-the-day prompts
- `Oxford Style Debate` for live debates with prompt management, timed phases, and audience-facing displays

It is built with Astro and Vue and is deployed on Cloudflare Pages.

## What Each Tool Is For

### Session Board

Use the session board when you need a single screen to guide a co-working event. It supports:

- stage-based flow for welcome, intro, work blocks, breaks, demos, and closing
- timer, text, and question-of-the-day modes
- editable corner notes and labels
- a separate audience display view for the projector or TV
- optional AI-generated question-of-the-day suggestions based on date and location

### Oxford Style Debate

Use the debate tool when you want a structured, timed room debate. It supports:

- editable debate prompts with optional subtitles
- prompt presets for recurring event themes
- drag-to-reorder prompt management
- configurable debate phases and timers
- audience views for either the live debate screen or a "how it works" explainer

## Routes

- `/` tool picker
- `/session` session board facilitator panel
- `/session/display` session board audience display
- `/spectrum` debate facilitator panel
- `/spectrum/display` debate audience display
- `/api/qotd` API endpoint used by the session board question generator

The facilitator and display routes sync through `BroadcastChannel`, so they are meant to be opened from the same browser/profile. The built-in `Open Audience View` buttons handle the normal setup.

## Running Locally

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:4321`.

Useful commands:

- `pnpm dev` starts the Astro dev server
- `pnpm build` runs `astro check` and builds the site
- `pnpm preview` previews the production build locally
- `node --test test/*.test.mjs` runs the current test suite

## Maintainer Notes

- Session board defaults and stages live in `src/data/coworking-config.json`.
- Debate phase defaults live in `src/data/debate-config.json`.
- Debate prompt presets live in `src/data/spectrum.json`.
- The question generator is implemented in `functions/api/qotd.ts` and requires `OPENAI_API_KEY` in the Pages environment.
- During local Astro dev, `/api` requests are proxied to `https://ubcais-tools.pages.dev/` by `astro.config.mjs`.
