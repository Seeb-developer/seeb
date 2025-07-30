// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDr9I9o-huS4D0BzJHzx6aNRpubEDXigQQ',
  authDomain: 'seeb-partner.firebaseapp.com',
  projectId: 'seeb-partner',
  storageBucket: 'seeb-partner.appspot.com',
  messagingSenderId: '835008801894',
  appId: '1:835008801894:android:70e46c5e6f388db92391a7',
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, auth };
