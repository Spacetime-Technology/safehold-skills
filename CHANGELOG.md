# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-05-18

Initial public release.

### Added
- `safehold-skills` CLI: `install`, `uninstall`, `list`, `help`, `--force`. Zero-deps Node script, copies skill directories to `~/.claude/skills/`.
- `airline-check-in` skill: drives online check-in on any airline website using passport fields from Safehold and any installed browser-automation MCP. Named arguments (`airline`, `pnr`, `surname`, `flight_date`) for programmatic invocation; falls back to asking the user if invoked without them. Emits a structured output block on completion.
- `airlines.md` lookup table for the airline-check-in skill, covering 15 major carriers with check-in URLs and login quirks.
- `SKILLS.md` conventions doc: frontmatter rules, input resolution order, MCP-agnostic body style, output contract, Safehold discipline, PR checklist.
- `scripts/verify.sh` smoke-test for the install round-trip.
