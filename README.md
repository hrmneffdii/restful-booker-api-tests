# Restful-Booker API Tests: API Test Automation

![API Tests](https://github.com/hrmneffdii/restful-booker-api-tests/actions/workflows/playwright.yml/badge.svg)

API test automation for [Restful-Booker](https://restful-booker.herokuapp.com), a public practice REST API for hotel bookings. Built with **Playwright Test** (API testing only, no browser) and **TypeScript**, with JSON schema validation, automatic test data cleanup, and CI on GitHub Actions.

> **Note:** Restful-Booker is a shared public practice service. Its data is reset periodically and responses can be slow after idle periods. Every test creates its own data and cleans it up, so tests do not depend on pre-existing records.

## Highlights

- **28 automated tests** covering all 8 endpoint and method combinations of the API.
- **API client class** (`BookingClient`) that keeps request logic out of the tests, similar to the Page Object pattern in UI testing.
- **Custom fixtures** that provide the client and a ready-made booking, with **automatic cleanup** after each test.
- **Schema validation** with Ajv for the booking, create-booking, and token responses, not only values.
- **Positive and negative coverage:** 15 positive tests and 13 negative and security-related tests.
- **Known issues tracked as tests:** API behaviour that deviates from good practice is documented with `test.fail()`, so CI stays green while the issue exists and signals when it is fixed.
- **No browser needed:** CI runs fast because there is nothing to install besides Node dependencies.

## Tech stack

| Purpose | Tool |
| --- | --- |
| Test framework | Playwright Test (`@playwright/test`, `request` fixture) |
| Language | TypeScript |
| Schema validation | Ajv (JSON Schema) |
| Manual exploration | Postman |
| Reporting | Playwright HTML report |
| CI | GitHub Actions |
| Runtime | Node.js 20+ |

## Project structure

```
restful-booker-api-tests/
├─ api/BookingClient.ts       API client (all HTTP calls live here)
├─ fixtures/index.ts          Fixtures: api (with cleanup), booking
├─ data/
│  ├─ booking.ts              Booking type and unique test data builder
│  └─ config.ts               Credentials (overridable via env vars)
├─ schemas/booking.schema.ts  JSON schemas
├─ utils/schema.ts            expectValidSchema helper
├─ tests/
│  ├─ health.spec.ts
│  ├─ auth.spec.ts
│  ├─ read.spec.ts
│  ├─ create.spec.ts
│  ├─ update.spec.ts
│  ├─ delete.spec.ts
│  ├─ negative.spec.ts
│  └─ known-issues.spec.ts
├─ bug-reports/               API-001.md ... API-003.md
├─ playwright.config.ts
└─ .github/workflows/playwright.yml
```

## Getting started

**Prerequisites:** Node.js 20 or newer and Git. No browser installation is required.

```bash
git clone https://github.com/hrmneffdii/restful-booker-api-tests.git
cd restful-booker-api-tests
npm ci
npx playwright test
```

### Configuration

Defaults point to the public service and its documented practice credentials. Override them with environment variables when needed:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_URL` | `https://restful-booker.herokuapp.com` | API base URL |
| `API_USER` | `admin` | Username for `POST /auth` |
| `API_PASSWORD` | `password123` | Password for `POST /auth` |

Example: `BASE_URL=http://localhost:3001 npx playwright test`

### Useful commands

| Command | What it does |
| --- | --- |
| `npm test` | Run all tests |
| `npm run test:smoke` | Run only tests tagged `@smoke` |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | Type-check the TypeScript code |
| `npx playwright test tests/update.spec.ts` | Run a single file |
| `npx playwright test -g "PATCH"` | Run tests matching a name |
| `npx playwright test --repeat-each=5` | Repeat tests to detect flakiness |

## Endpoint coverage

| Endpoint | Method | Tests | What is covered |
| --- | --- | --- | --- |
| `/ping` | GET | 1 | Health check |
| `/auth` | POST | 4 | Valid token, token schema, wrong password, bad credentials status (API-001) |
| `/booking` | GET | 2 | List ids, filter by firstname |
| `/booking/:id` | GET | 4 | Correct data, schema, non-existent id, non-numeric id |
| `/booking` | POST | 8 | Create, schema, round trip, unique ids, HTML input observation, 3 missing required fields (API-002) |
| `/booking/:id` | PUT | 4 | Valid token, Basic auth, no credentials, invalid token |
| `/booking/:id` | PATCH | 1 | Partial update changes only the given fields |
| `/booking/:id` | DELETE | 4 | With token, no credentials, invalid token, non-existent id (API-003) |
| **Total** | | **28** | |

Tests tagged `@smoke`: ping, valid token, list bookings, create booking, PUT with token, and DELETE with token.

## Findings

Full reports are in [`bug-reports/`](./bug-reports). Each finding has a matching test in `tests/known-issues.spec.ts` marked with `test.fail()`. While the issue exists the test is reported as passing. Once it is fixed, the test fails, which is the signal to remove `test.fail()` and keep it as a regression check.

| ID | Title | Severity | Priority | Status |
| --- | --- | --- | --- | --- |
| [API-001](./bug-reports/API-001.md) | `POST /auth` returns 200 OK for wrong credentials instead of a 4xx status | Medium | P3 | Open |
| [API-002](./bug-reports/API-002.md) | `POST /booking` returns 500 Internal Server Error when a required field is missing | High | P2 | Open |
| [API-003](./bug-reports/API-003.md) | `DELETE /booking/:id` returns 405 Method Not Allowed for a non-existent booking instead of 404 | Low | P3 | Open |

**Observations (not filed as bugs):**

- `GET /ping` and a successful `DELETE` both return `201`, which differs from the usual `200` or `204` convention. Tests assert the actual documented behaviour.
- HTML input such as `<script>alert(1)</script>` is stored and returned unchanged. This is only a risk if a client renders the data without escaping, so it is recorded as an observation rather than a vulnerability.

## Test design approach

- **Black-box API testing:** tests use only the public contract (endpoint, status, headers, body).
- **Explore first in Postman, automate second:** behaviour is verified manually, then locked in with automated tests.
- **Independent tests:** each test builds unique data (`buildBooking`) and the `api` fixture deletes everything it created, so tests run in parallel and in any order.
- **More than status codes:** responses are checked for values, structure (JSON schema), and side effects (create then read back, delete then confirm 404).
- **Auth variants:** both cookie token and Basic auth are covered, plus missing and invalid credentials.
- **Techniques used:** equivalence partitioning (valid, missing, invalid input), negative testing, and round-trip verification.

## Reporting

- **Findings:** [`bug-reports/`](./bug-reports) with steps to reproduce, expected and actual results, evidence, impact, and retest criteria.
- **Automated reports:** every CI run uploads the Playwright HTML report as an artifact in the **Actions** tab.
- **Manual exploration:** the Postman collection separately in local computers.

## CI/CD

The workflow in `.github/workflows/playwright.yml` runs on every push to `main`, every pull request, nightly, and manually through `workflow_dispatch`. Retries are enabled in CI to absorb occasional slowness of the shared public service. The HTML report is kept as an artifact for 14 days.

## Limitations

- The target is a shared practice service, so results can be affected by its availability and periodic data resets.
- The API has a single admin account, so authorization checks across different users (for example IDOR) cannot be tested here.
- No load or performance testing, and no contract testing against an OpenAPI document.
- Observed quirks reflect the service at the time of testing and may change.
