import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { useDispatch, useSelector } from "react-redux";

import { api } from "./api";
import { auth, tokenChanged, writeStoredToken } from "./slices/auth";

const listener = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    [auth.reducerPath]: auth.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listener.middleware).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

listener.startListening.withTypes<RootState, AppDispatch>()({
  actionCreator: tokenChanged,
  effect: (_action, { getState, dispatch }) => {
    writeStoredToken(getState().auth.token);
    dispatch(api.util.resetApiState());
  },
});

setupListeners(store.dispatch);

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
