import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";

const firebaseConfig = {

    apiKey: "AIzaSyDeCiMKNv9WCAZ62rdhkSJyETFEJT-qkkE",
  
    authDomain: "fir-c0126.firebaseapp.com",
  
    projectId: "fir-c0126",
  
    storageBucket: "fir-c0126.firebasestorage.app",
  
    messagingSenderId: "927534645450",
  
    appId: "1:927534645450:web:7d4fad6e9ac4682051b433"
  
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export { db };

if (__DEV__) {
  connectStorageEmulator(storage, 'localhost', 9199);
}

export default app;

