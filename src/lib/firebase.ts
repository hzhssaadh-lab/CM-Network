import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBUXvwimdY3ra84lf_KizGfnMDHTiD8EWU",
  authDomain: "cm-network-d4de7.firebaseapp.com",
  databaseURL: "https://cm-network-d4de7-default-rtdb.firebaseio.com",
  projectId: "cm-network-d4de7",
  storageBucket: "cm-network-d4de7.firebasestorage.app",
  messagingSenderId: "187236512255",
  appId: "1:187236512255:web:bff6bbb5529155bc1eb7ca",
  measurementId: "G-W62XZRWKLL"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Use the default firestore database from the user's config
export const db = getFirestore(app);

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
    } else if (err.code == 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });
}

export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics if needed
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
export { analytics };
