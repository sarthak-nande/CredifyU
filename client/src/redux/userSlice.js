import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
  isProfileComplete: false,
  isAuthChecked: false // ✅ NEW: to track if auth check has completed
};


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.loading = false;
      state.isAuthChecked = true; // ✅
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthChecked = true; // ✅
    },
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
      state.isProfileComplete = false;
      state.loading = false;
      state.error = null;
      state.isAuthChecked = false; // ✅
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    setProfileComplete(state, action) {
      state.isProfileComplete = action.payload;
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  setProfileComplete
} = userSlice.actions;

export default userSlice.reducer;
