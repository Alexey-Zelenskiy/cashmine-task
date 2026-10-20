# CashMine practical task

Live: <!-- deployed link -->

Expo (React Native, TypeScript) app delivered as a mobile web app.

## Run locally

```bash
pnpm install
pnpm web
```

Checks: `pnpm typecheck`, `pnpm test`.

## Deploy

Server output (server rendering), hosted on EAS Hosting:

```bash
pnpm export:web
npx eas-cli deploy --prod
```

## Structure

```
src/
  app/          routes only (Expo Router): every file is a URL
  screens/      screen bodies the routes render
  components/   shared UI
  hooks/        shared hooks
  store/        Redux store + RTK Query api (endpoints injected per feature)
  utils/        standalone helpers, tests next to them
```

## Stack

| Concern      | Choice                                   | Why                                                                                 |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| Routing      | Expo Router, server output               | Routes are real URLs; pages are server-rendered                                     |
| Server state | RTK Query                                | Caching and request states; `onCacheEntryAdded` streams live updates into the cache |
| Validation   | zod via RTK Query `responseSchema`       | Every response is parsed, so a shape mismatch fails at the boundary                 |
| Forms        | react-hook-form + zod                    | One schema for types and validation                                                 |
| Lists        | FlashList                                | Recycling list that also runs on web                                                |
| Styling      | NativeWind (Tailwind)                    | Same classes on web and native                                                      |
| Tests        | jest-expo + React Native Testing Library |                                                                                     |

## Decisions and trade-offs

<!-- filled in during the task -->

## With more time

<!-- filled in during the task -->

## AI usage

Conversations are in [`ai-logs/`](./ai-logs).
