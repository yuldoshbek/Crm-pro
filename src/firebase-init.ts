import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAbSCmf45fm9H7-5J71GBBv-UxaFQHyA3k",
    authDomain: "crm-pro-d070a.firebaseapp.com",
    projectId: "crm-pro-d070a",
    storageBucket: "crm-pro-d070a.appspot.com",
    messagingSenderId: "595985373084",
    appId: "1:595985373084:web:c1d8ccb37ccfb023819a59",
    measurementId: "G-HDVDRXDB5S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);