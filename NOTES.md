# Notes

## Decisions

**Single-page web build, not server rendering.** The token lives in the browser's localStorage, which doesn't exist during a server render. With server output the server would render the "enter your token" screen and the browser would then render balances, a hydration mismatch on every open. Nothing here needs SEO or a server, so the app is exported as a plain SPA (`web.output: "single"`) and any static host works. Alternative: keep server output and read the token only after mount, at the cost of a flash of the token screen on every load.

**Token storage.** The token is never in the code, env files or the build. It's entered on first open, kept in Redux and mirrored to localStorage. Changing it resets the whole RTK Query cache, because every response belongs to one token and nothing from the old one may show.

## Working with AI

<!-- three cases with links into ai-logs/ -->

## Not done / known issues

<!-- filled in at the end -->
