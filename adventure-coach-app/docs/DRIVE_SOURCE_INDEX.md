# Where the rest of FlowCrew lives: the Google Drive source

Written 24 November 2026. This repository is a partial, file-by-file copy of a Google Drive folder
(`Apps/workspace/adventure-coach-app`, owned by the daviddowning.richard account). About 100 files
were copied in August 2026; the design documents and the camera and wind code below never were.
This page records what is there, where the documents disagree, and what has since been built on
Vula, so nobody has to rediscover it.

The files themselves are not copied here: they were read in Drive, and the links below open them.

## Files read on 24 November 2026

| File | What it is | Drive id |
|---|---|---|
| `flowcrew-implementation-guide.md` | Colours, type, spacing, the four screens of the booking flow, navigation | `1-vTTD50EHwvGKTC5wjvkuXt46t-oNlmd` |
| `flowcrew-responsive-guidelines.md` | Responsive rules, the five navigator screens, placeholder asset sizes | `1EvsdL8LUXk1fhRMLc13CFQBSsiyKwPdN` |
| `CORRECTED_FLOWCREW_DESIGN.md` | The "ocean" glass-effect welcome screen, a blue palette | `18Z4bpI_Fyfi92ibqd8DfI4fIPBSHcf0y` |
| `ENHANCED_FLOWCREW_LOGO.md` | A wave-emoji logo in a glass circle | `1knCd98zYfoQDY2pADvNtyR0KR9q39d-5` |
| `UI_UX_DESIGN_ANALYSIS.md` | Design analysis, a third palette | `1huXFv-LrnGErL1xPgC_sDevRy8tiW_M8` |
| `COMPLETE_UI_UX_VERIFICATION.md` | Screen-by-screen claims, accuracy figures | `1EPGBNaBHv2w67-SADSTD9EPJTROIBl_V` |
| `ENHANCED_UI_UX_IMPLEMENTATION.md` | Effects and motion values | `1L1bIh34UocZtFQhWY2yay3TZxch--6ho` |
| `IMPLEMENTATION_STATUS.md` | "95% complete" status report | `1wjWhPwMIXsY_Bj6yNScDs3btl2AfTnk2` |
| `IMPLEMENTATION_ROADMAP.md` | Week-by-week roadmap | `11bY8HnnaTkiCoHMfsCIxP3dCbKI9AzGo` |
| `ENHANCED_SCHOOL_MANAGEMENT_SYSTEM.md` | School dashboard, school price tiers | `1rp_qbHhRtbHHh6gYq-xvvJSFm943F6Cw` |
| `HIERARCHICAL_SUBSCRIPTION_SYSTEM.md` | Coach and school subscriptions, inheritance | `1BAB4UMQNll8lZDYuMHoW5vxffPObmGsC` |
| `AI_FEATURES_GUIDE.md` | The four AI services and their demo mode | `1Vc5a69-kfl92zsdgf2ssoyTymho0e9Aw` |
| `WaterConditionCamera.js` | Phone camera screen (expo-camera) | `1iNPWHFWnPHGKLqxFtZbUhChS4R0pQBUY` |
| `WaterConditionCamera.web.js` | Web version of the camera screen | `1bPD642bll5pECbkuC3UiJsQ6LZ0RNfgi` |
| `WindIntelligenceService.js` | Coach condition reports fused with a forecast | `1fhda6GNGtepHeALqop3L76y1EckxwjIv` |
| `flowcrew-preview.html` | Static mock-up of the Gear Selection screen | `1Z6QkEwxp5cDdBSs-OMJk3tCFAdII_D6M` |

Open one with `https://drive.google.com/file/d/<id>/view`. The folder is
`https://drive.google.com/drive/folders/1h14NWrGHUrAhuwCNYrKTeazxxUBrom40`. Not read: `scripts/`,
`services/`, most of `src/`, and other status documents (`CHAT_WHATSAPP_INTEGRATION_STATUS.md`,
`COACH_REGISTRATION_SYSTEM_STATUS.md`, `SUBSCRIPTION_SYSTEM_IMPLEMENTATION.md`,
`beta-testing-plan.md`, `DEPLOYMENT_COMPLETE.md`).

