# CashMine practical task

Live: https://cashmine-task.expo.app

An Expo (React Native, TypeScript) app, delivered as a web build for a phone-width screen. On first open it asks for your API token and keeps it in this browser only.

## Run locally

```bash
pnpm install
pnpm web
```

Checks: `pnpm typecheck`, `pnpm test`, `pnpm lint`.

## What works

- **Token:** entered on first open, saved in the browser, changeable from the balances screen.
- **Balances:** every asset with available, pending and claiming, the total in USD, and when the data is from. Loading skeletons, an error state with retry, a stale-data banner, pull-to-refresh on native and a Refresh button on web. Refreshes every 15 s.
- **Claim:** pick an asset, enter an amount or tap Max, see the minimum, fee and what you'll receive, review, confirm, then follow the status until it completes or fails. The amount is checked against the API's rules as you type.
- **After a claim:** the balance drops right away and a pill on the asset's card shows the claim's status.
- **History:** accruals, reversals and claims, newest first, grouped by day with sticky headers, loading the next page as you scroll; a details screen per entry (fee, received amount and failure reason for claims).
- **Failures:** temporary errors are retried with the same Idempotency-Key; an unknown outcome has its own screen to check again safely.
- **Tests:** unit tests for amount parsing, validation, fee, totals and the balance adjustment (`src/utils/*.test.ts`).

Decisions and known issues: [NOTES.md](./NOTES.md). AI conversations: [ai-logs/](./ai-logs).
