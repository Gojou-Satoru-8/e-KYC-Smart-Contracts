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

const initialDocumentsState = {
  documents: [],
  tags: [],
  selectedTags: JSON.parse(window.localStorage.getItem("selectedTags")) || [],
};

const extractTags = (documents = []) => {
  const statuses = documents.map((doc) => doc.status);
  const uniqueStatuses = new Set(statuses);
  return [...uniqueStatuses];
};
const documentsSlice = createSlice({
  name: "documents",
  initialState: initialDocumentsState,
  reducers: {
    setDocuments: (state, action) => {
      state.documents = action.payload.documents;
      state.tags = extractTags(state.documents);
    },
    addDocument: (state, action) => {
      state.documents.push(action.payload.document);
      state.tags = extractTags(state.documents);
    },

    updateDocument: (state, action) => {
      const indexOfDocToUpdate = state.documents.findIndex(
        (doc) => doc._id === action.payload.document._id
      );
      if (indexOfDocToUpdate !== -1) {
        state.documents[indexOfDocToUpdate] = action.payload.document;
        state.tags = extractTags(state.documents);
      }
    },
    deleteDocument: (state, action) => {
      state.documents = state.documents.filter((doc) => doc._id !== action.payload);
      state.tags = extractTags(state.documents);
    },
    clearAll: (state, action) => {
      state.documents = [];
      state.tags = [];
      state.selectedTags = [];
      window.localStorage.removeItem("selectedTags");
    },

    addSelectedTags: (state, action) => {
      const tagToAdd = action.payload;
      // const selectedTagsSet = new Set(state.selectedTags);
      // selectedTagsSet.add(action.payload);
      // state.selectedTags = [...selectedTagsSet];
      if (state.selectedTags?.includes(tagToAdd)) return;
      state.selectedTags.push(tagToAdd);
      // console.log(state.selectedTags.join(","));
      window.localStorage.setItem("selectedTags", JSON.stringify(state.selectedTags));
    },
    removeSelectedTags: (state, action) => {
      const tagToRemove = action.payload;
      state.selectedTags = state.selectedTags.filter((tag) => tag !== tagToRemove);
      window.localStorage.setItem("selectedTags", JSON.stringify(state.selectedTags));
    },
    clearSelectedTags: (state, action) => {
      state.selectedTags = [];
      window.localStorage.removeItem("selectedTags");
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
