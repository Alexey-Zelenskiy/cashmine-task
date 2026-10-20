import Big from "big.js";

import type { ActivityClaim, ActivityItem } from "@/entities/Activity";
import type { Balance } from "@/entities/Balance";

export function claimsOf(items: ActivityItem[]): ActivityClaim[] {
  return items.filter((item): item is ActivityClaim => item.type === "claim");
}

export function isInSnapshot(
  claim: Pick<ActivityClaim, "createdAt">,
  asOf: string,
) {
  return new Date(asOf) >= new Date(claim.createdAt);
}

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
