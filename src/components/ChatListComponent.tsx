import { View, Text, Image, TouchableOpacity, ViewStyle } from 'react-native';
import React from 'react';
import Images from '../utils/images';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Participant = {
  _id: string;
  name: string;
  userName?: string;
  email?: string;
  profileImage?: string;
};

type chatListNavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  'Chat'
>;

const ChatListComponent = ({ chat }: any) => {
  const navigation = useNavigation<chatListNavigationProps>();
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const receiver = chat.participants.find(
    (participant: Participant) => participant._id !== userInfo._id,
  );

  const formattedTime = chat.latestMessage?.createdAt
    ? moment(chat.latestMessage.createdAt).format('h:mm A')
    : '';

  const isUnread =
    chat.latestMessage &&
    !chat.latestMessage.readBy?.includes(userInfo._id) &&
    chat.latestMessage.sender !== userInfo._id;

  let previewText = 'Sent your first hi...';
  let previewIcon: React.ReactNode = null;

  if (chat.latestMessage) {
    const { type, content } = chat.latestMessage;

    switch (type) {
      case 'text':
        previewText = content;
        break;
      case 'image':
        previewIcon = (
          <Ionicons
            name="image-outline"
            size={16}
            color="#555"
            style={{ marginRight: 4 } as ViewStyle}
          />
        );
        previewText = 'Photo';
        break;
      case 'video':
        previewIcon = (
          <Ionicons
            name="videocam-outline"
            size={16}
            color="#555"
            style={{ marginRight: 4 } as ViewStyle}
          />
        );
        previewText = 'Video';
        break;
      default:
        previewText = '[Unsupported message]';
        break;
    }
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => navigation.navigate('Chat', { chat })}
        activeOpacity={0.8}
      >
        <View className="flex-row items-start mb-4 mr-4 pt-4">
          <Image
            source={
              receiver.profileImage
                ? {
                    uri: `https://ocrsystem.site/public/${receiver.profileImage}`,
                  }
                : Images.defaultDp
            }
            style={{ width: 60, height: 60, borderRadius: 30 } as any}
          />

          <View className="flex-1 ml-4">
            <View className="flex-row justify-between items-start mb-1 mt-2">
              <Text className="font-soraBold flex-1">{receiver.name}</Text>
              {isUnread && (
                <View className="bg-primarydark w-26 h-7 px-1 rounded-xl items-center justify-center">
                  <Text className="text-white items-center text-sm font-soraBold">
                    unread
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row justify-between items-end">
              <View className="flex-row items-center flex-1">
                {previewIcon}
                <Text
                  className="font-sora text-gray-500 flex-shrink"
                  numberOfLines={1}
                >
                  {previewText}
                </Text>
              </View>
              <Text className="text-gray-400 text-sm">{formattedTime}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <View className="h-px bg-gray-200 mr-4" />
    </>
  );
};

export default ChatListComponent;
