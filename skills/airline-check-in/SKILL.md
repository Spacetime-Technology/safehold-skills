---
name: airline-check-in
description: Complete online check-in on an airline website using passport data from Safehold. Use when the user asks to check in for a flight, get a boarding pass, do online check-in, or "check me in". Accepts airline, PNR, surname, flight_date as arguments for programmatic invocation, or asks the user for whatever is missing.
arguments: [airline, pnr, surname, flight_date]
argument-hint: "[airline] [pnr] [surname] [flight_date]"
allowed-tools: mcp__safehold__* mcp__playwright__* mcp__chrome-devtools__* mcp__puppeteer__* mcp__browser-use__* mcp__computer-use__* Bash
---

# Airline online check-in

You are doing online check-in for the user on a real airline website. The user's identity data lives in their local Safehold vault. You drive a browser to fill the airline's check-in form, with consent at every step where data leaves the vault.

This skill follows the conventions in this repo's `SKILLS.md`. Read that if anything below is unclear.

## Required capabilities

- **Safehold** (`mcp__safehold__*`) — mandatory, no substitute. If missing, tell the user to install it: `claude mcp add safehold npx -- -y safehold@latest`. Then stop.
- **Any browser-automation MCP** — Playwright MCP, Chrome DevTools MCP, Puppeteer MCP, browser-use MCP, or computer-use. The skill works with any. If multiple are available, prefer Playwright MCP because it persists a profile across runs (handy if the airline requires a prior login). If none are available, tell the user to install one ([Playwright MCP](https://github.com/microsoft/playwright-mcp) is the easy default) and stop.

Use whichever browser-automation MCP is present. Pick the right tool from your available set — don't hardcode tool names.

## Resolve inputs

You need: `$airline`, `$pnr`, `$surname`, `$flight_date`.

Resolve in this order:

1. **Skill arguments** — if invoked with arguments, they arrive as `$airline`, `$pnr`, `$surname`, `$flight_date`. Trust them.
2. **Conversation context** — a parent skill or earlier turn may already mention some of these. Look before asking.
3. **Ask the user** — only for whatever's still missing, in *one* consolidated message. Don't ping-pong.

If you can't resolve all four after asking once, emit the output contract with `STATUS: aborted`, `REASON: missing required inputs` and stop.

Then check Safehold has a passport:

- Call the Safehold "list documents" tool. Look for `type: passport`.
- If none, emit `STATUS: aborted`, `REASON: no passport stored` and tell the user to add one with Safehold's `add_document`.
- If multiple passports, prefer one whose `nationality` plausibly matches the booking; otherwise ask which to use (by issuing country or document number suffix).

Check passport validity:

- Most airlines require ≥6 months validity from `$flight_date`. Fetch *only* `expiry_date` with `purpose: "Validate passport before check-in for $airline $pnr"`.
- If invalid, emit `STATUS: aborted`, `REASON: passport invalid for travel date` and stop. Never edit Safehold to "fix" it.

## Resolve the airline

Read `airlines.md` (sibling file in this skill directory). If `$airline` matches an entry, use the check-in URL and quirks from there. If not, ask the user once to paste the airline's check-in URL.

## Drive the browser

Use the available browser-automation MCP. Run in **headed mode** so the user can see what's happening — never run the flow in the background.

1. Navigate the browser to the check-in URL.
2. If a cookie banner appears, pause and let the user decide. Don't auto-accept.
3. If the page shows an anti-bot challenge (Cloudflare interstitial, captcha, "verify you're human"), stop and ask the user to complete it. Resume only when they say so. Don't try to defeat it.

## Pull passport fields from Safehold

Look at what the check-in form actually asks for — usually some subset of:

- passport number
- expiry date
- nationality / issuing country
- date of birth
- given names / surname

Call the appropriate Safehold "get" tool for a passport and request **only the fields the form asks for**. Never bulk-fetch.

Every retrieval uses this `purpose` template:

> `"Online check-in for $airline flight $pnr on $flight_date"`

The user sees this exact string at consent time. If they deny, abort the entire flow and emit `STATUS: aborted`, `REASON: consent denied`. Don't retry.

## Fill the form

Fill the form fields in one batch. Before submitting:

1. Read back to the user the values you're about to submit. Mask the passport number except the last 4 digits when echoing.
2. Wait for confirmation.
3. Only then click submit.

If the form has date format quirks (DD/MM vs MM/DD), match what the page shows. If unsure, ask the user once.

## User-driven steps

These always require the user, never auto-decide:

- **Seat selection.** Take a screenshot, show what's available, ask the user, click their choice.
- **Baggage add-ons.** Nothing that costs money without an explicit yes.
- **Insurance / extras upsells.** Default to skip; confirm with user before any "yes".
- **Terms & conditions checkboxes.** Pause and ask. Don't auto-tick.
- **Captchas.** Stop and let the user solve.

## Submit and finish

When the boarding pass page loads:

1. Take a screenshot for the conversation.
2. Save the boarding pass PDF to `~/Downloads/boarding-pass-$pnr.pdf`. If the airline only delivers via email or mobile wallet, tell the user that's how it'll arrive and set `ARTIFACT: none`.
3. Close the browser cleanly.

## Hard rules

- **Single passenger only in v1.** If the booking has multiple passengers, emit `STATUS: failed`, `REASON: multi-passenger not supported` and stop.
- **Never write Safehold-derived values to disk** except the final boarding pass PDF.
- **Never modify Safehold.** Stale data → stop and report. The user fixes it.
- **Always include the `purpose` string** on every Safehold retrieval.
- **Respect denials.** Never retry a denied consent prompt.
- **Never auto-tick T&Cs**, never auto-buy anything, never try to bypass anti-bot.
- **If anything looks off** — wrong name on the booking, mismatched DOB, unexpected page — stop and report. The cost of a missed check-in is small; the cost of submitting wrong data to an airline is not.

## Recovery patterns

- **Anti-bot blocks the navigate.** Tell the user to open the airline site in their normal browser, sign in once, then retry. A browser MCP with a persistent profile (like Playwright MCP) will inherit the session.
- **Form submit returns a generic error.** Screenshot, show the user, ask what they want to do. Don't retry blindly.
- **User stops mid-flow.** Close the browser cleanly and emit `STATUS: aborted`, `REASON: user stopped`.

## Output

When you're done — success or failure — emit this fenced block as the last thing in your response. A calling skill or agent will parse it; an interactive user will skim it.

```
STATUS: success | partial | failed | aborted
ARTIFACT: <absolute path to boarding pass PDF> | none
AIRLINE: $airline
PNR: $pnr
REASON: <one-line, only when STATUS is not success>
```

After a successful run, also suggest the user inspect Safehold's `get_access_log` — they'll see the exact `purpose` strings and fields retrieved during the flow. That's the trust story; lean into it.
