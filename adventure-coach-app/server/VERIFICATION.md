# Backend Verification Log

This is a record of what has actually been run against a real database,
as distinct from what merely passed `node --check`. Given this project's
running theme - services calling routes that don't exist, models with no
migrations, imports that resolve to undefined - "it looks right" and "it
runs correctly" have been repeatedly different things here. This file
exists so that distinction stays visible.

## What was verified (2026-08-06)

Ran against a real, disposable Postgres 16 instance (not SQLite, not a mock):

1. **All 16 migrations** (`001` through `016`) ran cleanly via
   `sequelize-cli db:migrate` with zero errors - every table, enum type,
   index, and foreign key constraint was created successfully in dependency
   order.

2. **`models/index.js` loads and connects** - all 16 models registered,
   all associations resolved, `connectDatabase()` succeeds.

3. **`server/index.js` actually starts** against the real database and
   serves requests. Endpoints exercised with real HTTP requests:

   | Endpoint | Test | Result |
   |---|---|---|
   | `POST /api/auth/register` | Create a real user | 200, real UUID, real bcrypt hash generated (correctly excluded from response via `User.prototype.toJSON`), real JWT issued |
   | `POST /api/auth/login` | Correct password | 200, `success: true`, valid token |
   | `POST /api/auth/login` | Wrong password | 401, correctly rejected via `bcrypt.compare` |
   | `GET /api/bookings` | No Authorization header | 401, `requireAuth` middleware correctly blocks |
   | `GET /api/bookings` | Valid JWT | 200, real (empty) query result, correctly scoped to the authenticated user |
   | `POST /api/cart/apply-discount` | Code with no seed data | 400, cleanly reports invalid rather than crashing or faking success |
   | `GET /api/revenue-splits/configurations` | No auth needed | 200, real (empty) query |
   | `POST /api/match-coaches` | No auth needed | 200, real Coach query (empty, no coaches seeded), weather data attached |

## What was NOT verified

- **No seed data exists.** Every "empty" result above is empty because
  the database has no rows, not because the query logic was validated
  against real records. Booking/coach/payment flows with actual data
  present still need testing.
- **Stripe and PayFast are still mocked.** `POST /api/payments/create-connect-account`
  and the PayFast webhook handler were not exercised in this pass - they
  don't call real external APIs yet (see comments in `server/index.js`).
- **Concurrent/race-condition behavior** untested (e.g. double-booking the
  same slot, discount code usage-limit races).
- **The React Native frontend was not run against this backend.** This
  verification is server-only; whether `AuthService.js` and friends
  actually work against these real endpoints end-to-end (matching request/
  response shapes, header conventions, etc.) has not been checked.
- **This verification environment was disposable** - a Postgres instance
  installed via `apt-get` in a temporary sandbox, not the project's actual
  target infrastructure. Config values (DB credentials, JWT secrets) used
  for this test are test-only and are not committed anywhere.

## How to reproduce

```
cd adventure-coach-app
npm install
# create a .sequelizerc pointing at server/config, server/models, server/migrations
# set DB_* and JWT_* env vars matching server/config/database.js's expectations
npx sequelize-cli db:migrate
node server/index.js
```
