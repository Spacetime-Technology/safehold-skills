# Skill conventions

How skills in this repo are structured, and why. Read this before writing or reviewing a skill.

## Why this doc exists

This repo will collect many skills that lean on [Safehold](https://github.com/Spacetime-Technology/safehold) for identity data. To stay useful as the set grows, every skill should be three things:

- **Composable** — callable by another skill or an agent with inputs in hand, not just by a human in chat.
- **Portable** — works with whichever MCP the user already has installed, not locked to one vendor.
- **Auditable** — every Safehold call carries a clear `purpose`, so the access log is a record the user can actually read.

The rules below exist to deliver those three properties. If a rule gets in your way, push back in a PR — don't quietly break the pattern.

## Anatomy of a skill

```
skills/<skill-name>/
├── SKILL.md          # required entrypoint, YAML frontmatter + prose body
├── <reference>.md    # optional lookup tables, prompts, examples
└── ...               # optional helper scripts
```

`safehold-skills install` copies the whole directory to `~/.claude/skills/<skill-name>/`. Claude Code picks it up on next start.

## Frontmatter conventions

```yaml
---
name: airline-check-in
description: Complete online check-in on an airline website using passport data from Safehold. Use when the user asks to check in for a flight, get a boarding pass, or "check me in". Accepts airline, PNR, surname, flight_date as arguments for programmatic invocation.
arguments: [airline, pnr, surname, flight_date]
argument-hint: "[airline] [pnr] [surname] [flight_date]"
allowed-tools: mcp__safehold__* mcp__playwright__* mcp__chrome-devtools__* mcp__puppeteer__* mcp__browser-use__* mcp__computer-use__*
---
```

Field rules:

- **`name`, `description`** — required. The description is model-facing for auto-invocation; spell out when to use the skill *and* note that arguments are accepted.
- **`arguments`, `argument-hint`** — required if the skill has any structured inputs. Inputs are referenced in the body as `$argument_name`.
- **`allowed-tools`** — Safehold always, plus *every* known MCP that can serve each needed capability. List them explicitly; wildcards inside `mcp__*` are unreliable in current Claude Code versions. Adding a new MCP variant later is a one-line edit.

## Input resolution order

The composability rule. When a skill needs inputs, resolve them in this order:

1. **Skill arguments** — `$airline`, `$pnr`, etc. If set, trust them.
2. **In-context info** — a parent skill, an earlier turn, calendar/email tools in the session may already mention the value.
3. **Ask the user** — only for whatever's still missing, in *one* consolidated message.

A skill that asks the user for inputs that were already in `$arguments` is broken. A skill that won't run unless a human types the inputs is also broken — composition is a first-class use case.

Example body fragment:

```markdown
## Resolve inputs

You need: airline, PNR, surname, flight_date.

- If invoked with arguments, they come in as $airline, $pnr, $surname, $flight_date.
- If any are missing, check the current conversation — they may already be known.
- If still missing, ask the user for the gaps in a single message. Don't ping-pong.
```

## MCP-agnostic body style

The portability rule. Skill prose describes *capabilities*, never specific tool names.

| Don't | Do |
|---|---|
| "Call `mcp__playwright__browser_navigate` with the URL." | "Navigate the browser to the URL." |
| "Use `mcp__playwright__browser_fill_form` in one batch." | "Fill the form fields in one batch." |
| "Take a screenshot via `mcp__playwright__browser_take_screenshot`." | "Take a screenshot of the page." |

Tool-name specificity lives in `allowed-tools` and nowhere else. The model picks the right tool from the available set; the prose just says what needs to happen. This is why we list multiple browser MCPs in `allowed-tools`.

When the skill needs a capability nobody's standardised on yet, write the prose first, then list the MCPs that can deliver it.

## Output contract

The composability rule, part two. Every skill ends with a fenced code block in this shape:

```
STATUS: success | partial | failed | aborted
ARTIFACT: <absolute path or URL> | none
REASON: <one line, only when STATUS is not success>
```

Plus any skill-specific fields that make the result useful to a caller:

```
STATUS: success
ARTIFACT: /Users/you/Downloads/boarding-pass-ABC123.pdf
AIRLINE: British Airways
PNR: ABC123
```

Calling skills parse this. Interactive users skim it. Both win.

Statuses:

- `success` — flow completed end to end.
- `partial` — got somewhere useful but didn't finish (form filled but not submitted, e.g.).
- `failed` — the skill tried and couldn't continue (anti-bot block, missing field, unexpected page).
- `aborted` — the user denied consent or asked to stop.

## Safehold discipline

Applies to every skill that reads from Safehold.

- **Always pass `purpose`.** Template: `"<action> for <subject> on <date>"`. Specific, not generic. The user sees this exact string at consent time.
- **Fetch only the fields the downstream form actually asks for.** Never bulk-fetch a whole document for convenience.
- **Never write Safehold-derived values to disk** except the final artifact the user wanted (boarding pass PDF, application receipt, etc.). No scratch files, no debug dumps.
- **Never modify Safehold from inside a skill.** If stored data is stale or wrong, stop and tell the user. They fix it themselves.
- **On consent denial:** abort cleanly, emit `STATUS: aborted` with `REASON: consent denied`. Don't retry.

## Hard rules every skill must include

Each skill's body should reiterate these where they apply, in plain language:

- Respect user denials. Never retry a denied consent prompt.
- Never auto-tick "I agree to terms & conditions".
- Never auto-decide anything that costs the user money (baggage, insurance, upsells).
- Stop on anti-bot challenges and hand control to the user. Don't try to defeat them.
- If anything looks off — wrong name, mismatched DOB, unexpected page — stop and report. The cost of stopping is small; the cost of submitting bad data to a real system is not.

## PR checklist

Before opening a PR for a new skill:

- [ ] Frontmatter has `name`, `description`, and (if structured inputs) `arguments` + `argument-hint`.
- [ ] `allowed-tools` lists every MCP variant the skill might use, including Safehold.
- [ ] Body uses capability language; no `mcp__<server>__<tool>` references in prose.
- [ ] Input resolution section follows the priority order (arguments → context → ask user).
- [ ] Every Safehold retrieval in the body includes a `purpose` template using arguments.
- [ ] Final section is the output contract block.
- [ ] You've run the skill on at least one real end-to-end flow, not a simulated one.
- [ ] README skill table is updated.
- [ ] Conventions doc didn't need to change to accommodate the skill — or if it did, those changes are in the PR with rationale.

## Worked example: `airline-check-in`

See `skills/airline-check-in/SKILL.md`. It uses every pattern above:

- Frontmatter declares four named arguments and lists five browser MCPs in `allowed-tools`.
- "Resolve inputs" section follows the arguments → context → user order.
- "Drive the browser" section uses capability language only — no Playwright-specific tool names in prose.
- "Pull passport fields" builds the consent `purpose` from arguments: `"Online check-in for $airline flight $pnr on $flight_date"`.
- Final "Output" section emits the structured status block.

Use it as the reference shape when writing the next skill.
