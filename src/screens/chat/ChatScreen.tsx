import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Platform,
  Keyboard,
  Animated,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  ViewStyle,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Images from '../../utils/images';
import { useState, useRef, useEffect, useCallback } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MessageBubbleComponent, {
  Message,
} from '../../components/MessageBubbleComponent';
import { useDispatch, useSelector } from 'react-redux';
import {
  joinChat,
  sendMessage,
  onReceiveMessage,
  offReceiveMessage,
  leaveChat,
  emitMarkAsRead,
  onMessagesRead,
  offMessagesRead,
  onUserStatusUpdate,
  offUserStatusUpdate,
  emitTyping,
  emitStopTyping,
  onUserTyping,
  offUserTyping,
  onUserStopTyping,
  offUserStopTyping,
  socket,
  sendMediaMessage,
} from '../../utils/socket';
import {
  useGetMessagesQuery,
  useSendMediaMessageMutation,
  useSendNotificationMutation,
} from '../../slice/userApiSlice';
import { useFocusEffect } from '@react-navigation/native';
import { updateChat } from '../../slice/chatSlice';
import moment from 'moment';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Video from 'react-native-video';
import { BlurView } from '@react-native-community/blur';
import { showToast } from 'react-native-dan-forden';

type Participant = {
  _id: string;
  name: string;
  userName: string;
  email?: string;
  profileImage?: string;
};

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { chat } = route.params as { chat: any };
  const messageAnimations = useRef(new Map()).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const receiver = chat.participants.find(
    (participant: Participant) => participant._id !== userInfo._id,
  );
  const [receiverStatus, setReceiverStatus] = useState<'online' | 'offline'>(
    'offline',
  );
  const [selectedMediaType, setSelectedMediaType] = useState<
    'image' | 'video' | null
  >(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showLoader, setShowLoader] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isReceiverTyping, setIsReceiverTyping] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  // Mutations & Queries
  const {
    data: fetchedMessages,
    refetch,
    isLoading,
  } = useGetMessagesQuery(chat._id);
  const [sendMedia, { isLoading: sendMediaLoading, isError }] =
    useSendMediaMessageMutation();
  const [sendNotification] = useSendNotificationMutation();

  // Show loader
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Animate message
  const animateMessageIn = useCallback(
    (messageId: string) => {
      const animation =
        messageAnimations.get(messageId) || new Animated.Value(1);
      messageAnimations.set(messageId, animation);
      const msg = messages.find(m => m.id === messageId);
      if (msg?.animated) {
        animation.setValue(0);
        Animated.spring(animation, {
          toValue: 1,
          tension: 30,
          friction: 7,
          useNativeDriver: true,
        }).start();
      }
    },
    [messages, messageAnimations],
  );

  // Date label
  const getDateLabel = (date: string) => {
    const messageDate = moment(date);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');
    if (messageDate.isSame(today, 'd')) return 'Today';
    if (messageDate.isSame(yesterday, 'd')) return 'Yesterday';
    return messageDate.format('DD/MM/YYYY');
  };

  // Handle image/Vide selection
  const handleSelectMedia = async (source: 'camera' | 'gallery') => {
    try {
      setShowLoader(true);

      const result =
        source === 'camera'
          ? await launchCamera({
              mediaType: 'mixed',
              quality: 0.8,
              includeExtra: true,
            })
          : await launchImageLibrary({
              mediaType: 'mixed',
              selectionLimit: 1,
              quality: 0.8,
              includeExtra: true,
            });

      if (result.didCancel) {
        setShowLoader(false);
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        setShowLoader(false);
        showToast({
          type: 'danger',
          message: 'Failed to select media. Please try again.',
        });
        return;
      }

      let mediaType: 'image' | 'video' | null = null;
      if (asset.type?.startsWith('image/')) mediaType = 'image';
      else if (asset.type?.startsWith('video/')) mediaType = 'video';

      if (!mediaType) {
        setShowLoader(false);
        showToast({
          type: 'danger',
          message: 'Unsupported file type. Please select an image or video.',
        });
        return;
      }

      const fileSize = asset.fileSize || 0;
      const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
      const MAX_VIDEO_SIZE = 30 * 1024 * 1024;

      if (mediaType === 'image' && fileSize > MAX_IMAGE_SIZE) {
        setShowLoader(false);
        showToast({
          type: 'danger',
          message: 'Image too large. Maximum size is 5MB.',
        });
        return;
      }

      if (mediaType === 'video' && fileSize > MAX_VIDEO_SIZE) {
        setShowLoader(false);
        showToast({
          type: 'danger',
          message: 'Video too large. Maximum size is 30MB.',
        });
        return;
      }

      if (isError) {
        console.error('❌ Error selecting media', isError);
        showToast({
          type: 'danger',
          message: 'Upload failed. Please try again',
        });
      }

      setSelectedMedia(asset);
      setSelectedMediaType(mediaType);
      setPreviewVisible(true);
    } catch (error: any) {
      console.log('❌ Error selecting media:', error);
      showToast({
        type: 'danger',
        message: 'Failed to select media. Please try again',
      });
    } finally {
      setShowLoader(false);
    }
  };

  // Handle confirm send media
  const handleConfirmSendMedia = async () => {
    if (!selectedMedia || !selectedMediaType) return;

    try {
      setShowLoader(true);
      setPreviewVisible(false);

      const formData = new FormData();
      formData.append('file', {
        uri: selectedMedia.uri,
        type: selectedMedia.type,
        name:
          selectedMedia.fileName ||
          `upload.${selectedMedia.type?.split('/')[1]}`,
      });
      formData.append('chatId', chat._id);
      formData.append('senderId', userInfo._id);
      formData.append('mediaType', selectedMediaType);

      const res = await sendMedia(formData).unwrap();
      sendMediaMessage(chat._id, userInfo._id, res.content, selectedMediaType);

      const tempId = `temp-${Date.now()}`;
      const newMessage: Message = {
        id: tempId,
        text: res.content,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isSent: true,
        animated: true,
        status: 'sent',
      };

      setMessages(prev => [...prev, newMessage]);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        animateMessageIn(tempId);
      }, 100);
    } catch (error: any) {
      console.error('❌ Error sending media message:', error);

      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Failed to send media message. Please try again.';

      showToast({
        type: 'danger',
        message: errorMessage,
      });

      setPreviewVisible(true);
    } finally {
      setShowLoader(false);
      setSelectedMedia(null);
      setSelectedMediaType(null);
    }
  };

  // Handle receiving new messages
  const handleReceiveMessage = useCallback(
    (newMessage: any) => {
      if (newMessage.sender === userInfo._id) return;

      const receivedMessage: Message = {
        id: newMessage._id,
        text: newMessage.content,
        time: new Date(newMessage.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isSent: false,
        animated: true,
      };

      let latestMessage = { ...newMessage };

      if (latestMessage.type === 'image') {
        latestMessage = { ...latestMessage, content: 'Photo' };
      } else if (latestMessage.type === 'video') {
        latestMessage = { ...latestMessage, content: 'Video' };
      } else if (
        latestMessage.type === 'text' &&
        latestMessage.content?.trim() === ''
      ) {
        latestMessage = { ...latestMessage, content: 'Sent a message' };
      }

      setMessages(prev => [...prev, receivedMessage]);
      dispatch(updateChat({ chatId: chat._id, latestMessage }));
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        animateMessageIn(receivedMessage.id);
      }, 100);
    },
    [animateMessageIn, chat._id, dispatch, userInfo._id],
  );

  // Socket event listeners
  useEffect(() => {
    joinChat(chat._id);
    onReceiveMessage(handleReceiveMessage);
    return () => {
      offReceiveMessage(handleReceiveMessage);
      emitMarkAsRead(chat._id, userInfo._id);
      leaveChat(chat._id);
    };
  }, [chat._id, handleReceiveMessage, userInfo._id]);

  useEffect(() => {
    emitMarkAsRead(chat._id, userInfo._id);
  }, [chat._id, userInfo._id]);

  useEffect(() => {
    const handleMessagesRead = (data: { chatId: string; readerId: string }) => {
      dispatch(updateChat({ chatId: data.chatId, readBy: data.readerId }));
    };
    onMessagesRead(handleMessagesRead);
    return () => offMessagesRead(handleMessagesRead);
  }, [dispatch]);

  // Load initial messages
  useEffect(() => {
    console.log('Fetched messages:', fetchedMessages?.length);
    if (fetchedMessages && fetchedMessages.length > 0) {
      const initialMessages: Message[] = fetchedMessages.map((msg: any) => ({
        id: msg._id,
        text: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isSent: msg.sender._id === userInfo._id,
        animated: false,
      }));

      setMessages(initialMessages);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });

        const messagesToAnimate = initialMessages.slice(-10);
        messagesToAnimate.forEach((msg, index) => {
          setTimeout(() => animateMessageIn(msg.id), index * 50);
        });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedMessages, userInfo._id]);

  // Keyboard avoidance
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      e => {
        console.log(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Animation for messages
  const getMessageAnimation = useCallback(
    (messageId: string) => {
      if (!messageAnimations.has(messageId)) {
        messageAnimations.set(messageId, new Animated.Value(1));
      }
      return messageAnimations.get(messageId);
    },
    [messageAnimations],
  );

  // Handle sending messages
  const handleSend = async () => {
    if (message.trim()) {
      const tempMessageId = `temp-${Date.now()}`;

      const newMessage: Message = {
        id: tempMessageId,
        text: message.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isSent: true,
        animated: true,
        sendMediaLoading,
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      sendMessage(chat._id, userInfo._id, message.trim(), tempMessageId);
      try {
        await sendNotification({
          receiverId: receiver._id,
          title: userInfo.name,
          body: message.trim(),
        }).unwrap();
      } catch (err) {
        console.error('Notification error:', err);
      }
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        animateMessageIn(tempMessageId);
      }, 100);
    }
  };

  // Handle typing indicator
  const handleTypingEmit = (text: string) => {
    let typingTimeout: ReturnType<typeof setTimeout> | null = null;

    if (!socket || !chat?._id || !userInfo?._id) return;

    if (text.trim().length > 0) {
      emitTyping(chat._id, userInfo._id);

      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        emitStopTyping(chat._id, userInfo._id);
      }, 1500);
    } else {
      emitStopTyping(chat._id, userInfo._id);
    }
  };

  // Refetch messages on focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Mark messages as read
  useEffect(() => {
    if (chat?._id && userInfo?._id) {
      emitMarkAsRead(chat._id, userInfo._id);
    }
  }, [chat._id, userInfo._id]);

  // Handle receiver status updates
  useEffect(() => {
    if (!receiver?._id) return;
    const handleStatusUpdate = (data: {
      userId: string;
      status: 'online' | 'offline';
    }) => {
      if (data.userId === receiver._id) {
        setReceiverStatus(data.status);
      }
    };

    onUserStatusUpdate(handleStatusUpdate);
    return () => {
      offUserStatusUpdate(handleStatusUpdate);
    };
  }, [receiver?._id]);

  // Handle receiver typing indicators
  useEffect(() => {
    if (!receiver?._id) return;
    const handleTyping = (data: { chatId: string; userId: string }) => {
      if (data.userId === receiver._id && data.chatId === chat._id) {
        setIsReceiverTyping(true);
      }
    };
    const handleStopTyping = (data: { chatId: string; userId: string }) => {
      if (data.userId === receiver._id && data.chatId === chat._id) {
        setIsReceiverTyping(false);
      }
    };
    onUserTyping(handleTyping);
    onUserStopTyping(handleStopTyping);
    return () => {
      offUserTyping(handleTyping);
      offUserStopTyping(handleStopTyping);
    };
  }, [receiver?._id, chat._id]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={{ flex: 1 } as ViewStyle}
      keyboardVerticalOffset={isKeyboardVisible ? 0 : 60}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-primarydark w-full h-20 items-center justify-start flex-row px-4 z-10">
          <Ionicons
            name="chevron-back"
            onPress={() => navigation.goBack()}
            color="#fff"
            size={30}
          />
          <Image
            source={
              receiver.profileImage
                ? {
                    uri: `https://ocrsystem.site/public/${receiver.profileImage}`,
                  }
                : Images.defaultDp
            }
            className="w-12 h-12 rounded-full ml-3"
          />
          <View className="flex-col ml-3">
            <Text className="font-soraBold text-white text-lg">
              {receiver.name}
            </Text>
            <Text className="font-sora text-gray-300 text-sm">
              {isReceiverTyping ? 'Typing...' : receiver.userName} •{' '}
              {receiverStatus}
            </Text>
          </View>
        </View>

        {/* Messages Container */}
        <View style={{ flex: 1 } as ViewStyle} className="bg-gray-100">
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#5A0FC8" />
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500 text-lg mt-2">
                No messages yet
              </Text>
              <Text className="text-gray-400 mt-2">Start a conversation!</Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1 } as ViewStyle}
              contentContainerStyle={
                {
                  paddingVertical: 10,
                } as ViewStyle
              }
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }}
              onLayout={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: false });
                }, 50);
              }}
            >
              <View className="px-3">
                {messages.map((msg, index) => {
                  const currentDateLabel = getDateLabel(
                    fetchedMessages?.[index]?.createdAt || new Date(),
                  );
                  const prevMsg = messages[index - 1];
                  const prevDateLabel = prevMsg
                    ? getDateLabel(
                        fetchedMessages?.[index - 1]?.createdAt || new Date(),
                      )
                    : null;

                  const showDateLabel = currentDateLabel !== prevDateLabel;

                  return (
                    <View key={msg.id}>
                      {showDateLabel && (
                        <View className="items-center justify-center my-3">
                          <View className="bg-gray-200 px-4 py-2 rounded-md">
                            <Text className="text-sm text-gray-600 font-semibold">
                              {currentDateLabel}
                            </Text>
                          </View>
                        </View>
                      )}
                      <MessageBubbleComponent
                        msg={msg}
                        animation={getMessageAnimation(msg.id)}
                      />
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Input Container */}
        <View className="flex-row items-center p-3 bg-white border-t border-gray-200">
          <TouchableOpacity
            className="p-2 mr-1"
            onPress={() => handleSelectMedia('camera')}
          >
            <Ionicons name="camera-outline" size={28} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 mr-1"
            onPress={() => handleSelectMedia('gallery')}
          >
            <Ionicons name="image-outline" size={28} color="#6B7280" />
          </TouchableOpacity>

          <TextInput
            value={message}
            onChangeText={text => {
              setMessage(text);
              handleTypingEmit(text);
            }}
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 mx-2 max-h-20"
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="center"
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />

          <TouchableOpacity
            onPress={handleSend}
            className={`rounded-full p-3 ${message.trim() ? 'bg-primarydark' : 'bg-gray-300'}`}
            disabled={!message.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={message.trim() ? '#fff' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>

        <Modal
          transparent
          animationType="fade"
          visible={previewVisible}
          onRequestClose={() => setPreviewVisible(false)}
        >
          <View className="flex-1 justify-center items-center px-3">
            <BlurView
              style={
                {
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                } as ViewStyle
              }
              blurType="light"
              blurAmount={10}
            />

            {/* Clean Modal Card */}
            <View className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-lg">
              <Text className="text-center text-lg font-semibold mb-4">
                Preview
              </Text>

              {/* Media */}
              <View className="rounded-lg mb-2 overflow-hidden">
                {selectedMediaType === 'image' ? (
                  <Image
                    source={{ uri: selectedMedia?.uri }}
                    style={
                      { width: '100%', height: 250, marginBottom: 10 } as any
                    }
                    resizeMode="cover"
                  />
                ) : (
                  <Video
                    source={{ uri: selectedMedia?.uri }}
                    style={{ width: '100%', height: 240 } as ViewStyle}
                    resizeMode="cover"
                  />
                )}
              </View>

              {/* Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setPreviewVisible(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-xl"
                >
                  <Text className="text-center text-gray-600 font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmSendMedia}
                  className="flex-1 bg-primarydark ml-4 py-3 rounded-xl"
                >
                  <Text className="text-center text-white font-medium">
                    Send
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}
