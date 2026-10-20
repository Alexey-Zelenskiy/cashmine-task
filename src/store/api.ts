import type { SerializedError } from "@reduxjs/toolkit";
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { ApiErrorBody, type ApiErrorCode } from "@/entities/ApiError";
import { selectToken, type WithAuth } from "./slices/auth";

export const API_BASE_URL = "https://task-api.cashmine.io/v1";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const MAX_RETRY_DELAY_MS = 10_000;
const INVALID_RESPONSE = "INVALID_RESPONSE";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  prepareHeaders: (headers, { getState }) => {
    const token = selectToken(getState() as WithAuth);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

function getRetryDelayMs(
  error: FetchBaseQueryError,
  attempt: number,
): number | null {
  const backoff = 500 * 2 ** (attempt - 1);

  if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") {
    return backoff;
  }
  if (error.status === 429) {
    const body = ApiErrorBody.safeParse(error.data);
    const delay = (body.success && body.data.error.retryAfterMs) || backoff;
    return delay <= MAX_RETRY_DELAY_MS ? delay : null;
  }
  if (error.status === 500 || error.status === 503 || error.status === 504) {
    return backoff;
  }
  return null;
}

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  for (let attempt = 1; ; attempt++) {
    const result = await rawBaseQuery(args, api, extraOptions);
    if (!result.error || attempt === MAX_ATTEMPTS) return result;

    const delay = getRetryDelayMs(result.error, attempt);
    if (delay === null || api.signal.aborted) return result;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Balances", "Activity", "Claim"],
  catchSchemaFailure: (error) => ({
    status: "CUSTOM_ERROR" as const,
    error: INVALID_RESPONSE,
    data: error.issues,
  }),
  endpoints: () => ({}),
});

export type ApiError = {
  code: ApiErrorCode | "NETWORK" | typeof INVALID_RESPONSE | "UNKNOWN";
  message: string;
  field?: string;
  retryAfterMs?: number;
};

export function getApiError(
  error: FetchBaseQueryError | SerializedError,
): ApiError {
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") {
      return { code: "NETWORK", message: "Can't reach the server" };
    }
    if (error.status === "TIMEOUT_ERROR") {
      return { code: "TIMEOUT", message: "The server didn't answer in time" };
    }
    if (error.status === "CUSTOM_ERROR" && error.error === INVALID_RESPONSE) {
      return {
        code: INVALID_RESPONSE,
        message: "The server sent data the app doesn't understand",
      };
    }
    const body = ApiErrorBody.safeParse(error.data);
    if (body.success) return body.data.error;
  }
  return { code: "UNKNOWN", message: "Something went wrong" };
}
