import { NavigationContainer } from '@react-navigation/native';
import './global.css';
import AppNavigator from './src/navigation/AppNavigator';
import { enableScreens } from 'react-native-screens';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from 'react-native-dan-forden';
import RNBootSplash from 'react-native-bootsplash';
import { useEffect, useState } from 'react';
import store from './src/store';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { loadCredentials } from './src/slice/userAuthSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ViewStyle } from 'react-native';
import Loader from './src/components/Loader';
import { connectSocket, setUserOnline } from './src/utils/socket';
import { requestUserPermission } from './src/utils/firebase';

enableScreens();

const LoadUserData = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const userInfo = useSelector((state: any) => state.auth.userInfo);

  useEffect(() => {
    const init = async () => {
      try {
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
        const storedUser = await AsyncStorage.getItem('userInfo');
        if (storedUser) {
          dispatch(loadCredentials(JSON.parse(storedUser)));
        }
      } catch (err) {
        console.log('Failed to load user info:', err);
      } finally {
        RNBootSplash.hide({ fade: true });
        setLoading(false);
      }
    };
    init();
  }, [dispatch]);

  useEffect(() => {
    if (userInfo) {
      const socketInstance = connectSocket();
      socketInstance.on('connect', () => {
        setUserOnline(userInfo._id);
      });
      socketInstance.io.on('reconnect', () => {
        console.log('Socket reconnected');
        setUserOnline(userInfo._id);
      });
    }
  }, [userInfo]);

  useEffect(() => {
    requestUserPermission();
  }, []);

  return (
    <View className="flex-1">
      <ToastProvider>
        <AppNavigator />
      </ToastProvider>

      <Loader visible={loading} onFadeComplete={() => setLoading(false)} />
    </View>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: 'black' } as ViewStyle}
        >
          <NavigationContainer>
            <LoadUserData />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
}
