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
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import TermsAndConditionsModal from '../../component/model/TermsAndConditionsModal';
import PrivacyPolicyModal from '../../component/model/PrivacyPolicyModal';

const OTPVerification = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const { phone } = route.params; // Receiving phone number from the previous screen
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  const CELL_COUNT = 4;
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });


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
    // navigation.navigate('Step1PersonalInfo', { user: { phone } });
    setLoading(true);

    if (otp.length !== 4) {
      showToast('error', 'Please enter a valid 4-digit OTP.');
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('fcmtoken') ?? null;
      const response = await apiRequest('POST', 'customer/login', { mobile_no: phone, otp, fcm_token: token });

      if (response.status === 200) {
        showToast('success', 'OTP verified successfully!');
        const userData = response?.user;
        console.log('User Data:', userData);

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
            <Text style={styles.heading}>Welcome to Seeb</Text>
            <Text style={styles.subheading}>India’s First AI Interior Platform</Text>


            <Text style={styles.subtitle}>We've sent a 4-digit code to your mobile number.</Text>

            <View style={styles.phoneContainer}>
              <Text style={styles.phoneText}>+91 {phone.slice(0, 8)}{phone.slice(8, 10)}</Text>
              <Icon name="edit" size={20} color="#00E676" style={styles.editIcon} onPress={() => navigation.goBack()} />
            </View>

            <Text style={styles.title}>Enter OTP</Text>
            {/* <OTPTextInput
              handleTextChange={handleOtp}
              inputCount={4}
              tintColor="#00E676"
              textInputStyle={styles.otpBox}
            /> */}
            <CodeField
              ref={ref}
              {...props}
              value={value}
              onChangeText={(text) => {
                setValue(text);
                if (text.length === 4) {
                  handleSubmit(text);
                }
              }}
              autoFocus
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, symbol, isFocused }) => (
                <Text
                  key={index}
                  style={[styles.cell, isFocused && styles.focusCell]}
                  onLayout={getCellOnLayoutHandler(index)}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              )}
            />


            <TouchableOpacity style={styles.button} onPress={() => handleSubmit(otp)} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            {timerActive ? (
              <Text style={timerActive ? styles.timerText : styles.hidden}>
                Didn’t receive OTP? Resend in {secondsRemaining}s
              </Text>
            ) : (
              <TouchableOpacity onPress={resendOtp}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkText} onPress={() => setTermsVisible(true)}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={styles.linkText} onPress={() => setPrivacyVisible(true)}>
                Privacy Policy
              </Text>.
            </Text>
            <TermsAndConditionsModal visible={termsVisible} onClose={() => setTermsVisible(false)} />
            <PrivacyPolicyModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />


          </ScrollView>
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
    width: width * 0.4,
    height: width * 0.4,
    alignSelf: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    // textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 4,
    textAlign: 'center',
    marginTop: 10,

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
  // otpBox: {
  //   borderBottomWidth: 2,
  //   borderColor: '#00E676',
  //   color: '#fff',
  //   fontSize: 20,
  // },
  otpBox: {
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#00E676',
    color: '#fff',
    fontSize: 18,
    padding: 10,
    width: 50,
    height: 55,
    textAlign: 'center',
    marginHorizontal: 5,
    backgroundColor: '#1C2833',
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
  hidden: {
    height: 0,
    opacity: 0,
  },

  cell: {
    width: 55,
    height: 55,
    lineHeight: 55,
    fontSize: 20,
    borderWidth: 2,
    borderColor: '#00E676',
    textAlign: 'center',
    borderRadius: 10,
    backgroundColor: '#1C2833',
    color: '#fff',
    marginHorizontal: 5,
  },
  focusCell: {
    borderColor: '#FFD700',
  },
  termsText: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },

  linkText: {
    color: '#00E676',
    textDecorationLine: 'underline',
  },


});

export default OTPVerification;
