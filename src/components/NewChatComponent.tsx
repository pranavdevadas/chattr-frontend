import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import InputTextComponent from './InputTextComponent';
import ButtonComponent from './ButtonComponent';
import {
  useSearchUserMutation,
  useCreateChatMutation,
} from '../slice/userApiSlice';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

type NewChatModalProps = {
  visible: boolean;
  onClose: () => void;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const NewChatComponent: React.FC<NewChatModalProps> = ({
  visible,
  onClose,
}) => {
  const navigation = useNavigation<any>();
  const [username, setUsername] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [searchUser, { data: users, isLoading }] = useSearchUserMutation();
  const [createChat, { isLoading: newChatLoading }] = useCreateChatMutation();
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const filteredUsers =
    users?.filter((user: any) => user._id !== userInfo._id) || [];

  // Debounce username
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedUsername(username);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [username]);
  useEffect(() => {
    if (debouncedUsername.trim().length > 0) {
      searchUser({ query: debouncedUsername });
    }
  }, [debouncedUsername, searchUser]);

  // Handle selecting a user to start a new chat
  const handleSelectUser = async (receiverId: string) => {
    try {
      const result = await createChat({ receiverId }).unwrap();
      navigation.navigate('Chat', { chat: result });
      setUsername('');
      setDebouncedUsername('');
      onClose();
    } catch (err: any) {
      console.error(err);
    }
  };

  const shouldShowResults =
    username.trim().length > 0 && filteredUsers && filteredUsers.length > 0;
  const shouldShowEmptyState =
    username.trim().length > 0 && !isLoading && filteredUsers?.length === 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center">
        <BlurView
          style={
            {
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            } as ViewStyle
          }
          blurType="light"
          blurAmount={5}
          reducedTransparencyFallbackColor="white"
        />

        <View className="bg-white w-[85%] rounded-2xl p-6 shadow-lg">
          <Text className="text-2xl font-soraBold text-center mb-4 text-black">
            Add New Chat
          </Text>

          <InputTextComponent
            label="Enter username"
            value={username}
            onchangeText={setUsername}
          />

          {isLoading && (
            <View className="py-4">
              <ActivityIndicator size="small" color="#6366F1" />
              <Text className="text-center text-gray-500 mt-2">
                Searching users...
              </Text>
            </View>
          )}

          {newChatLoading && (
            <View className="py-4">
              <ActivityIndicator size="small" color="#6366F1" />
            </View>
          )}

          {shouldShowResults && (
            <View className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mt-4">
              <Text className="text-xs font-medium text-gray-500 px-4 pt-3 pb-2">
                FOUND {filteredUsers.length} USER
                {filteredUsers.length > 1 ? 'S' : ''}
              </Text>
              <FlatList
                data={filteredUsers}
                keyExtractor={item => item._id}
                style={{ maxHeight: SCREEN_HEIGHT * 0.3 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    className={`flex-row items-center px-4 py-3 bg-white ${
                      index !== filteredUsers.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }`}
                    onPress={() => handleSelectUser(item._id)}
                  >
                    {item.profileImage ? (
                      <View className="w-10 h-10 rounded-full items-center justify-center mr-3 overflow-hidden">
                        <Image
                          source={{
                            uri: `https://ocrsystem.site/public/${item.profileImage}`,
                          }}
                          className="w-10 h-10 rounded-full"
                          resizeMode="cover"
                        />
                      </View>
                    ) : (
                      <View className="w-10 h-10 rounded-full bg-indigo-500 items-center justify-center mr-3">
                        <Text className="text-white font-medium text-sm">
                          {item.userName?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                      </View>
                    )}

                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium text-base">
                        {item.userName}
                      </Text>
                      <Text className="text-gray-500 text-sm">{item.name}</Text>
                    </View>

                    <View className="w-6 h-6 items-center justify-center">
                      <Text className="text-gray-400 text-lg">💬</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {shouldShowEmptyState && (
            <View className="py-6 items-center justify-center bg-gray-50 rounded-xl mt-4 border border-gray-200">
              <Text className="text-4xl mb-2">🔍</Text>
              <Text className="text-gray-500 font-medium mt-2">
                No users found
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                Try a different username
              </Text>
            </View>
          )}

          <ButtonComponent label="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

export default NewChatComponent;
