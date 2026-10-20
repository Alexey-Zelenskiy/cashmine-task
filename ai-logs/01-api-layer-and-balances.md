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
