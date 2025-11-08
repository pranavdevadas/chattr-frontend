import {
  View,
  Image,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
} from 'react-native';
import Images from '../../utils/images';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import InputTextComponent from '../../components/InputTextComponent';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ButtonComponent from '../../components/ButtonComponent';
import { OtpInput } from 'react-native-otp-entry';
import {
  useRegisterMutation,
  useVerifyOtpMutation,
  useLoginMutation,
  useResendOtpMutation,
  useSaveFcmTokenMutation,
} from '../../slice/userApiSlice';
import { showToast } from 'react-native-dan-forden';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../slice/userAuthSlice';
import validation from '../../InputValidation';
import Loader from '../../components/Loader';
import { connectSocket } from '../../utils/socket';
import { getFcmToken, requestUserPermission } from '../../utils/firebase';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<
    'register' | 'verification' | 'login'
  >('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [prevSelected, setPrevSelected] = useState<'register' | 'login'>(
    'register',
  );

  // Mutations
  const [register, { isLoading }] = useRegisterMutation();
  const [verifiyOtp, { isLoading: otpLoading }] = useVerifyOtpMutation();
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [resendOtp, { isLoading: resendOtpLoading }] = useResendOtpMutation();
  const [saveFcmToken, { isLoading: saveFcmTokenLoading }] =
    useSaveFcmTokenMutation();

  // Validation states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  validation.validateOtp(otp);
  const handleMoveToVerification = async () => {
    const nameValidation = validation.validateName(name);
    const emailValidation = validation.validateEmail(email);
    setNameError(nameValidation);
    setEmailError(emailValidation);
    if (!name.trim() || !email.trim()) {
      showToast({
        type: 'danger',
        message: 'Please enter both name and email',
      });
      return;
    }

    try {
      const response = await register({
        name: name.trim(),
        email: email.trim(),
      }).unwrap();
      showToast({
        type: 'success',
        message: response?.message || 'OTP sent successfully',
      });
      setSelected('verification');
    } catch (err: any) {
      console.log('Registration Error:', err);
      showToast({
        type: 'danger',
        message: err?.data?.message || 'Registration failed',
      });
    }
  };

  //Handling Functions
  const handleTabChange = (
    newSelection: 'register' | 'login' | 'verification',
  ) => {
    if (newSelection === 'register' || newSelection === 'login') {
      setPrevSelected(newSelection);
    }
    setSelected(newSelection);
    setNameError('');
    setEmailError('');
    setOtpError('');
  };
  const handleSubmit = async () => {
    const otpValidation = validation.validateOtp(otp);
    setOtpError(otpValidation);

    if (otpValidation) {
      showToast({
        type: 'danger',
        message: 'Please fix the OTP validation error',
      });
      return;
    }

    if (!otp) {
      showToast({
        type: 'danger',
        message: 'Please enter the OTP',
      });
      return;
    }

    try {
      const response = await verifiyOtp({ email: email.trim(), otp }).unwrap();
      showToast({
        type: 'success',
        message: response?.message || 'Verification successful',
      });
      dispatch(setCredentials(response.user));
      connectSocket();
      await requestUserPermission();
      let token = getFcmToken();
      console.log('FCM Token:', token);
      if (!token) {
        console.log('No token received');
        return;
      }
      await saveFcmToken({ fcmToken: token }).unwrap();
    } catch (err: any) {
      console.log('Verification Error:', err);
      showToast({
        type: 'danger',
        message: err?.data?.message || 'Verification failed',
      });
    }
  };

  const handleLogin = async () => {
    const emailValidation = validation.validateEmail(email);
    setEmailError(emailValidation);

    if (!email.trim()) {
      showToast({
        type: 'danger',
        message: 'Please enter your email',
      });
      return;
    }

    try {
      const result = await login({ email: email.trim() }).unwrap();
      showToast({
        type: 'success',
        message: result?.message || 'Login OTP sent successfully',
      });
      setSelected('verification');
    } catch (err: any) {
      console.log('Login Error:', err);
      showToast({
        type: 'danger',
        message: err?.data?.message || 'Login failed',
      });
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      showToast({
        type: 'danger',
        message: 'Email not found. Enter your correct email',
      });
      return;
    }

    setIsDisabled(true);
    setTimer(30);

    try {
      const result = await resendOtp({ email }).unwrap();
      showToast({
        type: 'success',
        message: result?.message || 'Resend OTP sent successfully',
      });
    } catch (err: any) {
      console.log('Resend otp Error:', err);
      showToast({
        type: 'danger',
        message: err?.data?.message || 'Resend Otp failed',
      });
    }
  };

  //On Change Text
  const handleNameChange = (text: string) => {
    setName(text);
    if (nameError) {
      setNameError(validation.validateName(text));
    }
  };
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError(validation.validateEmail(text));
    }
  };
  const handleOtpChange = (text: string) => {
    setOtp(text);
    if (otpError) {
      setOtpError(validation.validateOtp(text));
    }
  };

  // Timer for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setIsDisabled(false);
    }
  }, [timer]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 } as ViewStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 } as ViewStyle}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          <Image
            source={Images.authBackground0}
            className="w-full h-1/2 -top-28"
          />
          <Image
            source={Images.authBackground1}
            className="w-full h-1/2 absolute -mt-28 -top-28"
          />
          <Image source={Images.logo} className="absolute mt-10 ml-4" />

          <View className="m-4 -top-28">
            <Text className="font-sora text-black text-2xl">
              {selected === 'register'
                ? 'Enter To the Account'
                : selected === 'login'
                  ? 'Login To Your Account'
                  : 'Enter The Verification Code'}
            </Text>

            <View className="flex-row">
              <Pressable
                onPress={() =>
                  handleTabChange(
                    prevSelected === 'register' ? 'register' : 'login',
                  )
                }
                className="flex-1 items-center justify-center"
              >
                <View className="flex-row items-center space-x-2">
                  <MaterialCommunityIcons
                    name="login"
                    size={24}
                    color={
                      selected === 'register' || selected === 'login'
                        ? '#7B3FD3'
                        : '#000'
                    }
                  />
                  <Text
                    style={
                      {
                        color:
                          selected === 'register' || selected === 'login'
                            ? '#7B3FD3'
                            : '#000',
                      } as ViewStyle
                    }
                  >
                    {prevSelected === 'register' ? 'Enter' : 'Login'}
                  </Text>
                </View>
                {(selected === 'register' || selected === 'login') && (
                  <View className="h-1 w-full bg-primarydark mt-2" />
                )}
              </Pressable>

              <Pressable className="flex-1 items-center justify-center py-4">
                <View className="flex-row items-center space-x-2">
                  <MaterialIcons
                    name="verified-user"
                    size={24}
                    color={selected === 'verification' ? '#7B3FD3' : '#000'}
                  />
                  <Text
                    style={
                      {
                        color: selected === 'verification' ? '#7B3FD3' : '#000',
                      } as ViewStyle
                    }
                  >
                    Verification
                  </Text>
                </View>
                {selected === 'verification' && (
                  <View className="h-1 w-full bg-primarydark mt-2" />
                )}
              </Pressable>
            </View>

            <View className="space-y-6 mt-2">
              {selected === 'register' ? (
                <>
                  <InputTextComponent
                    label="Enter your Name"
                    header="Name"
                    value={name}
                    onchangeText={handleNameChange}
                    validationErr={nameError}
                  />
                  <InputTextComponent
                    label="Enter your Email"
                    header="Email"
                    value={email}
                    keyboardType="email-address"
                    onchangeText={handleEmailChange}
                    validationErr={emailError}
                  />
                  <View className="self-center w-52 rounded-md overflow-hidden">
                    <ButtonComponent
                      icon={
                        <Ionicons
                          name="play-forward-outline"
                          color="#fff"
                          size={24}
                        />
                      }
                      label={isLoading ? 'Loading...' : 'Next Step'}
                      onPress={handleMoveToVerification}
                    />
                  </View>
                </>
              ) : selected === 'verification' ? (
                <>
                  <OtpInput
                    numberOfDigits={6}
                    focusColor="#7B3FD3"
                    //secureTextEntry={true}
                    onTextChange={handleOtpChange}
                  />
                  {otpError ? (
                    <Text className="text-red-500 text-sm mt-2">
                      {otpError}
                    </Text>
                  ) : null}
                  <View className="mt-4 self-center w-52 rounded-md overflow-hidden">
                    <ButtonComponent
                      icon={
                        <MaterialCommunityIcons
                          name="login"
                          size={24}
                          color="#fff"
                        />
                      }
                      label={otpLoading ? 'Loading...' : 'Submit'}
                      onPress={handleSubmit}
                    />
                  </View>
                </>
              ) : (
                <>
                  <InputTextComponent
                    label="Enter your Email"
                    header="Email"
                    value={email}
                    keyboardType="email-address"
                    onchangeText={handleEmailChange}
                    validationErr={emailError}
                  />
                  <View className="mt-4 self-center w-52 rounded-md overflow-hidden">
                    <ButtonComponent
                      icon={
                        <Ionicons
                          name="play-forward-outline"
                          color="#fff"
                          size={24}
                        />
                      }
                      label={loginLoading ? 'Loading...' : 'Next Step'}
                      onPress={handleLogin}
                    />
                  </View>
                </>
              )}
            </View>
            <View className="flex-row items-center justify-center mt-6">
              {selected === 'register' ? (
                <>
                  <Text className="font-sora text-base">
                    Already have an Account ?
                  </Text>
                  <Pressable onPress={() => handleTabChange('login')}>
                    <Text className="font-sora font-soraBold text-primarydark ml-1 text-lg">
                      Login
                    </Text>
                  </Pressable>
                </>
              ) : selected === 'login' ? (
                <>
                  <Text className="font-sora text-base">New User ?</Text>
                  <Pressable onPress={() => handleTabChange('register')}>
                    <Text className="font-sora font-soraBold text-primarydark ml-1 text-lg">
                      Register
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text className="font-sora text-base">
                    Didn't get the OTP?
                  </Text>
                  <Pressable
                    onPress={!isDisabled ? handleResendOtp : undefined}
                    disabled={isDisabled}
                  >
                    <Text
                      className={`font-sora font-soraBold ml-1 text-lg ${
                        isDisabled ? 'text-gray-400' : 'text-primarydark'
                      }`}
                    >
                      {isDisabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <Loader
        visible={
          isLoading ||
          otpLoading ||
          loginLoading ||
          resendOtpLoading ||
          saveFcmTokenLoading
        }
      />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
