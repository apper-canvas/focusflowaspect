import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/store/userSlice";
import { syncSlice } from "@/store/slices/syncSlice";

function appReducer(state = { loading: false }, action) {
  switch (action.type) {
    case 'APP_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const rootReducer = {
  app: appReducer,
  sync: syncSlice.reducer,
  user: userReducer
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