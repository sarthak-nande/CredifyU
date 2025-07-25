import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,       
  isLoggedIn: false, 
  loading: false,   
  error: null        
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
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser
} = userSlice.actions;

export default userSlice.reducer;
