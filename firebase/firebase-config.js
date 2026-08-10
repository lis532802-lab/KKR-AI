import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBchtm5yS1ZuW1b-5DWAIncTysOv09bYX0",
    authDomain: "stevenx-4ef00.firebaseapp.com",
    databaseURL: "https://stevenx-4ef00-default-rtdb.firebaseio.com",
    projectId: "stevenx-4ef00",
    storageBucket: "stevenx-4ef00.firebasestorage.app",
    messagingSenderId: "882062097165",
    appId: "1:882062097165:android:3eb7501b29a3d54b06ce44"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
