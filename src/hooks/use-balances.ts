import { useMemo } from "react";

import {
  paybackApi,
  useGetBalancesQuery,
  useGetRecentActivityQuery,
} from "@/store/api/payback";
import { claimsOf, withUnsnapshotted } from "@/utils/claims";

const POLL_MS = 15_000;
// Claims settle within about 20 s, so while one is pending the history is
// polled faster to show the result soon after it happens
const PENDING_POLL_MS = 2_000;

// Balances as the server has them right now: the latest snapshot plus the
// claims from history it doesn't count yet. Home and Claim both read this, so
// Max and validation never use an amount that has already been claimed
export function useBalances() {
  const query = useGetBalancesQuery(undefined, {
    pollingInterval: POLL_MS,
    skipPollingIfUnfocused: true,
  });

  // Reads the cached history without subscribing, to pick the polling rate
  const { data: cachedActivity } =
    paybackApi.endpoints.getRecentActivity.useQueryState();
  const hasPending = claimsOf(cachedActivity?.items ?? []).some(
    (claim) => claim.status === "pending",
  );
  const activity = useGetRecentActivityQuery(undefined, {
    pollingInterval: hasPending ? PENDING_POLL_MS : POLL_MS,
    skipPollingIfUnfocused: true,
  });

  const claims = useMemo(
    () => claimsOf(activity.data?.items ?? []),
    [activity.data],
  );

  const items = useMemo(
    () =>
      query.data?.items.map((balance) =>
        withUnsnapshotted(balance, query.data!.asOf, claims),
      ),
    [query.data, claims],
  );

  return { ...query, items, claims };
}
