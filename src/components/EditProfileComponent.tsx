import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ViewStyle,
} from 'react-native';
import React, { useState } from 'react';
import ImageCropPicker from 'react-native-image-crop-picker';
import { showToast } from 'react-native-dan-forden';
import Images from '../utils/images';
import InputTextComponent from './InputTextComponent';
import ButtonComponent from './ButtonComponent';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BlurView } from '@react-native-community/blur';
import { Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useUpdateProfileMutation } from '../slice/userApiSlice';
import Loader from './Loader';
import { setCredentials } from '../slice/userAuthSlice';
import validation from '../InputValidation';

type EditProfileModalProps = {
  visible: boolean;
  onClose: () => void;
};

const EditProfileComponent: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const [username, setUsername] = useState(`${userInfo.userName}`);
  const [name, setName] = useState(`${userInfo.name}`);
  const [profileImage, setProfileImage] = useState<string | null>(
    userInfo.profileImage
      ? `http://192.168.220.3:5000/public/${userInfo.profileImage}`
      : null,
  );

  // Mutation
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  // Image Picker
  const handleImagePick = async () => {
    try {
      const image = await ImageCropPicker.openPicker({
        width: 512,
        height: 512,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });
      if (image.path) setProfileImage(image.path);
    } catch {
      console.log('Image selection cancelled');
    }
  };

  // Handle Submit
  const handleSubmit = async () => {
    const nameErrorMsg = validation.validateName(name);
    const usernameErrorMsg = validation.validateUsername(username);
    setNameError(nameErrorMsg);
    setUsernameError(usernameErrorMsg);
    if (nameErrorMsg || usernameErrorMsg) {
      showToast({ type: 'danger', message: 'Please fix validation errors' });
      return;
    }
    if (
      name === userInfo.name &&
      username === userInfo.userName &&
      profileImage?.includes(userInfo.profileImage || '')
    ) {
      showToast({ type: 'danger', message: 'Nothing to update' });
      return;
    }


    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('userName', username);

      if (profileImage && !profileImage.includes('http')) {
        const filename = profileImage.split('/').pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('profileImage', {
          uri: profileImage,
          name: filename,
          type,
        } as any);
      }

      const result = await updateProfile(formData).unwrap();
      dispatch(setCredentials(result.user));
      showToast({ type: 'success', message: 'Profile Updated' });
      onClose();
    } catch (error: any) {
      console.log('Update failed:', error);
      showToast({ type: 'danger', message: 'Failed to update profile' });
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 } as ViewStyle}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 } as ViewStyle}
          keyboardShouldPersistTaps="handled"
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

            <View className="bg-white w-[85%] rounded-2xl p-6 shadow-lg items-center">
              <Text className="text-2xl font-soraBold text-black mb-6">
                Edit Profile
              </Text>

              <View className="items-center mb-8">
                <View className="relative">
                  <Image
                    source={
                      profileImage ? { uri: profileImage } : Images.defaultDp
                    }
                    className="w-32 h-32 rounded-full border-4 border-primarylight"
                  />
                  <Pressable
                    onPress={handleImagePick}
                    className="absolute bottom-1 right-1 bg-primarydark w-10 h-10 rounded-full items-center justify-center border-4 border-white"
                  >
                    <Text className="text-white text-xl font-bold">+</Text>
                  </Pressable>
                </View>

                <TouchableOpacity onPress={handleImagePick} className="mt-3">
                  <Text className="text-primarydark font-soraBold">
                    Change Photo
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="w-full mb-8">
                <InputTextComponent
                  label="Change Name"
                  header="Name"
                  onchangeText={text => {
                    setName(text);
                  }}
                  value={name}
                  validationErr={nameError}
                />
                <InputTextComponent
                  label="Change Username"
                  header="Username"
                  onchangeText={text => {
                    setUsername(text);
                  }}
                  value={username}
                  validationErr={usernameError}
                />
              </View>

              <ButtonComponent
                label="Save Changes"
                onPress={handleSubmit}
                icon={<FontAwesome name="edit" color="#fff" size={20} />}
              />
            </View>
          </View>
        </ScrollView>
        <Loader visible={isLoading} />
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditProfileComponent;
