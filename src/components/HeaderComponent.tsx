import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Modal,
  ViewStyle,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Images from '../utils/images';
import { BlurView } from '@react-native-community/blur';
import EditProfileComponent from './EditProfileComponent';
import { showToast } from 'react-native-dan-forden';
import { useDispatch } from 'react-redux';
import { clearCredentials } from '../slice/userAuthSlice';
import { useLogoutMutation } from '../slice/userApiSlice';

interface HeaderComponentProps {
  searchText: string;
  setSearchText: (text: string) => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  searchText,
  setSearchText,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Handle Option Click
  const handleOptionClick = (option: string) => {
    setShowMenu(false);
    if (option === 'edit') {
      setShowEditModal(true);
    } else if (option === 'logout') {
      setShowLogoutModal(true);
    }
  };

  // Redux
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();

  // Handle Logout
  const handleLogout = () => {
    try {
      const result = logout().unwrap();
      console.log(result);
      dispatch(clearCredentials());

      showToast({
        type: 'success',
        message: 'Logout Success',
      });
      setShowLogoutModal(false);
    } catch (err) {
      showToast({
        type: 'danger',
        message: `${err}` || 'Logout failed',
      });
    }
  };

  return (
    <View
      className="bg-primarydark justify-center h-auto px-4 pt-4"
      style={
        { borderBottomLeftRadius: 25, borderBottomRightRadius: 25 } as ViewStyle
      }
    >
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-4">
        <Image
          source={Images.logo}
          style={{ width: 100, height: 50 } as any}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <SimpleLineIcons name="options-vertical" color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      {/* Menu */}
      {showMenu && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
            style={
              {
                position: 'absolute',
                top: 0,
                left: 0,
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
                zIndex: 40,
              } as ViewStyle
            }
          >
            {/* <BlurView
              style={{ flex: 1 } as ViewStyle}
              blurType="light"
              blurAmount={2}
              reducedTransparencyFallbackColor="white"
            /> */}
          </TouchableOpacity>

          <View
            style={
              {
                position: 'absolute',
                right: 14,
                top: 55,
                backgroundColor: 'white',
                zIndex: 50,
                width: 140,
                borderRadius: 8,
                overflow: 'hidden',
              } as ViewStyle
            }
          >
            <TouchableOpacity
              className="px-4 py-3 border-b border-gray-200"
              onPress={() => handleOptionClick('edit')}
            >
              <Text>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-3"
              onPress={() => handleOptionClick('logout')}
            >
              <Text>Logout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Search Bar */}
      <View className="mb-4">
        <View style={{ position: 'relative' } as ViewStyle}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search Chat"
            placeholderTextColor="#888"
            style={
              {
                width: '100%',
                borderRadius: 40,
                height: 50,
                backgroundColor: '#f2f2f2',
                paddingLeft: 50,
                color: '#000',
              } as ViewStyle
            }
          />
          <AntDesign
            name="search1"
            color="#888"
            size={24}
            style={
              {
                position: 'absolute',
                left: 15,
                top: 12,
                zIndex: 1,
              } as ViewStyle
            }
          />
        </View>
      </View>

      {/* Edit Profile Modal */}

      <EditProfileComponent
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

      {/* Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 justify-center items-center">
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
            blurAmount={5}
            reducedTransparencyFallbackColor="white"
          />

          <View className="bg-white w-[85%] rounded-2xl p-6 shadow-lg items-center">
            {/* Logout Icon */}
            <View className="bg-red-100 w-16 h-16 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="logout" color="#DC2626" size={30} />
            </View>

            <Text className="text-xl font-soraBold text-black mb-2 text-center">
              Logout ?
            </Text>

            <Text className="text-gray-600 text-center mb-6">
              Are you sure you want to logout from your account?
            </Text>

            <View className="flex-row justify-between w-full px-4">
              <TouchableOpacity
                className="bg-red-500 flex-1 py-3 rounded-2xl flex-row items-center justify-center mr-2"
                onPress={() => setShowLogoutModal(false)}
              >
                <MaterialIcons name="close" color="#fff" size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-500 flex-1 py-3 rounded-2xl flex-row items-center justify-center ml-2"
                onPress={handleLogout}
              >
                <MaterialIcons name="check" color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HeaderComponent;
