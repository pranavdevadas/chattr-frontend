import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './slice/apiSlice'
import userAuthReducer from './slice/userAuthSlice';
import chatReducer from './slice/chatSlice'


const store = configureStore({
  reducer: {
    auth: userAuthReducer,
    chat: chatReducer,
    [apiSlice.reducerPath] : apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true
})

export default store