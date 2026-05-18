# safehold-skills

[![npm version](https://img.shields.io/npm/v/safehold-skills)](https://www.npmjs.com/package/safehold-skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Claude Code skills that turn [Safehold](https://github.com/Spacetime-Technology/safehold) from a vault into finished workflows.

## What this is

Safehold stores your identity documents locally and exposes them to AI agents one field at a time, with consent. On its own, that's a building block. These skills are what you actually do with it: book a flight, apply for a visa, complete a KYC form. Each skill knows how to talk to Safehold with a precise `purpose` string and pairs it with a browser MCP to finish the job.

## Install

```bash
npx safehold-skills install
```

That copies every bundled skill to `~/.claude/skills/`. Restart Claude Code to pick them up.

Other commands:

```bash
npx safehold-skills list                       # see bundled and installed skills
npx safehold-skills install airline-check-in   # install one skill
npx safehold-skills uninstall airline-check-in # remove a skill
npx safehold-skills install --force            # overwrite existing
```

Requires Node.js >=20.

## Prereqs

The skills assume you have these MCP servers configured:

- **Safehold** — `claude mcp add safehold npx -- -y safehold@latest` (or see [Safehold's README](https://github.com/Spacetime-Technology/safehold#quick-install) for other clients).
- **Any browser-automation MCP** — Playwright MCP, Chrome DevTools MCP, Puppeteer MCP, browser-use MCP, or computer-use. Skills that drive a browser describe what they need by capability and pick from whatever you have installed. [Playwright MCP](https://github.com/microsoft/playwright-mcp) is the easy default.

Each skill lists the capabilities it needs at the top and refuses to run if Safehold or a browser MCP is missing.

## Skills bundled

| Skill | What it does |
|---|---|
| `airline-check-in` | Online check-in on an airline website using your stored passport. Headed browser, per-field consent, boarding pass saved to `~/Downloads/`. |
| `esta-apply` | Submit a US ESTA application on esta.cbp.dhs.gov using your stored passport. Headed browser, per-field consent, you handle the $21 payment and eligibility answers, receipt saved to `~/Downloads/`. |
| `uk-eta-apply` | Submit a UK ETA application on gov.uk using your stored passport. Headed browser, per-field consent, you handle the £16 payment and suitability answers, receipt saved to `~/Downloads/`. |

## Roadmap

- `hotel-id-upload` — passport upload at check-in portals
- `exchange-kyc` — onboarding flow for crypto exchanges

## How a skill talks to Safehold

Every retrieval includes a `purpose` string built by the skill, e.g. `"Online check-in for British Airways flight ABC123 on 2026-05-20"`. That string is what Safehold shows you at consent time, and what gets written to the access log (`get_access_log`). The skill never asks for fields the form doesn't need, and never persists Safehold-derived data anywhere except the final artifact (boarding pass PDF, application receipt, etc.).

After running any skill, you can audit exactly what was retrieved by calling Safehold's `get_access_log` tool.

## Composing skills

Skills accept named arguments and finish with a structured output block (`STATUS`, `ARTIFACT`, `REASON`). That means another skill, an agent, or a script can call one of these skills with inputs already in hand and read the result programmatically — without forcing a human Q&A loop. The same skill still works conversationally when a user just types "check me in".

The conventions that make this work — input resolution order, MCP-agnostic body style, output contract — are documented in [`SKILLS.md`](SKILLS.md).

## Writing your own skill

Read [`SKILLS.md`](SKILLS.md). It's the source of truth for how skills in this repo are structured and why. Use `airline-check-in` as the reference shape.

PRs welcome. Bar for merging: you've run the skill on a real end-to-end flow, not a simulated one.

## Contributing

PRs welcome. Add a skill in `skills/<name>/`, update the README table, run `npx safehold-skills install --force` to test locally.

## Built by

[Spacetime Technology](https://github.com/Spacetime-Technology)
