import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import OTPTextInput from 'react-native-otp-textinput';
import { width } from '../../utils/constent';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiRequest } from '../../utils/api';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { save } from '../../utils/storage';
import { UserContext } from '../../hooks/context/UserContext';

const OTPVerification = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const { phone } = route.params; // Receiving phone number from the previous screen
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const user = useContext(UserContext)

  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive]);

  const handleOtp = (code) => {
    setOtp(code);
    if (code.length === 4) {
      handleSubmit(code);
    }
  };

  const showToast = (type, message) => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  const handleSubmit = useCallback(async (otp) => {
    setLoading(true);

    if (otp.length !== 4) {
      showToast('error', 'Please enter a valid 4-digit OTP.');
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest('POST', 'customer/login', { mobile_no: phone, otp });

      if (response.status === 200) {
        showToast('success', 'OTP verified successfully!');
        const userData = response?.user;

        // Check if name or email is missing
        if (!userData?.name || !userData?.email) {
          navigation.navigate('NameEmailScreen', { user: userData }); // Pass userData and phone
        } else {
          try {
            const jsonValue = JSON.stringify({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              mobileNo: phone
            });

            await AsyncStorage.setItem('@user', jsonValue);
            await AsyncStorage.setItem('token', response.token); // Assuming token exists

            user.setUserId(userData.id);
            user.setUserName(userData.name);
            user.setMobileNo(phone);
            user.setIsLoggedIn(true);

            navigation.reset({
              index: 0,
              routes: [{ name: '/home' }],
            });
          } catch (e) {
            console.log('Storage Error:', e);
          }
        }
      } else {
        showToast('error', response.message || 'Invalid OTP, please try again.');
      }
    } catch (error) {
      // console.error('Error verifying OTP:', error);
      showToast('error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [phone, navigation, user]);


  const resendOtp = useCallback(async () => {
    if (timerActive) return;

    try {
      const response = await apiRequest('POST', 'customer/new-send-otp', { mobile_no: phone });
      if (response.status === 200) {
        showToast('success', 'OTP has been resent successfully.');
        setSecondsRemaining(30);
        setTimerActive(true);
      } else {
        showToast('error', 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      showToast('error', 'Failed to resend OTP. Please try again.');
    }
  }, [phone, timerActive]);

  return (
    <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            <Image source={require('../../asset/logofull.png')} style={styles.logo} />

            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>We've sent a 4-digit code to your mobile number.</Text>

            <View style={styles.phoneContainer}>
              <Text style={styles.phoneText}>+91 {phone.slice(0, 8)}{phone.slice(8, 10)}</Text>
              <Icon name="edit" size={20} color="#00E676" style={styles.editIcon} onPress={() => navigation.goBack()} />
            </View>

            <OTPTextInput
              handleTextChange={handleOtp}
              inputCount={4}
              tintColor="#00E676"
              textInputStyle={styles.otpBox}
            />

            <TouchableOpacity style={styles.button} onPress={() => handleSubmit(otp)} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            {timerActive ? (
              <Text style={styles.timerText}>Resend OTP in {secondsRemaining}s</Text>
            ) : (
              <TouchableOpacity onPress={resendOtp}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          {/* <Toast /> */}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>


  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
    justifyContent: 'center',
    // backgroundColor: '#000000',
    // paddingTop: Platform.OS === 'ios' ? 50 : 0,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 20,
    textAlign: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  phoneText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center'
  },
  editIcon: {
    marginLeft: 5,
  },
  otpBox: {
    borderBottomWidth: 2,
    borderColor: '#00E676',
    color: '#fff',
    fontSize: 20,
  },
  button: {
    backgroundColor: '#00E676',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  timerText: {
    color: '#bbb',
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center'
  },
  resendText: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 15,
    textDecorationLine: 'underline',
    textAlign: 'center'
  },
});

export default OTPVerification;
