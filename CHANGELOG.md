# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `esta-apply` skill: drives a browser through the US ESTA application at esta.cbp.dhs.gov, pulling passport fields from Safehold with per-field consent. User handles eligibility answers and the $21 payment. Saves the receipt PDF to `~/Downloads/`.
- `esta-form.md` reference: ESTA form section map, verbatim eligibility questions, and known form quirks.
- `uk-eta-apply` skill: drives a browser through the UK ETA web application at gov.uk, pulling passport fields from Safehold with per-field consent. User supplies the photo, answers the suitability questions, and handles the £16 payment. Saves the receipt PDF to `~/Downloads/`.
- `uk-eta-form.md` reference: UK ETA form section map, suitability question categories, photo rules, and known form quirks.

## [0.1.0] — 2026-05-18

Initial public release.

### Added
- `safehold-skills` CLI: `install`, `uninstall`, `list`, `help`, `--force`. Zero-deps Node script, copies skill directories to `~/.claude/skills/`.
- `airline-check-in` skill: drives online check-in on any airline website using passport fields from Safehold and any installed browser-automation MCP. Named arguments (`airline`, `pnr`, `surname`, `flight_date`) for programmatic invocation; falls back to asking the user if invoked without them. Emits a structured output block on completion.
- `airlines.md` lookup table for the airline-check-in skill, covering 15 major carriers with check-in URLs and login quirks.
- `SKILLS.md` conventions doc: frontmatter rules, input resolution order, MCP-agnostic body style, output contract, Safehold discipline, PR checklist.
- `scripts/verify.sh` smoke-test for the install round-trip.
