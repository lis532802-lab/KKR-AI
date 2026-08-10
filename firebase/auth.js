import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    signOut, 
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { auth, googleProvider } from "./firebase-config.js";

export const loginEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const registerEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const loginGoogle = () => signInWithPopup(auth, googleProvider);
export const logoutUser = () => signOut(auth);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const updateUserProfile = (name, photoURL) => updateProfile(auth.currentUser, { displayName: name, photoURL });
export const listenAuthState = (callback) => onAuthStateChanged(auth, callback);
