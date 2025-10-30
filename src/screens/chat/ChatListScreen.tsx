import { View, FlatList, Pressable, Text } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import ChatListComponent from '../../components/ChatListComponent';
import Entypo from 'react-native-vector-icons/Entypo';
import NewChatComponent from '../../components/NewChatComponent';
import HeaderComponent from '../../components/HeaderComponent';
import { useGetUserChatsQuery } from '../../slice/userApiSlice';
import Loader from '../../components/Loader';
import {
  offChatUpdated,
  offChatUpdateGlobal,
  offMessagesRead,
  onChatUpdated,
  onChatUpdateGlobal,
  onMessagesRead,
} from '../../utils/socket';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setChats, updateChat } from '../../slice/chatSlice';

const ChatListScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();
  const chats = useSelector((state: any) => state.chat.chats);
  const { data: chatData = [], isLoading, refetch } = useGetUserChatsQuery();

  // handling chat data updates - Redux
  useEffect(() => {
    if (chatData.length > 0) {
      dispatch(setChats(chatData));
    }
  }, [chatData, dispatch]);
  useEffect(() => {
    const handleChatUpdated = (data: {
      chatId: string;
      latestMessage: any;
      participants?: any[];
    }) => {
      console.log('Chat update received in ChatListScreen:', data);
      dispatch(
        updateChat({
          chatId: data.chatId,
          latestMessage: data.latestMessage,
          participants: data.participants,
        }),
      );
      refetch();
    };
    onChatUpdated(handleChatUpdated);
    onChatUpdateGlobal(handleChatUpdated);

    return () => {
      offChatUpdated(handleChatUpdated);
      offChatUpdateGlobal(handleChatUpdated);
    };
  }, [dispatch, refetch]);

  // Search filter
  const filteredChats = chats.filter((chat: any) =>
    chat?.participants?.some((p: any) =>
      p?.userName?.toLowerCase().includes(searchText.toLowerCase()),
    ),
  );

  // Handling messages read
  useEffect(() => {
    const handleMessagesRead = (data: { chatId: string; readerId: string }) => {
      dispatch(updateChat({ chatId: data.chatId, readBy: data.readerId }));
    };
    onMessagesRead(handleMessagesRead);
    return () => offMessagesRead(handleMessagesRead);
  }, [dispatch]);

  // Refetch chats
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <View className="flex-1 bg-primaryDark">
      <HeaderComponent searchText={searchText} setSearchText={setSearchText} />
      <View className="flex-1 px-4 mt-4">
        <FlatList
          data={filteredChats}
          renderItem={({ item }) => <ChatListComponent chat={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? (
              <View className="justify-center items-center font-soraBold">
                <Text className=" font-soraBold">No chats found</Text>
                <Text className="font-soraBold font-primarylight">
                  Enter username and start Chatter!
                </Text>
              </View>
            ) : null
          }
        />

        <Pressable
          className="absolute bottom-6 right-6 bg-primarydark p-5 mb-6 rounded-full shadow-lg"
          onPress={() => setShowModal(true)}
        >
          <Entypo name="new-message" color="#fff" size={28} />
        </Pressable>

        <NewChatComponent
          visible={showModal}
          onClose={() => setShowModal(false)}
        />
        <Loader visible={isLoading} />
      </View>
    </View>
  );
};

export default ChatListScreen;
