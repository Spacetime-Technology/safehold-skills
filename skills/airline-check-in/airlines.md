# Airline check-in URLs and quirks

Lookup table for the `airline-check-in` skill. Only consult this when you've identified the airline; do not load the whole file speculatively.

If an airline is not listed, ask the user for the check-in URL.

| Airline | Check-in URL | Login fields | Notes |
|---|---|---|---|
| British Airways | https://www.britishairways.com/travel/managebooking/public/en_gb | Booking ref + surname | Opens 24h before; passport details required for non-UK domestic |
| Ryanair | https://www.ryanair.com/gb/en/check-in | Booking ref + email | Strict: requires app or paid airport check-in if missed online window |
| easyJet | https://www.easyjet.com/en/manage-bookings | Booking ref + surname | 30 days to 2h before departure |
| Lufthansa | https://www.lufthansa.com/check-in/web | E-ticket number OR booking ref + surname | 23h before; offers mobile boarding pass via email |
| Air France | https://www.airfrance.com/check-in | Booking ref + surname | 30h before; Flying Blue login alternative |
| KLM | https://www.klm.com/travel/check-in | Booking ref + surname | 30h before |
| United | https://www.united.com/en/us/checkin | Confirmation number + surname OR MileagePlus | 24h before; mobile pass default |
| Delta | https://www.delta.com/check-in | Confirmation number + surname | 24h before |
| American | https://www.aa.com/reservation/view/find-your-reservation | Record locator + surname | 24h before |
| Emirates | https://www.emirates.com/english/manage-booking/online-check-in/ | Booking ref + surname OR Skywards | 48h to 90min before |
| Qatar Airways | https://www.qatarairways.com/en/check-in.html | Booking ref + surname | 48h to 90min before |
| Singapore Airlines | https://www.singaporeair.com/en_UK/us/manage-booking/web-checkin/ | Booking ref + surname OR KrisFlyer | 48h to 90min before |
| Cathay Pacific | https://www.cathaypacific.com/cx/en_GB/manage-booking/online-check-in.html | Booking ref + surname | 48h to 90min before |
| Turkish Airlines | https://www.turkishairlines.com/en-int/flights/manage-booking/online-check-in/ | Booking ref + surname | 24h before |
| Wizz Air | https://wizzair.com/en-gb#/booking/select-flight | Booking ref + email | App preferred; web check-in available |

## Contributing

Add a row when you've actually completed a flow on a new airline. Include the live URL, the login fields the page accepts, and any quirk worth knowing (timing window, mobile-only, login mandatory, etc.). Don't add airlines you haven't personally tested.
