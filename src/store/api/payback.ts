import { ActivityPage } from "@/entities/Activity";
import { Balances } from "@/entities/Balance";
import { Claim, ClaimOptions, type CreateClaimRequest } from "@/entities/Claim";
import { api } from "../api";

export const paybackApi = api.injectEndpoints({
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
    // The newest page of history; the app reads its claims to know which
    // ones are still pending and which the balances snapshot doesn't count yet
    getRecentActivity: build.query<ActivityPage, void>({
      query: () => "activity",
      responseSchema: ActivityPage,
      providesTags: ["Activity"],
    }),
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
    }),
    getClaim: build.query<Claim, string>({
      query: (id) => `claims/${encodeURIComponent(id)}`,
      responseSchema: Claim,
      providesTags: (_result, _error, id) => [{ type: "Claim", id }],
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
