import Big from "big.js";

import type { ActivityClaim, ActivityItem } from "@/entities/Activity";
import type { Balance } from "@/entities/Balance";

/**
 * @description The claims among activity items.
 */
export function claimsOf(items: ActivityItem[]): ActivityClaim[] {
  return items.filter((item): item is ActivityClaim => item.type === "claim");
}

/**
 * @description Whether the balances snapshot taken at `asOf` already counts
 * this claim. The server moves the amount out of `available` the moment the
 * claim is created, but the snapshot is only recomputed every 15 s.
 * @example
 * isInSnapshot({ createdAt: "2026-10-20T18:00:05Z" }, "2026-10-20T18:00:00Z"); // false
 * isInSnapshot({ createdAt: "2026-10-20T18:00:05Z" }, "2026-10-20T18:00:15Z"); // true
 */
export function isInSnapshot(
  claim: Pick<ActivityClaim, "createdAt">,
  asOf: string,
) {
  return new Date(asOf) >= new Date(claim.createdAt);
}

/**
 * @description The balance as the server has it right now: the snapshot plus
 * the claims it doesn't count yet. A pending claim moves its amount from
 * available to claiming, a completed one takes it out of available, a failed
 * one changes nothing (the amount came back). Once a snapshot newer than the
 * claim arrives, the snapshot alone is used, so the number never drops and
 * then jumps back. Activity amounts of claims are negative.
 * @example
 * // Snapshot from before a pending 0.5 ETH claim
 * withUnsnapshotted(
 *   { asset: "ETH", available: "2", claiming: "0", ... },
 *   "2026-10-20T18:00:00Z",
 *   [{ asset: "ETH", amount: "-0.5", status: "pending", createdAt: "2026-10-20T18:00:05Z", ... }],
 * ); // available "1.5", claiming "0.5"
 */
export function withUnsnapshotted(
  balance: Balance,
  asOf: string,
  claims: ActivityClaim[],
): Balance {
  let available = new Big(balance.available);
  let claiming = new Big(balance.claiming);

  for (const claim of claims) {
    if (claim.asset !== balance.asset || isInSnapshot(claim, asOf)) continue;
    if (claim.status === "failed") continue;
    const amount = new Big(claim.amount).abs();
    available = available.minus(amount);
    if (claim.status === "pending") claiming = claiming.plus(amount);
  }

  return {
    ...balance,
    available: available.toFixed(),
    claiming: claiming.toFixed(),
  };
}

/**
 * @description The claims worth a pill on the asset's card: every pending
 * one, and settled ones the balances snapshot doesn't count yet.
 * @example
 * claimsToShow(claims, "ETH", asOf).map((c) => c.status); // ["pending", "failed"]
 */
export function claimsToShow(
  claims: ActivityClaim[],
  asset: string,
  asOf: string,
) {
  return claims.filter(
    (claim) =>
      claim.asset === asset &&
      (claim.status === "pending" || !isInSnapshot(claim, asOf)),
  );
}
