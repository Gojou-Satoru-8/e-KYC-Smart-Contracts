import { createSlice, configureStore } from "@reduxjs/toolkit";

const initialAuthState = {
  isAuthenticated: false,
  entity: null,
  entityType: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    setEntity: (state, action) => {
      state.isAuthenticated = true;
      state.entity = action.payload.entity;
      state.entityType = action.payload.entityType;
    },
    unsetEntity: (state, action) => {
      state.isAuthenticated = false;
      state.entity = null;
      state.entityType = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

export const authActions = authSlice.actions;
export default store;
