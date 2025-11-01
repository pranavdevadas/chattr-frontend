import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  requestPermission,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

const app = getApp();
const messaging = getMessaging(app);

export async function requestUserPermission() {
  try {
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      const token = await getToken(messaging);
      console.log('FCM Token:', token);
    }
  } catch (error) {
    console.error('Permission request failed:', error);
  }
}
