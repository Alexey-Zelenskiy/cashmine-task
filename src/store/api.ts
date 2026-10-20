import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Endpoints are injected per feature with api.injectEndpoints, each with a zod
// responseSchema so a response the brief didn't promise fails at the boundary
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      // Adjust to the auth scheme in the brief
      headers.set(
        "Authorization",
        `Bearer ${process.env.EXPO_PUBLIC_API_TOKEN}`,
      );
      return headers;
    },
  }),
  endpoints: () => ({}),
});
