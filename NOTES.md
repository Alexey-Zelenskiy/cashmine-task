# Notes

## Decisions

**Amounts.** Amounts stay decimal strings from the API to the screen and never become JS numbers. All math goes through big.js (exact decimal arithmetic). Two big.js traps are handled: it accepts `".5"`, `"1e-3"` and `"05"`, so the API's format and the asset's decimal places are checked with our own pattern first; and `toString()` prints small values as `"1e-8"`, so results are always printed with `toFixed()`. An amount with too many decimal places is rejected, never rounded. The USD total multiplies each asset exactly and rounds to cents once, half up, so per-asset rounding can't invent a cent. Alternatives: hand-written `bigint` math (no dependency, but harder to read and review) and decimal.js (same idea, about 5× bigger).

**Balance right after a claim.** The balance drops at once and never jumps back. The app reads claims from the newest page of `GET /activity`; a claim created after the balances snapshot (`createdAt` later than `asOf`) is applied locally: pending moves the amount from available to claiming, completed takes it out of available, failed changes nothing. The adjustment disappears only when a snapshot newer than the claim arrives, because that snapshot already counts it. That fixes both complaints: "the balance didn't change, so I claimed again" (it changes immediately) and "it dropped, then jumped back" (a stale snapshot never removes the adjustment). Each asset card shows a pill per claim: processing, completed, or failed with the reason. Alternatives considered: show the snapshot as is with a banner and disable Claim until it catches up (honest numbers, but the balance looks unchanged for up to 15 s), or just refetch (exactly the first complaint). The server checks `available` live, so the adjustment is display only and can't cause a double claim.

**Unknown claim outcome.** Each reviewed claim gets one Idempotency-Key, created when the user taps Review. Temporary failures (no network, client timeout, 500, 503, 504, 429) are retried automatically up to 3 times with the same key, which is safe: the server replays the first claim. If all attempts fail, the screen says the claim may or may not exist and offers "Check again", which re-sends the same body with the same key: it returns the existing claim or creates it once. The amount can't be edited there, since a new amount means a new key. A client timeout and the API's 504 are treated the same. A definite rejection (400, 401, 409) goes back to the form with the reason, and the next review gets a new key.

**Other decisions.**
- The token is entered in the app, kept in localStorage, and changing it resets the whole API cache. It is never in the code, env files or the build.
- Single-page web export, not server rendering: localStorage doesn't exist during a server render, so the server would render the token screen and the browser the balances.
- Every response is validated with zod at the API boundary (RTK Query `responseSchema`). A mismatch becomes an error state, not a crash.
- Claims come from `GET /activity` rather than app state, relying on the API: they survive a reload and include claims made elsewhere. History is polled every 2 s while a claim is pending and every 15 s otherwise; balances every 15 s, matching the server's snapshot cadence.
- A successful claim is written into the cached history at once (RTK Query `updateQueryData`), and the history query's `merge` keeps it on top until the server's history lists it. Without this, testing showed the balance staying unchanged after a claim: the server's history didn't have the claim yet.

## Working with AI

- **A prompt that didn't get what I needed.** The first amount code was hand-written `bigint` math I couldn't easily follow or defend. I asked for a suitable library and then for a plain explanation with examples of every function; that's where big.js and the examples in `amount.ts` come from. [ai-logs/02-amounts-big-js.md](ai-logs/02-amounts-big-js.md)
- **AI output that was wrong or risky.** The AI assumed a new claim appears in `GET /activity` right away. When I tested a 100 claim on a 1391 balance, the claim completed but the balance stayed at 1391, so the app now puts the claim into the cached history itself (optimistic update). When I asked to wrap everything in `useCallback` and `memo`, the dependency arrays it wrote made the React Compiler skip optimizing the whole claim screen; the compiler's lint rule caught it ("Existing memoization could not be preserved"). Also, before using big.js it ran it in Node and found that `toString()` returns `"1e-8"` and that it accepts `".5"`, which would have shown and sent wrong amounts. [ai-logs/01](ai-logs/01-api-layer-and-balances.md), [ai-logs/02](ai-logs/02-amounts-big-js.md)
- **Where I overruled the AI.** It recommended keeping claims in a Redux slice, filled from the create and status responses, for an instant update. I chose to rely on the API's history instead, so pending claims survive a reload and claims from other devices show up. [ai-logs/03-balance-after-claim.md](ai-logs/03-balance-after-claim.md)

## Not done / known issues

- The paged history screen (task item 4) isn't built; the cursor-based infinite query for it is ready.
- If the user leaves the "couldn't confirm" screen without checking, the key is lost; a claim that did go through still appears in history and the balance. Next step: keep unconfirmed requests (body and key) in localStorage and offer to check them on the next open.
- The claim status screen isn't its own route (`/claims/[id]`), so a reload loses it; the pill on the balances card still shows the status.
- Tests cover the amount logic and the balance adjustment, not the screens.
- Web only: on native the token would go to SecureStore instead of localStorage.
