import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { width } from '../../utils/constent';
import { apiRequest } from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import TermsAndConditionsModal from '../../component/model/TermsAndConditionsModal';
import PrivacyPolicyModal from '../../component/model/PrivacyPolicyModal';

const MobileNumber = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  const isValidPhone = () => /^[6-9]\d{9}$/.test(phone);

  const handleSubmit = async () => {
    if (!isValidPhone()) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await apiRequest('POST', 'customer/new-send-otp', { mobile_no: phone });
      console.log('OTP response:', response);

      if (response.status === 200) {
        navigation.navigate('OTPVerification', { phone });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrorMessage('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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

            <Text style={styles.title}>Enter Your Mobile Number</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setErrorMessage('');
                }}
              />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
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
    justifyContent: "center"
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    // paddingBottom: 40,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    // textAlign: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },

  subheading: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2833',
    borderRadius: 8,
    paddingHorizontal: 15,
    width: '100%',
    marginBottom: 20,
  },
  countryCode: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#00E676',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  termsText: {
  fontSize: 12,
  color: '#bbb',
  textAlign: 'center',
  marginTop: 15,
  lineHeight: 18,
},
linkText: {
  color: '#00E676',
  textDecorationLine: 'underline',
},

});

export default MobileNumber;
