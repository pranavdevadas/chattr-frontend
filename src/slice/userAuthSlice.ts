import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  userInfo: any | null;
  chat?: any | null;
}

const initialState: UserState = {
  userInfo: null,
};

const userAuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<any>) => {
      state.userInfo = action.payload;
      AsyncStorage.setItem('userInfo', JSON.stringify(action.payload)).catch(
        err => console.log('Failed to save userInfo:', err),
      );
    },
    clearCredentials: state => {
      state.userInfo = null;
      state.chat = null;
      AsyncStorage.removeItem('userInfo').catch(err =>
        console.log('Failed to remove userInfo:', err),
      );
    },
    loadCredentials: (state, action: PayloadAction<any>) => {
      state.userInfo = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, loadCredentials } =
  userAuthSlice.actions;
export default userAuthSlice.reducer;
