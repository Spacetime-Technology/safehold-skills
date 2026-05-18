# UK ETA form: section map, suitability questions, quirks

Reference for the `uk-eta-apply` skill. Consult on demand — don't load the whole file speculatively.

## Site

| What | Value |
|---|---|
| Start page | https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta |
| Fee | £16 GBP (charged by UK Home Office) |
| Decision time | Usually within 3 working days, sometimes within hours |
| Validity | 2 years from grant, or until the passport expires (whichever comes first) |
| Trip limit | Up to 6 months per stay; multiple entries permitted |
| Primary path | Mobile app ("UK ETA"). This skill drives the web alternative. |

## Form sections, in order

1. **Eligibility check** — country of citizenship, purpose of visit.
2. **Declaration** — privacy/data-handling consent.
3. **Applicant info** — names, DOB, sex, nationality, other names ever used.
4. **Passport** — number, issuing authority, issue date, expiry date, plus an upload of the biodata page.
5. **Photo upload** — recent passport-style photo (rules below).
6. **Contact info** — email, phone, home address in country of residence.
7. **Occupation** — job title or "not working".
8. **Travel info** — purpose, intended arrival date, UK address (if known).
9. **Suitability questions** — yes/no, plus follow-up free text on any "yes".
10. **Review** — summary of every value entered.
11. **Payment** — £16 GBP, card payment on the gov.uk pay service.
12. **Receipt** — application reference plus a "decision will arrive by email" notice.

## Suitability questions (categories — verify wording against the live form)

The Home Office updates the exact wording from time to time. Always surface the **live form's wording** to the user when asking; the categories below tell the skill what subject area each question covers.

1. **Criminal convictions** — any criminal conviction, in the UK or elsewhere, including spent ones.
2. **Terrorism** — any involvement with terrorist organisations or activities.
3. **War crimes / crimes against humanity / genocide** — involvement in any of these.
4. **Extremism** — expressing or supporting extremist views.
5. **Armed forces or intelligence services** — current or former membership of armed forces, paramilitary, or intelligence/security services of any state.
6. **Prior UK immigration history** — refused entry, removed, deported, or overstayed in the UK.
7. **Prior immigration history elsewhere** — refused entry or removed from any other country.

A "yes" on any question triggers a free-text follow-up. Pass the user's answer through verbatim; don't edit, summarise, or soften.

## Photo rules

The form rejects photos that don't meet these requirements. Surface them before the user picks a file.

- Taken in the last month.
- Plain light-coloured background.
- Face visible, eyes open, mouth closed, neutral expression.
- No glasses, no hat (unless worn for religious reasons every day).
- Whole head, top of shoulders, both ears visible (unless covered for religious reasons).
- Photo of the person, not a photo of a photo.
- JPEG or PNG, file size within the form's stated limit.
- Not the passport photo page — that's a separate upload.

## Known quirks

- **Date format**: `DD/MM/YYYY` throughout.
- **Sex field**: matches what's printed in the passport (`M` / `F`). The form does not offer `X` on the ETA route at time of writing.
- **Address**: UK address optional if the user has no fixed plans yet; "Not yet known" is acceptable on the live form for some flows.
- **Phone format**: country code prefix required.
- **Session timeout**: short. Warn before any long pause; the form keeps no draft.
- **Decision delivery**: by email, tied to the application reference. The on-screen receipt is the submission confirmation, not the grant.

## Contributing

Update this when the Home Office changes the form. The suitability question categories above are stable; the exact wording is not — always quote the live form when prompting the user. If a quirk has changed (date format, sex field, photo rules), update the row rather than adding a duplicate.
