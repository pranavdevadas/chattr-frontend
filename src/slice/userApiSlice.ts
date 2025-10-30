import { apiSlice } from './apiSlice';

const USER_URL = '/api/user';
const MESSAGE_URL = '/api/chat';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    register: builder.mutation({
      query: data => ({
        url: `${USER_URL}/register`,
        method: 'POST',
        body: data,
      }),
    }),
    verifyOtp: builder.mutation({
      query: data => ({
        url: `${USER_URL}/verify-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    resendOtp: builder.mutation({
      query: data => ({
        url: `${USER_URL}/resend-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    login: builder.mutation({
      query: data => ({
        url: `${USER_URL}/login`,
        method: 'POST',
        body: data,
      }),
    }),
    updateProfile: builder.mutation({
      query: data => ({
        url: `${USER_URL}/update-user`,
        method: 'PATCH',
        body: data,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: `${USER_URL}/logout`,
        method: 'POST',
      }),
    }),
    searchUser: builder.mutation({
      query: query => ({
        url: `${USER_URL}/search`,
        method: 'POST',
        body: query,
      }),
    }),
    createChat: builder.mutation({
      query: query => ({
        url: `${MESSAGE_URL}/create-chat`,
        method: 'POST',
        body: query,
      }),
    }),
    sendMessage: builder.mutation({
      query: query => ({
        url: `${MESSAGE_URL}/message`,
        method: 'POST',
        body: query,
      }),
    }),
    getMessages: builder.query({
      query: (chatId: string) => ({
        url: `${MESSAGE_URL}/message/${chatId}`,
        method: 'GET',
      }),
    }),
    getUserChats: builder.query<void, void>({
      query: () => ({
        url: `${MESSAGE_URL}/all-chat`,
        method: 'GET',
      }),
    }),
    sendMediaMessage: builder.mutation({
      query: query => ({
        url: `${MESSAGE_URL}/media-message`,
        method: 'POST',
        body: query,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useSearchUserMutation,
  useCreateChatMutation,
  useSendMessageMutation,
  useGetMessagesQuery,
  useGetUserChatsQuery,
  useSendMediaMessageMutation
} = userApiSlice;
