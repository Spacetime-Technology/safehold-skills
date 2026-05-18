---
name: uk-eta-apply
description: Submit a UK ETA (Electronic Travel Authorisation) application on gov.uk using passport data from Safehold. Use when the user asks to apply for a UK ETA, get UK travel authorisation, or fill out a UK ETA. Accepts arrival_date, uk_address, trip_purpose, contact_email as arguments for programmatic invocation, or asks the user for whatever is missing.
arguments: [arrival_date, uk_address, trip_purpose, contact_email]
argument-hint: "[arrival_date] [uk_address] [trip_purpose] [contact_email]"
allowed-tools: mcp__safehold__* mcp__playwright__* mcp__chrome-devtools__* mcp__puppeteer__* mcp__browser-use__* mcp__computer-use__* Bash
---

# UK ETA application

You are submitting a UK ETA application for the user on `gov.uk`. The user's passport lives in their local Safehold vault. You drive a browser to fill the official ETA form, with consent at every step where data leaves the vault. The user answers all suitability questions, supplies the photo, and handles the £16 payment.

This skill follows the conventions in this repo's `SKILLS.md`. Read that if anything below is unclear.

## App vs web

The Home Office's recommended path is the "UK ETA" mobile app, which uses the passport NFC chip and the phone camera for the photo. This skill drives the **web** alternative. Before starting, tell the user: the app is faster and more reliable, the web flow needs them to upload a passport scan and a photo from disk. Confirm they want the web path before proceeding. If they'd rather use the app, stop and point them at it.

## Required capabilities

