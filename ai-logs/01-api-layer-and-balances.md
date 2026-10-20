# API layer, token, balances screen

Tool: Claude Code (Claude Opus), same session as the rest of the task. The amounts discussion is in [02-amounts-big-js.md](./02-amounts-big-js.md).

---

**Me:** *(pasted the API docs)* Let's write the zod schemas and the API slice.

**Claude:** Before writing, checked in the installed RTK 2.13 types and source how `responseSchema` works: the schema's parsed output replaces the data, and without `catchSchemaFailure` a schema failure is thrown as fatal instead of becoming a normal query error. Then wrote:
- zod schemas for every response. Amounts stay strings validated with the API's own format rule; activity items are a union on `type`, each with its own statuses;
- a base query with a 15 s timeout that retries only temporary failures (no network, timeout, 500/503/504, and 429 after `retryAfterMs`), up to 3 attempts;
- `createClaim` takes the `idempotencyKey` as an argument, so every retry of one claim sends the same key and the server replays the first claim instead of creating a second;
- `getApiError`, which maps a client timeout and the API's 504 to the same `TIMEOUT` code, because both mean "the claim may or may not exist".

---

**Found in the browser preview:** NativeWind crashed on web with "Cannot manually set color scheme, as dark mode is type 'media'". The app has no dark theme, so `darkMode: "class"` in `tailwind.config.js` fixed it without side effects.

---

**Me:** Let's use tailwind-merge and clsx for styling, e.g. `cn(['w-10', {'w-20': expanded}])`.

**Claude:** Checked the installed Tailwind first: NativeWind 4 runs on Tailwind 3.4, and tailwind-merge 3.x targets Tailwind 4, so it installed tailwind-merge 2.6.1. Added `utils/cn.ts` and replaced the template-string class names with `cn([...])`.

**Me:** Let's use FlashList for the balances. Keep in mind that RefreshControl might not work on web.

**Claude:** react-native-web's RefreshControl only renders its children, so pull-to-refresh does nothing on web. Added a visible Refresh button in the total card, kept pull-to-refresh for native, and showed the pull spinner only for a pull, not for the 15 s background polling.

**Me:** Move `keyExtractor` outside the component, use `useCallback` for `renderItem`, move `BalanceRow` to its own file and wrap it in `memo`.

**Claude:** Done. Noted that the React Compiler is on in `app.json`, so it already memoizes components and callbacks; the manual `memo` and `useCallback` are redundant but harmless.

**Me:** For the FlashList balance row, let's use StyleSheet, since Tailwind classes can load the JS thread.

**Claude:** Moved `BalanceRow` to `StyleSheet.create`, with the same values the Tailwind classes had (`p-4` → 16, `text-lg` → 18/28, gray-200 → `#e5e7eb`), so the row looks the same. The styles are created once, so recycled rows don't resolve class names on the JS thread. The pressed state is now a style array, `[styles.claimLabel, pressed && styles.pressed]`. The claim pill inside the row still uses `className`: it only shows while a claim is active.

**Me:** Let's show skeletons while the data is refreshing, like a React Native skeleton loader.

**Claude:** Added a `Skeleton` block that pulses its opacity with Reanimated (works on web) and a `BalancesSkeleton` with the same layout as the loaded screen, so nothing jumps when data arrives. It shows on the first load and on a refresh the user asked for (pull, Refresh, Try again), but not on the 15 s background polling, which would make the screen flicker.

**Me:** Move `ListHeaderComponent` into its own component like `BalanceRow`, and wrap it in `memo`.

**Claude:** Moved it to `BalancesHeader` with `memo`, and wrapped `refresh` in `useCallback`, otherwise a new function on every render would defeat the `memo`.

**Me:** Add a back button to each screen.

**Claude:** Added a header back button to every screen except balances. A page opened by a direct link on web has no history to go back to, so it falls back to the balances screen.

**Me:** Wrap everything that needs it in `useCallback` and `memo`.

**Claude:** Wrapped the shared and repeated components in `memo` (`Button`, `Skeleton`, the claim pill, rows and chips), moved static handlers like `goBack` to module scope, and wrapped the claim screen's handlers in `useCallback`. Chips now take a `value` and a shared `onSelect` instead of an inline closure each, otherwise `memo` would never skip them.

The React Compiler lint rule then failed with "Existing memoization could not be preserved": the compiler inferred the `useState` setters as dependencies and the manual arrays didn't list them, so it skipped optimizing the whole claim screen. Adding the (stable) setters to the dependency arrays fixed it; lint is back to 0 errors.

**Me:** The cards jump a bit after a refresh. Let's sort them, maybe by last update or by status, whichever you think is better. And let's add a nice Reanimated layout animation, e.g. when a claim settles and the money is taken, so the card changes smoothly; there's LinearTransition and so on.

**Claude:** Chose alphabetical order by asset. Sorting by USD value or by the latest update would reorder the cards exactly when the user does something (a claim, a new accrual), which is the jumping we're trying to remove; alphabetical order never changes. Animations in the row: the card animates its height with `LinearTransition` when a line or pill appears; the available amount fades in when it changes; the pending and claiming lines and the pills fade in and out. Each pill is keyed by claim and status, so when a claim goes from processing to completed the old pill fades out and the new one fades in, while the optimistic entry turning into the server's entry (same claim, same status) doesn't flicker.

**Me:** Let's group the history by date and add a sticky header for each day.

**Claude:** `groupByDay` turns the loaded pages into one header row per local day ("Today", "Yesterday", then the date) followed by that day's items, and returns the header positions for FlashList's `stickyHeaderIndices`. `getItemType` keeps headers and rows in separate recycling pools. Covered by a unit test.

**Me:** Add a skeleton and a refresh button to the history. And let's add a `history/[id]` screen, so each row opens its details: status, amounts and so on.

**Claude:** History now has a skeleton for the first load and for a manual refresh, a Refresh button (pull-to-refresh only works on native), and a details route. The API has no endpoint for a single history entry, so the details screen reads the entry from the loaded history pages; for a claim it also loads `GET /claims/{id}` for the fee, the received amount and the failure reason. An entry that isn't in the loaded pages (for example after a reload) gets an "Entry not loaded" screen with a link back to the list.
