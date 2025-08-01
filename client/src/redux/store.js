import { configureStore } from '@reduxjs/toolkit';
import userReducer from "./userSlice"
import studentReducer from "./studentSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    student: studentReducer
  }
});

export default store;
