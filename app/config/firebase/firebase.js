import firebase from "firebase/app";
import "firebase/auth";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//import { getMessaging } from "firebase/messaging";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyADb74Le30QfsWhPtbLrcsSnawmzbNo0yA",
  authDomain: "wedding-app-9edf3.firebaseapp.com",
  projectId: "wedding-app-9edf3",
  storageBucket: "wedding-app-9edf3.appspot.com",
  messagingSenderId: "980083023843",
  appId: "1:980083023843:web:34f7d63f6d78058807cad6",
};

export const EMAIL_SUFFIX = "@cambazz.de";
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
//export const messaging = getMessaging(app);
