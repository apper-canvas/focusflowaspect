import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/store/userSlice";
import { syncSlice } from "@/store/slices/syncSlice";
import { createSlice } from "@reduxjs/toolkit";

// Goal tracking slice
const initialGoalState = {
  goals: {
    daily: {
      workHours: 8,
      focusSessions: 5,
      breakTime: 60,
      learningTime: 60
    },
    weekly: {
      billableHours: 40,
      learningHours: 5,
      meetingHours: 10,
      projectHours: 25
    },
    projects: [],
    notifications: {
      dailyReminders: true,
      weeklyProgress: true,
      goalAchieved: true,
      behindTarget: true
    }
  },
  achievements: [],
  recommendations: [],
  lastUpdated: null
};

export const goalSlice = createSlice({
  name: 'goals',
  initialState: initialGoalState,
  reducers: {
    setGoals: (state, action) => {
      state.goals = action.payload;
      state.lastUpdated = Date.now();
    },
    updateDailyGoal: (state, action) => {
      const { field, value } = action.payload;
      state.goals.daily[field] = value;
      state.lastUpdated = Date.now();
    },
    updateWeeklyGoal: (state, action) => {
      const { field, value } = action.payload;
      state.goals.weekly[field] = value;
      state.lastUpdated = Date.now();
    },
    addProjectGoal: (state, action) => {
      state.goals.projects.push(action.payload);
      state.lastUpdated = Date.now();
    },
    updateProjectGoal: (state, action) => {
      const { projectId, field, value } = action.payload;
      const project = state.goals.projects.find(p => p.id === projectId);
      if (project) {
        project[field] = value;
        state.lastUpdated = Date.now();
      }
    },
    removeProjectGoal: (state, action) => {
      state.goals.projects = state.goals.projects.filter(p => p.id !== action.payload);
      state.lastUpdated = Date.now();
    },
    updateNotifications: (state, action) => {
      state.goals.notifications = { ...state.goals.notifications, ...action.payload };
      state.lastUpdated = Date.now();
    },
    addAchievement: (state, action) => {
      state.achievements.push({
        ...action.payload,
        timestamp: Date.now(),
        id: `achievement-${Date.now()}`
      });
    },
    setRecommendations: (state, action) => {
      state.recommendations = action.payload;
    },
    clearAchievements: (state) => {
      state.achievements = [];
    }
  }
});

export const {
  setGoals,
  updateDailyGoal,
  updateWeeklyGoal,
  addProjectGoal,
  updateProjectGoal,
  removeProjectGoal,
  updateNotifications,
  addAchievement,
  setRecommendations,
  clearAchievements
} = goalSlice.actions;

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
  user: userReducer,
  goals: goalSlice.reducer
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