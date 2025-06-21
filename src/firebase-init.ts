// src/firebase-init.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
export const db = getFirestore(app);
export const auth = getAuth(app);