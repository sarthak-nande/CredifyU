import { configureStore } from '@reduxjs/toolkit';
import userReducer from "./userSlice"
import studentReducer from "./studentSlice";
import collegeReducer from "./collegeSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    student: studentReducer,
    college: collegeReducer
  }
});

export default store;
