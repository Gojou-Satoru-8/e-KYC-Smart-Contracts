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
    updateEntity: (state, action) => {
      state.entity = { ...state.entity, ...action.payload.entity };
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

const initialDocumentsState = { documents: [] };
const documentsSlice = createSlice({
  name: "documents",
  initialState: initialDocumentsState,
  reducers: {
    setDocuments: (state, action) => {
      state.documents = action.payload.documents;
    },
    clearDocuments: (state, action) => {
      state.documents = [];
    },
    addDocument: (state, action) => {
      state.documents.push(action.payload.document);
    },
  },
});

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    documents: documentsSlice.reducer,
  },
});

export const authActions = authSlice.actions;
export const documentsActions = documentsSlice.actions;
export default store;
