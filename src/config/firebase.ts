import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAcs4EWCd2zEbVsdrSTTZyVM8ePPQt_gvg",
  authDomain: "review-feed-488c0.firebaseapp.com",
  projectId: "review-feed-488c0",
  storageBucket: "review-feed-488c0.appspot.com",
  messagingSenderId: "1048129660452",
  appId: "1:1048129660452:web:c1be0d305ce2a897e69ab1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();