import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "cashmine.token";

export function readStoredToken(): string | null {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function writeStoredToken(token: string | null) {
  try {
    if (token) globalThis.localStorage?.setItem(STORAGE_KEY, token);
    else globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

type AuthState = { token: string | null };
export type WithAuth = { auth: AuthState };

const initialState: AuthState = { token: readStoredToken() };

export const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    tokenChanged(state, action: PayloadAction<string | null>) {
      state.token = action.payload?.trim() || null;
    },
  },
});

export const { tokenChanged } = auth.actions;

export const selectToken = (state: WithAuth) => state.auth.token;
