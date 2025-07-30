import { View, Text, StatusBar, StyleSheet, LogBox, Platform, Alert, Modal, TouchableOpacity, AppState } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { UserContext } from './src/hooks/context/UserContext'
import { AppNavigater } from './src/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getLocation, requestUserPermission, setupNotificationListeners } from './src/utils/pushNotificationUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SplashScreen from './src/screens/SplashScreen'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message'
import { CartContext } from './src/hooks/context/CartContext'
import { apiRequest } from './src/utils/api'; // ✅ Ensure you import apiRequest
import ReactNativeBlobUtil from 'react-native-blob-util';
import hotUpdate from 'react-native-ota-hot-update';
import DeviceInfo from 'react-native-device-info'
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
const App = () => {
  const [username, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [screenName, setScreenName] = useState('Login');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // ✅ Fetch User Data from AsyncStorage
  const fetchUserData = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem('@user');
      if (value) {
        const data = JSON.parse(value);
        setUserId(data.id);
        setUserName(data.name);
        setIsLoggedIn(true);
        setMobileNo(data.mobileNo);
        setScreenName('/home');
      }
    } catch (e) {
      console.error('Error fetching user data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch Cart Data (Only when userId is set)
  const updateCart = useCallback(async () => {
    if (!userId) return; // 🔥 Ensures API doesn't call with empty userId

    try {
      const response = await apiRequest("GET", `seeb-cart/getCart/${userId}`);
      if (response.status === 200 && Array.isArray(response.data)) {
        setCart(response.data); // ✅ Set cart from API response
      } else {
        setCart([]); // ✅ Empty cart if response is invalid
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      setCart([]); // ✅ Ensure cart is empty on failure
    }
  }, [userId]); // 🔥 Runs only when userId changes

  // ✅ Run fetchUserData on App Load
  useEffect(() => {
    if (!__DEV__) {
      console.log = () => { };
    }

    requestUserPermission();
    getLocation();

    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
    fetchUserData();
  }, [fetchUserData]);

  // ✅ Run fetchCartData **only after userId is set**
  useEffect(() => {
    if (userId) {
      updateCart();
    }
  }, [userId]); // 🔥 Runs only when userId is updated

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [remoteVersion, setRemoteVersion] = useState(null);
  const [updateUrl, setUpdateUrl] = useState(null);

  useEffect(() => {
    messaging().getAPNSToken().then(token => {
      console.log("🔐 APNs token:", token);
    });

    const checkVersion = async () => {
      try {
        setChecking(true);
        const version = DeviceInfo.getVersion();
        setCurrentVersion(version);

        const res = await fetch('https://app.seeb.in/seeb/update.json');
        const data = await res.json();

        const url =
          Platform.OS === 'android'
            ? data.url_android
            : data.url_ios;

        setRemoteVersion(data.version);

        if (data.version > version) {
          setUpdateUrl(url);
          setShowUpdateModal(true); // show modal or button
        }
      } catch (err) {
        console.warn('OTA check failed', err);
      } finally {
        setChecking(false);
      }
    };

    checkVersion();
  }, []);

  const installUpdate = async () => {
    try {
      await hotUpdate.downloadBundleUri(ReactNativeBlobUtil, updateUrl, remoteVersion, {
        updateSuccess: () => {
          Alert.alert('✅ Update Installed', 'App will restart now.');
        },
        updateFail: (msg) => {
          Alert.alert('❌ Update Failed', msg || 'Download failed.');
        },
        restartAfterInstall: true,
      });
    } catch (err) {
      console.warn('Update failed:', err);
      Alert.alert('Error', 'Update failed. Please try again.');
    }
  };

  useEffect(() => {
    const clearBadgeAndMarkRead = async () => {
      try {
        await notifee.setBadgeCount(0); // ✅ Clear iOS badge
        if (userId) {
          await apiRequest('POST', 'notifications/mark-all-read', {
            user_type: 'customer',
            user_id: userId,
          });
        }
      } catch (err) {
        console.error('🔥 Failed to mark notifications as read or clear badge:', err);
      }
    };

    const handleAppStateChange = (state) => {
      if (state === 'active') {
        clearBadgeAndMarkRead();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove(); // ✅ Correct cleanup in newer React Native
    };
  }, [userId]);
  return (
    <>
      {loading ? <SplashScreen /> :
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.container}>
            {showUpdateModal && (
              <TouchableOpacity style={styles.bottomBanner} onPress={installUpdate}>
                <Text style={styles.bannerText}>🔄 Update Available – Tap to Install</Text>
              </TouchableOpacity>
            )}
            {Platform.OS === 'android' &&
              <StatusBar
                animated
                backgroundColor={"#000"}
                barStyle="light-content"
              />
            }
            <UserContext.Provider value={{
              setUserName, username, setUserId, userId, isLoggedIn,
              setIsLoggedIn, mobileNo, setMobileNo, cart, setCart
            }}>
              <CartContext.Provider value={{ cart, setCart, updateCart }}>
                <AppNavigater onReady={(navigationRef) => {
                  setupNotificationListeners(navigationRef);
                }} screenName={screenName} />
                <Toast />
                <Modal visible={showUpdateModal} transparent animationType="slide">
                  <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                      {/* Close Button */}
                      <TouchableOpacity onPress={() => setShowUpdateModal(false)} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>×</Text>
                      </TouchableOpacity>

                      <Text style={styles.modalTitle}>New Update Available</Text>
                      <Text style={styles.modalText}>Current: {currentVersion} → New: {remoteVersion}</Text>

                      <TouchableOpacity onPress={installUpdate} style={styles.updateBtn}>
                        <Text style={styles.updateBtnText}>Install Update</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>


              </CartContext.Provider>
            </UserContext.Provider>
          </View>
        </GestureHandlerRootView>
      }
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingTop: Platform.OS === 'ios' ? 40 : 0,
  },
  bottomBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007AFF',
    padding: 14,
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  updateBtn: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 15,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'red',
  },
})

export default App;
