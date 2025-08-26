import { configureStore } from "@reduxjs/toolkit";
import { syncSlice } from "@/store/slices/syncSlice";

// Simple app reducer to provide valid store until feature slices are added
const appReducer = (state = { loading: false }, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

// Root reducer with placeholder - can be expanded with feature slices
const rootReducer = {
  app: appReducer,
  sync: syncSlice.reducer,
  // Add feature reducers here as they're created
  // e.g., timer: timerSlice.reducer,
  // projects: projectsSlice.reducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__,
});