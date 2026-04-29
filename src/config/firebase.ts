import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8RgNgpPTwGniKonJcO9JSAT2PkJpsvxA",
  authDomain: "pos-auth-dbe0d.firebaseapp.com",
  projectId: "pos-auth-dbe0d",
  storageBucket: "pos-auth-dbe0d.firebasestorage.app",
  messagingSenderId: "914784141628",
  appId: "1:914784141628:web:2b8c5e0fdf95e9751e5e39",
  measurementId: "G-KYGWNHYLT7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");

export default app;
