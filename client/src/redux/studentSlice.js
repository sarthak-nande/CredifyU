import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  students: null,
  loading: false,
  error: null,   
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    addStudentStart(state) {
      state.loading = true;
      state.error = null;
    },
    addStudentSuccess(state, action) {
      state.students = action.payload;
      state.loading = false;
    }
  }
});

export const {
    addStudentStart,
    addStudentSuccess
} = studentSlice.actions;

export default studentSlice.reducer;
