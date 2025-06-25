import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiRequest } from '../../utils/api';
import Toast from 'react-native-toast-message';
import { UserContext } from '../../hooks/context/UserContext';

const NameEmailScreen = ({ navigation, route }) => {
  const { user: userData } = route.params || {};
  const { setUserId, setUserName, setMobileNo, setIsLoggedIn } = useContext(UserContext);

  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [loading, setLoading] = useState(false);

  const showToast = (type, message) => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('error', 'Please enter your full name.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !emailRegex.test(email)) {
      showToast('error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest('PUT', `customer/updateCustomer/${userData?.id}`, {
        name,
        email,
        mobile_no: userData?.mobile_no
      });

      if (response.status !== 200) {
        showToast('error', response.message || 'Failed to update profile.');
        return;
      }

      const updatedUser = { id: userData?.id || '', name, email, mobileNo: userData?.mobile_no };
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));

      setUserId(updatedUser.id);
      setUserName(updatedUser.name);
      setMobileNo(updatedUser.mobileNo);
      setIsLoggedIn(true);

      showToast('success', 'Profile updated successfully!');
      navigation.reset({ index: 0, routes: [{ name: '/home' }] });
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1C1C1C', '#333333']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Image source={require('../../asset/logofull.png')} style={styles.logo} />
            <Text style={styles.title}>Enter Your Details</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#bbb"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 0,
  },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  logo: { width: 120, height: 120, marginBottom: 30 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15
  },
  button: {
    backgroundColor: '#00E676',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    elevation: 5
  },
  buttonText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
});

export default NameEmailScreen;
