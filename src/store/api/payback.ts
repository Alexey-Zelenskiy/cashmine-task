import { type ActivityClaim, ActivityPage } from "@/entities/Activity";
import { Balances } from "@/entities/Balance";
import { Claim, ClaimOptions, type CreateClaimRequest } from "@/entities/Claim";
import { api } from "../api";

const OPTIMISTIC_PREFIX = "optimistic_";

function toActivityClaim(claim: Claim): ActivityClaim {
  return {
    id: `${OPTIMISTIC_PREFIX}${claim.id}`,
    type: "claim",
    asset: claim.asset,
    amount: `-${claim.amount}`,
    status: claim.status,
    exchange: null,
    relatedId: claim.id,
    createdAt: claim.createdAt,
  };
}

const historyApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBalances: build.query<Balances, void>({
      query: () => "balances",
      responseSchema: Balances,
      providesTags: ["Balances"],
    }),
    getActivity: build.infiniteQuery<ActivityPage, void, string | null>({
      query: ({ pageParam }) => ({
        url: "activity",
        params: pageParam ? { cursor: pageParam } : undefined,
      }),
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
      responseSchema: ActivityPage,
      providesTags: ["Activity"],
    }),
    getRecentActivity: build.query<ActivityPage, void>({
      query: () => "activity",
      responseSchema: ActivityPage,
      providesTags: ["Activity"],
      merge: (current, incoming) => {
        const known = new Set(incoming.items.map((item) => item.relatedId));
        const optimistic = current.items.filter(
          (item) =>
            item.id.startsWith(OPTIMISTIC_PREFIX) && !known.has(item.relatedId),
        );
        return { ...incoming, items: [...optimistic, ...incoming.items] };
      },
    }),
  }),
});

export const paybackApi = historyApi.injectEndpoints({
  endpoints: (build) => ({
    getClaimOptions: build.query<ClaimOptions, string>({
      query: (asset) => ({ url: "claim-options", params: { asset } }),
      responseSchema: ClaimOptions,
    }),
    createClaim: build.mutation<Claim, CreateClaimRequest>({
      query: ({ idempotencyKey, ...body }) => ({
        url: "claims",
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body,
      }),
      responseSchema: Claim,
      invalidatesTags: ["Balances", "Activity"],
      async onQueryStarted(_request, { dispatch, queryFulfilled }) {
        try {
          const { data: claim } = await queryFulfilled;
          dispatch(
            historyApi.util.updateQueryData(
              "getRecentActivity",
              undefined,
              (draft) => {
                if (!draft.items.some((item) => item.relatedId === claim.id)) {
                  draft.items.unshift(toActivityClaim(claim));
                }
              },
            ),
          );
        } catch {}
      },
    }),
    getClaim: build.query<Claim, string>({
      query: (id) => `claims/${encodeURIComponent(id)}`,
      responseSchema: Claim,
      providesTags: (_result, _error, id) => [{ type: "Claim", id }],
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          const { data: claim } = await queryFulfilled;
          dispatch(
            historyApi.util.updateQueryData(
              "getRecentActivity",
              undefined,
              (draft) => {
                const item = draft.items.find(
                  (entry) =>
                    entry.relatedId === claim.id &&
                    entry.id.startsWith(OPTIMISTIC_PREFIX),
                );
                if (item) item.status = claim.status;
              },
            ),
          );
        } catch {}
      },
    }),
  }),
});

export const {
  useGetBalancesQuery,
  useGetActivityInfiniteQuery,
  useGetRecentActivityQuery,
  useGetClaimOptionsQuery,
  useCreateClaimMutation,
  useGetClaimQuery,
} = paybackApi;
