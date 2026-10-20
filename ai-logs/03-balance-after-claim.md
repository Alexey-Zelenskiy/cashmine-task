# Balance right after a claim

Tool: Claude Code (Claude Opus), same session as the rest of the task.

---

**Claude:** The server recomputes balances every 15 s, so a claim that was just created may not be in the snapshot yet. Options:

**A. Subtract locally right away, drop the adjustment by `asOf`.** After the 201 the app remembers the claim and shows `available − amount`, `claiming + amount`. The adjustment is removed only when a snapshot with `asOf` later than the claim's `createdAt` arrives, because that snapshot already counts it.
- "The balance didn't change, so I claimed again": fixed, the balance drops at once.
- "The balance dropped and then jumped back": also fixed. That jump happens when an optimistic value is overwritten by a stale snapshot; here a stale snapshot doesn't remove the adjustment.
- If the claim fails, the amount honestly returns to available, with the reason.

**B. Don't touch the numbers, show a banner.** The snapshot is shown as is, plus "Claim of 0.5 ETH sent, the balance updates within 15 s", and Claim is disabled for that asset until the snapshot catches up. The numbers are always the server's, but for up to 15 s the balance looks unchanged, and only the disabled button protects the first user from claiming again.

**C. Do nothing, just refetch balances.** Exactly the first user's scenario; listed for completeness.

I'd go with A. Money can't be double-claimed either way: the server checks `available` live, the local adjustment is display only.

**Me:** Yeah, let's go with the optimistic update. But I'd also like pills on the card showing that a claim may still be processing. They should be informative.

**Decision: A, plus a status pill per claim on the asset's card.** The pill says whether the claim is processing (and that the amount is already out of available), completed (what was sent), or failed (why, and that the amount returns to available). It stays until a snapshot taken after the claim settled shows the final balance.

---

## Where the app learns about claims

The first version kept claims in a Redux slice, filled from the `POST /claims` and `GET /claims/{id}` responses.

**Me:** Let's use `GET /v1/activity` instead of keeping claims in the store. Let's rely on the API.

**Claude:** Removed the slice. The app now reads the newest history page: pending claims and claims the balances snapshot doesn't count yet get a pill and adjust the balance (claim amounts in history are negative, so their absolute value is used). History is polled every 2 s while a claim is pending and every 15 s otherwise; creating a claim refetches it at once. A failed pill fetches the claim for its reason. The status screen polls `GET /claims/{id}` and stops once the claim settles.
