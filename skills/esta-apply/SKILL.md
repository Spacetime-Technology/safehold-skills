---
name: esta-apply
description: Submit a US ESTA (Electronic System for Travel Authorization) application on esta.cbp.dhs.gov using passport data from Safehold. Use when the user asks to apply for ESTA, get US travel authorization, or fill out an ESTA. Accepts arrival_date, us_address, trip_purpose, contact_email as arguments for programmatic invocation, or asks the user for whatever is missing.
arguments: [arrival_date, us_address, trip_purpose, contact_email]
argument-hint: "[arrival_date] [us_address] [trip_purpose] [contact_email]"
allowed-tools: mcp__safehold__* mcp__playwright__* mcp__chrome-devtools__* mcp__puppeteer__* mcp__browser-use__* mcp__computer-use__* Bash
---

# US ESTA application

You are submitting a US ESTA application for the user on `esta.cbp.dhs.gov`. The user's passport lives in their local Safehold vault. You drive a browser to fill the official ESTA form, with consent at every step where data leaves the vault. The user answers all eligibility questions and handles the $21 payment themselves.

This skill follows the conventions in this repo's `SKILLS.md`. Read that if anything below is unclear.

## Required capabilities

- **Safehold** (`mcp__safehold__*`) — mandatory, no substitute. If missing, tell the user to install it: `claude mcp add safehold npx -- -y safehold@latest`. Then stop.
- **Any browser-automation MCP** — Playwright MCP, Chrome DevTools MCP, Puppeteer MCP, browser-use MCP, or computer-use. The skill works with any. Prefer Playwright MCP if multiple are present. If none are available, tell the user to install one ([Playwright MCP](https://github.com/microsoft/playwright-mcp) is the easy default) and stop.

Use whichever browser-automation MCP is present. Pick the right tool from your available set — don't hardcode tool names.

## Resolve inputs

You need: `$arrival_date`, `$us_address`, `$trip_purpose`, `$contact_email`.

Resolve in this order:

1. **Skill arguments** — if invoked with arguments, trust them.
2. **Conversation context** — a parent skill or earlier turn may already mention some of these. Look before asking.
3. **Ask the user** — only for whatever's still missing, in *one* consolidated message. Don't ping-pong.

If you can't resolve all four after asking once, emit the output contract with `STATUS: aborted`, `REASON: missing required inputs` and stop.

Then check Safehold has a passport:

- Call the Safehold "list documents" tool. Look for `type: passport`.
- If none, emit `STATUS: aborted`, `REASON: no passport stored` and tell the user to add one with Safehold's `add_document`.
- If multiple passports, prefer one whose `nationality` is on the [Visa Waiver Program list](https://www.cbp.gov/travel/international-visitors/visa-waiver-program). If none qualify, emit `STATUS: aborted`, `REASON: no VWP-eligible passport` and stop.

Check passport validity for ESTA:

- ESTA requires a machine-readable electronic passport (e-passport, with the chip symbol). Fetch *only* `expiry_date` and `nationality` with `purpose: "Validate passport for ESTA application"`.
- If the passport expires before `$arrival_date`, emit `STATUS: aborted`, `REASON: passport invalid for travel date` and stop. Never edit Safehold to "fix" it.

## Read the form reference

Read `esta-form.md` (sibling file in this skill directory) for the form's section map, the verbatim eligibility questions, and known quirks (date format, gender field, address limits). Consult it on demand — don't dump the whole file into the conversation.

## Drive the browser

Use the available browser-automation MCP. Run in **headed mode** so the user can see what's happening — never run the flow in the background.

1. Navigate the browser to `https://esta.cbp.dhs.gov/`.
2. If a cookie banner appears, pause and let the user decide. Don't auto-accept.
3. If the page shows an anti-bot challenge or captcha, stop and ask the user to complete it. Resume only when they say so. Don't try to defeat it.

## Disclaimers and Travel Promotion Act

The ESTA flow opens with the CBP security/privacy disclaimer and the Travel Promotion Act consent. Both have explicit checkboxes.

- Pause and surface the disclaimer text to the user.
- Wait for explicit acceptance for each one. Don't auto-tick.
- If the user declines either, emit `STATUS: aborted`, `REASON: disclaimer declined` and stop.

## Pull passport and applicant fields from Safehold

Look at what each form page actually asks for. Fetch fields from Safehold in small batches, page-by-page. Typical fields the form will ask for:

- given names, surname
- date of birth
- gender
- city and country of birth
- nationality / country of citizenship
- passport number
- issuing country
- issue date and expiry date

Call the appropriate Safehold "get" tool for the passport and request **only the fields that page asks for**. Never bulk-fetch.

Every retrieval uses this `purpose` template:

> `"US ESTA application for $surname, arrival $arrival_date"`

The user sees this exact string at consent time. If they deny, abort the entire flow and emit `STATUS: aborted`, `REASON: consent denied`. Don't retry.

Some ESTA fields aren't standard passport fields — ask the user directly for these:

- other names / aliases ever used
- parents' first names
- the user's phone number and email (use `$contact_email` if supplied)
- national identification number, if the user's country issues one
- employment details (employer name, address, job title) — optional on the form, default to "no employer" if the user says so
- social media handles — optional, default to skip unless the user volunteers them

## Travel info

Fill `$arrival_date`, `$us_address` (where the user is staying in the US), and `$trip_purpose` (business, pleasure, transit). The form also asks for a US point of contact (name, address, phone). That's a separate person — ask the user. "Unknown" is accepted by the form if the user genuinely doesn't have one.

## Eligibility questions

There are nine yes/no eligibility questions on the form (covering health, criminal history, drug offences, terrorism, immigration violations, prior denials, overstays, and travel to specific countries). The verbatim wording is in `esta-form.md`.

- **Never auto-answer.** For each question, surface the full text to the user and take their explicit yes/no.
- A "yes" on any of these doesn't auto-disqualify, but it changes the downstream flow. Don't editorialise. Pass the answer through as given.
- If the user wants context on a question before answering, tell them you're not a legal advisor and point them at CBP's official guidance.

## Review screen

ESTA presents a full review of every value before payment.

1. Read back to the user the values you're about to submit. Mask the passport number except the last 4 digits when echoing.
2. Wait for confirmation.
3. Only then click submit.

If the form has date format quirks (`MM/DD/YYYY` is the ESTA default), match what the page shows. If unsure, ask the user once.

## Payment

The ESTA fee is **$21 USD**, charged by US CBP.

- **Never auto-fill card details.** Pause on the payment page.
- Tell the user this is the paid step. Hand control over so they can enter card data and submit the payment themselves.
- Resume the flow only when they confirm payment is done.
- If payment fails, screenshot the error, show the user, ask what they want to do. Don't retry blindly.

## Capture the receipt

When the application confirmation page loads:

1. Take a screenshot for the conversation.
2. Save the receipt PDF to `~/Downloads/esta-receipt-$application_number.pdf`. The application number is shown on the confirmation page; use it in the filename.
3. Note the displayed status: usually "Authorization Approved", sometimes "Authorization Pending" (can take up to 72h to resolve), occasionally "Travel Not Authorized".
4. Close the browser cleanly.

The receipt is the artifact even when status is "pending" — the user can look the application up later by application number, passport number, and date of birth.

## Hard rules

- **Single applicant only in v1.** ESTA supports group applications; this skill does not. If the user wants to apply for multiple people, emit `STATUS: failed`, `REASON: multi-applicant not supported` and stop.
- **Never auto-answer eligibility questions.** Every one of them is the user's to answer.
- **Never enter payment card data.** The user handles the payment step.
- **Never write Safehold-derived values to disk** except the final receipt PDF.
- **Never modify Safehold.** Stale data → stop and report. The user fixes it.
- **Always include the `purpose` string** on every Safehold retrieval.
- **Respect denials.** Never retry a denied consent prompt.
- **Never auto-tick T&Cs or disclaimers**, never try to bypass anti-bot.
- **If anything looks off** — name mismatch, ineligible passport, surprise page, an eligibility "yes" the user wants to discuss before submitting — stop and report. The cost of a withdrawn application is small; the cost of submitting wrong data to CBP is not.

## Recovery patterns

- **Anti-bot blocks the navigate.** Tell the user to open `esta.cbp.dhs.gov` in their normal browser first, then retry. A browser MCP with a persistent profile (like Playwright MCP) will inherit the session.
- **Session timeout mid-flow.** ESTA sessions are short. Warn the user before any long pause. If timed out, the form data is lost; restart from the beginning.
- **Payment fails.** Screenshot, show the user, ask what they want to do. Don't retry blindly.
- **User stops mid-flow.** Close the browser cleanly and emit `STATUS: aborted`, `REASON: user stopped`.

## Output

When you're done — success or failure — emit this fenced block as the last thing in your response. A calling skill or agent will parse it; an interactive user will skim it.

```
STATUS: success | partial | failed | aborted
ARTIFACT: <absolute path to receipt PDF> | none
APPLICATION_NUMBER: <number from ESTA receipt> | none
ESTA_STATUS: approved | pending | denied | unknown
REASON: <one-line, only when STATUS is not success>
```

After a successful run, also suggest the user inspect Safehold's `get_access_log` — they'll see the exact `purpose` strings and fields retrieved during the flow. That's the trust story; lean into it.
