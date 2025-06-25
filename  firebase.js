// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCsL9U_oh9LlD3GxyRIaI--MrSsDj0smi0",
    authDomain: "seeb-e3cea.firebaseapp.com",
    databaseURL: "https://seeb-e3cea-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "seeb-e3cea",
    storageBucket: "seeb-e3cea.firebasestorage.app",
    messagingSenderId: "700320378270",
    appId: "1:700320378270:web:e4d5a0fce9687ea0ce7a8f",
    measurementId: "G-B1X3YNCE4L"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
