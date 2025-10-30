import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Chat {
  _id: string;
  participants: any[];
  latestMessage: any;
}

interface ChatState {
  chats: Chat[];
}

const initialState: ChatState = {
  chats: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats(state, action: PayloadAction<Chat[]>) {
      state.chats = action.payload;
    },
    updateChat(
      state,
      action: PayloadAction<{
        chatId: string;
        latestMessage?: any;
        readBy?: string;
        participants?: any[];
      }>,
    ) {
      const index = state.chats.findIndex(c => c._id === action.payload.chatId);
      if (index !== -1) {
        if (
          action.payload.latestMessage &&
          (!state.chats[index].latestMessage ||
            new Date(action.payload.latestMessage.createdAt) >
              new Date(state.chats[index].latestMessage.createdAt))
        ) {
          state.chats[index].latestMessage = action.payload.latestMessage;
        }

        if (action.payload.readBy && state.chats[index].latestMessage) {
          const readBy = state.chats[index].latestMessage.readBy || [];
          if (!readBy.includes(action.payload.readBy)) {
            state.chats[index].latestMessage.readBy = [
              ...readBy,
              action.payload.readBy,
            ];
          }
        }
      } else if (action.payload.latestMessage) {
        state.chats.unshift({
          _id: action.payload.chatId,
          participants: action.payload.participants || [],
          latestMessage: action.payload.latestMessage,
        });
      }
    },
    addChat(state, action: PayloadAction<Chat>) {
      state.chats.unshift(action.payload);
    },
  },
});

export const { setChats, updateChat, addChat } = chatSlice.actions;
export default chatSlice.reducer;
