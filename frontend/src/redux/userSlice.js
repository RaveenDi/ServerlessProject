import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null
  },
  reducers: {
    setUser: (state , action) => {
      state.user = action.payload;
    },
    resetUser: (state , action)=> {
      state.user = null;
    }
  },
});

export const { setUser , resetUser, reloadUserData } = userSlice.actions;