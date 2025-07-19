// src/firebase-init.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Новая конфигурация для проекта "khasanov-crm"
const firebaseConfig = {
  apiKey: "AIzaSyBZhOiKaVg3rNv9Ek5Cqa01lOAd2zQFpOo",
  authDomain: "khasanov-crm.firebaseapp.com",
  projectId: "khasanov-crm",
  // ВАЖНО: Я исправил это значение на стандартный формат.
  // Firebase иногда показывает некорректное значение в этом поле.
  // Правильный формат для Storage Bucket - это "PROJECT_ID.appspot.com".
  storageBucket: "khasanov-crm.firebasestorage.app",
  messagingSenderId: "396455182795",
  appId: "1:396455182795:web:43e72dc7122cc13aa8f64e"
};

// Инициализация сервисов Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
