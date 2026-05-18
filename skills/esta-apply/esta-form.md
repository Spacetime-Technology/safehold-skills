# ESTA form: section map, eligibility questions, quirks

Reference for the `esta-apply` skill. Consult on demand — don't load the whole file speculatively.

## Site

| What | Value |
|---|---|
| URL | https://esta.cbp.dhs.gov/ |
| Fee | $21 USD (charged by US CBP) |
| Approval time | Usually instant, up to 72h for "pending" cases |
| Validity | 2 years from approval, or until the passport expires (whichever comes first) |
| Trip limit | Per visit: up to 90 days under the Visa Waiver Program |

## Form sections, in order

1. **Security and Privacy disclaimer** — checkbox.
2. **Travel Promotion Act** — checkbox.
3. **Applicant info** — names, DOB, gender, place of birth, citizenship, other names/aliases, national ID, parents' first names.
4. **Passport** — number, issuing country, issue date, expiry date, country of citizenship.
5. **Contact info** — applicant address, phone, email.
6. **Social media** — optional. Default to skip unless the user volunteers handles.
7. **Employment** — current and previous employer; optional.
8. **Travel info** — purpose of travel, US point of contact, US address, emergency contact.
9. **Eligibility questions** — nine yes/no questions (verbatim below).
10. **Review** — summary of every value entered.
11. **Payment** — $21 USD, card payment on a CBP page.
12. **Receipt** — application number plus status (Approved / Pending / Not Authorized).

## Eligibility questions (verbatim — **user must answer each one**)

These are the questions as they appear on the live form. Surface the exact wording when asking the user. Don't paraphrase.

1. Do you have a physical or mental disorder; or are you a drug abuser or addict; or do you currently have any of the following diseases (communicable diseases are specified pursuant to section 361(b) of the Public Health Service Act): Cholera, Diphtheria, Tuberculosis (infectious), Plague, Smallpox, Yellow Fever, Viral Hemorrhagic Fevers, including Ebola, Lassa, Marburg, Crimean-Congo, Severe acute respiratory illnesses capable of transmission to other persons and likely to cause mortality.
2. Have you ever been arrested or convicted for a crime that resulted in serious damage to property, or serious harm to another person or government authority?
3. Have you ever violated any law related to possessing, using, or distributing illegal drugs?
4. Do you seek to engage in or have you ever engaged in terrorist activities, espionage, sabotage, or genocide?
5. Have you ever committed fraud or misrepresented yourself or others to obtain, or assist others to obtain, a visa or entry into the United States?
6. Are you currently seeking employment in the United States or were you previously employed in the United States without prior permission from the U.S. government?
7. Have you ever been denied a U.S. visa you applied for with your current or previous passport, or have you ever been refused admission to the United States or withdrawn your application for admission at a U.S. port of entry?
8. Have you ever stayed in the United States longer than the admission period granted to you by the U.S. government?
9. Have you traveled to, or been present in Iraq, Iran, North Korea, Sudan, Syria, Libya, Somalia, Yemen, or Cuba on or after March 1, 2011?

A "yes" on any question doesn't auto-disqualify — the form follows up for detail. Pass the answer through as the user gave it. Don't editorialise.

## Known quirks

- **Date format**: `MM/DD/YYYY` throughout. Convert any user input that looks like `DD/MM/YYYY` or ISO.
- **Gender field**: `M` / `F` / `X` (non-binary). The form uses radio buttons.
- **Address line length**: 33-character limit per line. Truncate or split.
- **Phone format**: country code + number, no spaces. Validate before submitting.
- **Parents' names**: required, first names only. If the user doesn't know a parent's name, "Unknown" is accepted.
- **US point of contact**: a real person or business in the US. "Unknown" is accepted if the user genuinely has no contact.
- **Employer / social media**: both optional. Skip unless the user provides values.
- **Session timeout**: short (around 20 minutes of inactivity). Warn the user before any long pause; data is lost on timeout.
- **Passport must be electronic** (e-passport, with the chip symbol on the cover). Non-electronic passports are not accepted under the VWP.

## Contributing

Update this when CBP changes the form. Quote the eligibility questions verbatim. Don't paraphrase. If a quirk has changed (date format, line length, new field), update the row rather than adding a duplicate.