- **Safehold** (`mcp__safehold__*`) — mandatory, no substitute. If missing, tell the user to install it: `claude mcp add safehold npx -- -y safehold@latest`. Then stop.
- **Any browser-automation MCP** — Playwright MCP, Chrome DevTools MCP, Puppeteer MCP, browser-use MCP, or computer-use. The skill works with any. Prefer Playwright MCP if multiple are present. If none are available, tell the user to install one ([Playwright MCP](https://github.com/microsoft/playwright-mcp) is the easy default) and stop.

Use whichever browser-automation MCP is present. Pick the right tool from your available set — don't hardcode tool names.

## Resolve inputs

You need: `$arrival_date`, `$uk_address`, `$trip_purpose`, `$contact_email`.

Resolve in this order:

1. **Skill arguments** — if invoked with arguments, trust them.
2. **Conversation context** — a parent skill or earlier turn may already mention some of these. Look before asking.
3. **Ask the user** — only for whatever's still missing, in *one* consolidated message. Don't ping-pong.

If you can't resolve all four after asking once, emit the output contract with `STATUS: aborted`, `REASON: missing required inputs` and stop.

Then check Safehold has a passport:

- Call the Safehold "list documents" tool. Look for `type: passport`.
- If none, emit `STATUS: aborted`, `REASON: no passport stored` and tell the user to add one with Safehold's `add_document`.
- If multiple passports, prefer one whose `nationality` is on the [UK ETA eligible nationalities list](https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta). If none qualify, emit `STATUS: aborted`, `REASON: no ETA-eligible passport` and stop.

Check passport validity:

- The passport must be valid for the whole stay. Fetch *only* `expiry_date` and `nationality` with `purpose: "Validate passport for UK ETA application"`.
- If the passport expires before `$arrival_date`, emit `STATUS: aborted`, `REASON: passport invalid for travel date` and stop. Never edit Safehold to "fix" it.

## Read the form reference

Read `uk-eta-form.md` (sibling file in this skill directory) for the form's section map, the suitability questions, and known quirks (date format, photo rules, address format). Consult it on demand — don't dump the whole file into the conversation.

## Drive the browser

Use the available browser-automation MCP. Run in **headed mode** so the user can see what's happening — never run the flow in the background.

1. Navigate the browser to the UK ETA start page on gov.uk (see `uk-eta-form.md` for the current URL).
2. If a cookie banner appears, pause and let the user decide. Don't auto-accept.
3. If the page shows an anti-bot challenge or captcha, stop and ask the user to complete it. Resume only when they say so. Don't try to defeat it.

## Start the application and accept terms

The flow opens with eligibility confirmations and a declaration. Both have explicit checkboxes.

- Pause and surface the declaration text to the user.
- Wait for explicit acceptance. Don't auto-tick.
- If the user declines, emit `STATUS: aborted`, `REASON: declaration declined` and stop.

## Pull passport and applicant fields from Safehold

Look at what each form page actually asks for. Fetch fields from Safehold in small batches, page-by-page. Typical fields the form will ask for:

- given names, surname
- date of birth
- sex (as printed in the passport)
- nationality
- passport number
- issuing authority
- issue date and expiry date

Call the appropriate Safehold "get" tool for the passport and request **only the fields that page asks for**. Never bulk-fetch.

Every retrieval uses this `purpose` template:

> `"UK ETA application for $surname, arrival $arrival_date"`

The user sees this exact string at consent time. If they deny, abort the entire flow and emit `STATUS: aborted`, `REASON: consent denied`. Don't retry.

Some ETA fields aren't standard passport fields — ask the user directly for these:

- the user's phone number and email (use `$contact_email` if supplied)
- home address in country of residence
- job / occupation
- any other names the user has been known by

## Passport scan and photo

The web flow needs an image of the passport biodata page and a recent photo.

- **Passport scan.** Ask the user to provide a path to an existing scan. Don't try to extract or render one from Safehold metadata; the form needs a real image, not synthesised text.
- **Photo.** Ask the user to provide a path to a recent passport-style photo. UK ETA photo rules are in `uk-eta-form.md` (background, expression, no glasses, file size). Surface those rules before they pick a file.
- **Never use a Safehold-stored image as the application photo without explicit user consent** for that specific image. Treat it the same as any other field retrieval, with a `purpose` string.

If the user has no suitable photo, stop and tell them to take one and re-run. Don't proceed with a placeholder.

## Travel info

Fill `$arrival_date`, `$uk_address` (where the user is staying in the UK), and `$trip_purpose` (tourism, business, transit, visiting family, etc.). "Unknown" or "Multiple addresses" may be accepted by the form for some fields; surface the user's actual situation rather than guessing.

## Suitability questions

There are several yes/no suitability questions covering criminal record, terrorism, extremism, prior immigration history, and armed-forces / intelligence-services membership. The current wording is in `uk-eta-form.md`.

- **Never auto-answer.** For each question, surface the full text to the user and take their explicit yes/no.
- A "yes" on any of these doesn't auto-disqualify, but it triggers a follow-up free-text box. Don't editorialise or summarise on the user's behalf; pass their answer through as given.
- If the user wants context before answering, tell them you're not an immigration adviser and point them at the official gov.uk guidance.

## Review screen

The form presents a full review of every value before payment.

1. Read back to the user the values you're about to submit. Mask the passport number except the last 4 digits when echoing.
2. Wait for confirmation.
3. Only then click submit.

Dates on the UK form are `DD/MM/YYYY`. If unsure, ask the user once.

## Payment

The ETA fee is **£16 GBP**, charged by UK Home Office.

- **Never auto-fill card details.** Pause on the payment page.
- Tell the user this is the paid step. Hand control over so they can enter card data and submit the payment themselves.
- Resume the flow only when they confirm payment is done.
- If payment fails, screenshot the error, show the user, ask what they want to do. Don't retry blindly.

## Capture the receipt

When the application confirmation page loads:

1. Take a screenshot for the conversation.
2. Save the receipt PDF to `~/Downloads/uk-eta-receipt-$reference.pdf`. The reference number is shown on the confirmation page; use it in the filename.
3. Note the displayed status. Most decisions are returned within 3 working days by email, occasionally same-hour. The submission receipt is not the decision letter.
4. Close the browser cleanly.

The receipt is the artifact even when no decision has arrived yet — the user gets the actual ETA grant by email later, tied to the same reference.

## Hard rules

- **Single applicant only in v1.** UK ETA supports linked group applications; this skill does not. If the user wants to apply for multiple people, emit `STATUS: failed`, `REASON: multi-applicant not supported` and stop.
- **Never auto-answer suitability questions.** Every one of them is the user's to answer.
- **Never enter payment card data.** The user handles the payment step.
- **Never write Safehold-derived values to disk** except the final receipt PDF.
- **Never modify Safehold.** Stale data → stop and report. The user fixes it.
- **Always include the `purpose` string** on every Safehold retrieval.
- **Respect denials.** Never retry a denied consent prompt.
- **Never auto-tick declarations**, never try to bypass anti-bot, never submit a synthesised or placeholder photo.
- **If anything looks off** — name mismatch, ineligible nationality, surprise page, a "yes" answer the user wants to discuss before submitting — stop and report. The cost of a withdrawn application is small; the cost of submitting wrong data to the Home Office is not.

## Recovery patterns

- **Anti-bot blocks the navigate.** Tell the user to open `gov.uk` in their normal browser first, then retry. A browser MCP with a persistent profile (like Playwright MCP) will inherit the session.
- **Photo upload rejected.** Surface the form's rejection reason to the user (lighting, expression, size, format). Ask for a different photo. Don't crop or edit the image.
- **Session timeout mid-flow.** Warn the user before any long pause. If timed out, restart from the beginning; the form keeps no draft.
- **Payment fails.** Screenshot, show the user, ask what they want to do. Don't retry blindly.
- **User stops mid-flow.** Close the browser cleanly and emit `STATUS: aborted`, `REASON: user stopped`.

## Output

When you're done — success or failure — emit this fenced block as the last thing in your response. A calling skill or agent will parse it; an interactive user will skim it.

```
STATUS: success | partial | failed | aborted
ARTIFACT: <absolute path to receipt PDF> | none
REFERENCE: <application reference from receipt> | none
ETA_STATUS: submitted | decision_pending | granted | refused | unknown
REASON: <one-line, only when STATUS is not success>
```

After a successful run, also suggest the user inspect Safehold's `get_access_log` — they'll see the exact `purpose` strings and fields retrieved during the flow. That's the trust story; lean into it.
