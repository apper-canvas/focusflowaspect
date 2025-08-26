import { configureStore } from "@reduxjs/toolkit";

// Initial root reducer - can be expanded with feature slices
const rootReducer = {
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