## What the documents describe

**Customer:** welcome screen; Discover (also a swipe version: left to pass, right to like, up to
"super like"); gear selection; checkout; a cart with packages and discount codes; a booking
confirmation; a student portal.

**Coach:** a portal with availability (a time grid with templates), students (active, frequent,
new, inactive, with notes), bookings (confirm, cancel, complete, no-show) and earnings.

**School or shop:** a coach roster with email invitations, a revenue-split manager, subscription
and analytics tabs.

**Money:** the platform takes 2.5%. An independent coach keeps 97.5%. An affiliated coach gets 70%,
the shop 27.5%, the platform 2.5%. Coach subscriptions: Free (10 students), $19.99 (50), $49.99
(200), $99.99 (1,000) a month, in US dollars.

## Where the documents disagree

- **Colours.** Three palettes. Two documents use an iOS blue (`#007AFF`), one adding "sunset
  orange" (`#FF6B35`). The implementation guide, the design-system file in this repository, the
  preview page and the logo use lime, teal and blue: `#7ED321`, `#00D4AA`, `#2196F3`. The work on
  Vula uses the lime, teal and blue set.
- **Booking flow.** "5-step booking wizard" in one document, "3-step booking process" in another.
- **School prices.** $79.99 / $149.99 / $299.99 in one document; $99.99 / $199.99 / $399.99 in
  another.
- **Logo.** An infinity loop with a wave (the assets in this repository) against a wave emoji in a
  glass circle (`ENHANCED_FLOWCREW_LOGO.md`).
- **Status.** `IMPLEMENTATION_STATUS.md` says "95% COMPLETE … Production Ready" and, in the same
  file, lists the database, live payments and hosting as still to do. The school and subscription
  documents say "100% COMPLETE" and list the backend, the database schema, payments and email
  invitations as next steps.

## The camera and the wind service, as written

The design is a coach on the beach photographing the water with their own phone. No fixed camera
appears anywhere.

- `WaterConditionCamera.web.js` never looks at the photo. It returns random numbers:
  `waveHeight: Math.random() * 3 + 1`, `windSpeed: Math.random() * 15 + 5`, a random pick from
  `['Good', 'Fair', 'Excellent']`, under a comment `// Simulate water condition analysis`. The
  screen is labelled "AI-powered condition analysis".
- `WaterConditionCamera.js` takes a real photo and passes it to `MLService.analyzeWaterConditions`
  and `ImageProcessingService`, which were not among the files read. Whether those are real is
  unknown.
- `WindIntelligenceService.js` averages coach reports from the last three hours with a forecast.
  The averaging is real arithmetic. The forecast is a hardcoded placeholder (wind 15, direction
  225, gusts 20, waves 1.5), wind-from-audio is a placeholder (`12 + Math.random() * 5`), and
  `getIntegratedForecast` calls two functions the file doesn't define.
- `AI_FEATURES_GUIDE.md` lists "Image-based condition analysis" and "Local surf cam integration"
  as future work. `COMPLETE_UI_UX_VERIFICATION.md` claims 89% accuracy from "NOAA, Surfline, Local
  Sensors"; nothing in the code read refers to either service.

A PWA was never built: it is listed under remaining work.

## What has been built on Vula since (branch `ccr-ce6492ce-8pwvp8` of Vula-Group, pull request 384)

- A water-sports business type, with lessons and gear hire asked for on WhatsApp and confirmed by a
  person, quoted from the school's own price list.
- A real forecast for the school's spot (swell and wind), shown hour by hour and sent to the team
  the evening before each lesson.
- **The coach's beach photo, really read**: a vision model answers in fixed words (surface, a wave
  size as a body height, how busy), checked in code; a photo that doesn't show the water saves
  nothing; the photo itself is not kept.
- The FlowCrew customer app as an installable web app (`/flow/<school>`): Home, Book, Bookings,
  Chat, in the lime, teal and blue look with the floating tab bar.
- FlowCrew's logo and colours on the school's dashboard, with "FlowCrew · Powered by Vula".

Not carried over: swipe discovery, the cart and discount codes, coach subscriptions, the platform's
2.5%, payouts, a map.
