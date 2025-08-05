import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  collegeId: null,
  loading: false,
  error: null,
}

const collegeSlice = createSlice({
  name: "college",
  initialState,
  reducers: {
    setCollegeId(state, action) {
      state.collegeId = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setCollegeId, setLoading, setError } = collegeSlice.actions;

export default collegeSlice.reducer;
