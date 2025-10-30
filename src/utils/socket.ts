import { io, Socket } from 'socket.io-client';

export let socket: Socket | null = null;
const BASE_URL = 'http://192.168.220.3:5000';


// Connect the socket
export const connectSocket = (token?: string) => {
  if (!socket || !socket.connected) {
    socket = io(BASE_URL, {
      withCredentials: true,
      transports: ['websocket'],
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('🟢 User connected to socket:', socket?.id);
    });

    socket.on('disconnect', reason => {
      console.log('❌ User socket disconnected:', reason);
    });

    socket.on('connect_error', error => {
      console.log('🔴 Socket connection error:', error);
    });
  }
  return socket;
};


// Disconnect socket
export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
  console.log('🛑 Socket disconnected manually');
};


// Join chat
export const joinChat = (chatId: string) => {
  if (!socket) {
    console.warn('Socket not connected!');
    return false;
  }
  socket.emit('join_chat', chatId);
  console.log(`🟡 Joined chat: ${chatId}`);
  return true;
};


// Leave chat
export const leaveChat = (chatId: string) => {
  if (!socket) return console.warn('Socket not connected!');
  socket.emit('leave_chat', chatId);
  console.log(`🟡 Left chat: ${chatId}`);
};


// Send message
export const sendMessage = (
  chatId: string,
  senderId: string,
  content: string,
  tempId?: string,
) => {
  if (!socket) {
    console.warn('Socket not connected!');
    return false;
  }
  socket.emit('send_message', {
    chatId,
    senderId,
    content,
    tempId,
    timestamp: new Date().toISOString(),
  });
  console.log(`📤 Sent message to ${chatId}`);
  return true;
};


// Send media message
export const sendMediaMessage = (
  chatId: string,
  senderId: string,
  mediaUrl: string,
  mediaType: 'image' | 'video',
) => {
  if (!socket) return console.warn('Socket not connected!');
  socket.emit('send_media_message', {
    chatId,
    senderId,
    mediaUrl,
    mediaType,
  });
  console.log(`📸 Sent ${mediaType} to ${chatId}`);
};


// Receive message
export const onReceiveMessage = (callback: (message: any) => void) => {
  if (!socket) return;
  socket.on('receive_message', callback);
};
export const offReceiveMessage = (callback: (message: any) => void) => {
  if (!socket) return;
  socket.off('receive_message', callback);
};


// Mark messages as read
export const emitMarkAsRead = (chatId: string, userId: string) => {
  if (!socket) return;
  socket.emit('mark_as_read', { chatId, userId });
};
export const onMessagesRead = (
  callback: (data: { chatId: string; readerId: string }) => void,
) => {
  if (!socket) return;
  socket.on('messages_read', callback);
};
export const offMessagesRead = (
  callback: (data: { chatId: string; readerId: string }) => void,
) => {
  if (!socket) return;
  socket.off('messages_read', callback);
};


// Chat update
export const onChatUpdateGlobal = (
  callback: (data: { chatId: string; latestMessage: any }) => void,
) => {
  if (!socket) return;
  socket.on('chat_updated_global', callback);
};
export const offChatUpdateGlobal = (
  callback: (data: { chatId: string; latestMessage: any }) => void,
) => {
  if (!socket) return;
  socket.off('chat_updated_global', callback);
};
export const onChatUpdated = (
  callback: (data: { chatId: string; latestMessage: any }) => void,
) => {
  if (!socket) return;
  socket.on('chat_updated', data => {
    callback(data);
  });
};
export const offChatUpdated = (
  callback: (data: { chatId: string; latestMessage: any }) => void,
) => {
  if (!socket) return;
  socket.off('chat_updated', callback);
};


// User online status
export const setUserOnline = (userId: string) => {
  if (!socket) return;
  socket.emit("user_online", userId);
};
export const onUserStatusUpdate = (callback: (data: { userId: string; status: "online" | "offline" }) => void) => {
  if (!socket) return;
  socket.on("user_status_update", callback);
};
export const offUserStatusUpdate = (callback: (data: { userId: string; status: "online" | "offline" }) => void) => {
  if (!socket) return;
  socket.off("user_status_update", callback);
};


// Typing indicators
export const emitTyping = (chatId: string, userId: string) => {
  if (!socket) return;
  socket.emit("typing", { chatId, userId });
};
export const emitStopTyping = (chatId: string, userId: string) => {
  if (!socket) return;
  socket.emit("stop_typing", { chatId, userId });
};
export const onUserTyping = (
  callback: (data: { chatId: string; userId: string }) => void
) => {
  if (!socket) return;
  socket.on("user_typing", callback);
};
export const offUserTyping = (
  callback: (data: { chatId: string; userId: string }) => void
) => {
  if (!socket) return;
  socket.off("user_typing", callback);
};
export const onUserStopTyping = (
  callback: (data: { chatId: string; userId: string }) => void
) => {
  if (!socket) return;
  socket.on("user_stop_typing", callback);
};
export const offUserStopTyping = (
  callback: (data: { chatId: string; userId: string }) => void
) => {
  if (!socket) return;
  socket.off("user_stop_typing", callback);
};