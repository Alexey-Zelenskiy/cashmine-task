# Amounts: own bigint code → big.js

Tool: Claude Code (Claude Opus), same session as the rest of the task.

---

**Me:** Let's add a suitable library for the amount calculations. Look into it and find the best option.

**Claude:** Explained the first version of `src/utils/amount.ts`: amounts were turned into `bigint` counts of the smallest unit ("1.25" → 125 at scale 2), and the USD total multiplied amount × price as integers, summed, and rounded to cents once.

Options it gave:
- keep the hand-written `bigint` code: no dependency, but harder to read and explain;
- **big.js** (7.0.1, ~6 KB): exact decimal math on strings, `new Big("0.5").minus("0.0012").toFixed()` → `"0.4988"`;
- decimal.js: same idea, about 5× bigger, more than needed.

Recommended big.js, with one caveat: big.js accepts `".5"` and `"1e-3"`, which the API rejects, so the amount format still needs our own check before anything reaches Big.

**Me:** Let's use big.js for the calculations, and note it in ai-logs.

**Decision: big.js for all amount math.**

---

## Checked before rewriting

Claude ran big.js 7.0.1 in Node before using it:

```
new Big("0.00000001").toString()   → "1e-8"        ← exponent form
new Big("0.00000001").toFixed()    → "0.00000001"
new Big("0.5").minus("0.0012").toFixed() → "0.4988"
new Big(".5"), new Big("1e-3"), new Big("05")  → all accepted
```

So:
- results are always printed with `toFixed()`, never `toString()`: a BTC amount like 0.00000001 would otherwise show as "1e-8";
- the format (`/^(0|[1-9]\d*)(?:\.(\d+))?$/`) and the decimal places are validated by our own code first.

---

## Explaining the math

**Me:** You take over the amount calculations, and explain simply, with examples, how they work.

**Claude:** Rewrote `src/utils/amount.ts` on big.js and explained each function:

| Function | What it does | Example |
|---|---|---|
| `decimalPlaces` | checks the API's amount format and counts decimal places | `"0.5"` → 1, `".5"` → null |
| `validateClaimAmount` | the API's claim rules: format, max decimals, ≥ minAmount, ≤ available | `"0.005"` with min 0.01 → "The minimum is 0.01" |
| `receiveAmount` | amount minus fee | `"0.5"` − `"0.0012"` → `"0.4988"` |
| `isZero` | zero check for any spelling of zero | `"0.00"` → true |
| `totalUsd` | (available + pending + claiming) × usdPrice per asset, summed exactly, rounded to cents once | two assets worth $0.005 each → `"0.01"`, not `"0.02"` |
| `formatUsd` | cents and thousands separators | `"1234.5"` → `"$1,234.50"` |

**Me:** Add the examples to `amount.ts`.

Claude ran every example through big.js in Node first, then added them as comments above each function.
