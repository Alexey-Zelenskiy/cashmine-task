# API layer, token, balances screen

Tool: Claude Code (Claude Opus), same session as the rest of the task. The amounts discussion is in [02-amounts-big-js.md](./02-amounts-big-js.md).

---

**Me:** *(pasted the API docs)* Let's do zod schemas + the api slice.

**Claude:** Before writing, checked in the installed RTK 2.13 types and source how `responseSchema` works: the schema's parsed output replaces the data, and without `catchSchemaFailure` a schema failure is thrown as fatal instead of becoming a normal query error. Then wrote:
- zod schemas for every response. Amounts stay strings validated with the API's own format rule; activity items are a union on `type`, each with its own statuses;
- a base query with a 15 s timeout that retries only temporary failures (no network, timeout, 500/503/504, and 429 after `retryAfterMs`), up to 3 attempts;
- `createClaim` takes the `idempotencyKey` as an argument, so every retry of one claim sends the same key and the server replays the first claim instead of creating a second;
- `getApiError`, which maps a client timeout and the API's 504 to the same `TIMEOUT` code, because both mean "the claim may or may not exist".

---

**Found in the browser preview:** NativeWind crashed on web with "Cannot manually set color scheme, as dark mode is type 'media'". The app has no dark theme, so `darkMode: "class"` in `tailwind.config.js` fixed it without side effects.

---

**Me:** Let's use tailwind-merge + clsx for styles, like `cn(['w-10', {'w-20': expanded}])`.

**Claude:** Checked the installed Tailwind first: NativeWind 4 runs on Tailwind 3.4, and tailwind-merge 3.x targets Tailwind 4, so it installed tailwind-merge 2.6.1. Added `utils/cn.ts` and replaced the template-string class names with `cn([...])`.

**Me:** Use FlashList for the balances, but RefreshControl might not work on web, keep that in mind.

**Claude:** react-native-web's RefreshControl only renders its children, so pull-to-refresh does nothing on web. Added a visible Refresh button in the total card, kept pull-to-refresh for native, and showed the pull spinner only for a pull, not for the 15 s background polling.

**Me:** Move `keyExtractor` outside the component, use `useCallback` for `renderItem`, move `BalanceRow` to its own file and wrap it in `memo`.

**Claude:** Done. Noted that the React Compiler is on in `app.json`, so it already memoizes components and callbacks; the manual `memo` and `useCallback` are redundant but harmless.
