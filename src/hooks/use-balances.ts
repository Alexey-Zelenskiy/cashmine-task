import { useMemo } from "react";

import {
  paybackApi,
  useGetBalancesQuery,
  useGetRecentActivityQuery,
} from "@/store/api/payback";
import { claimsOf, withUnsnapshotted } from "@/utils/claims";

const POLL_MS = 15_000;
const PENDING_POLL_MS = 2_000;

export function useBalances() {
  const query = useGetBalancesQuery(undefined, {
    pollingInterval: POLL_MS,
    skipPollingIfUnfocused: true,
  });

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
