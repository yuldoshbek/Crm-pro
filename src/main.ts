// src/main.ts
import './style.css';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase-init';

const appDiv = document.querySelector<HTMLDivElement>('#app')!;

// Показываем простой индикатор загрузки
appDiv.innerHTML = `<h2>Загрузка...</h2>`;

const bootstrapApp = async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Пользователь есть, загружаем и показываем главный компонент
      await import('./crm-app.js');
      appDiv.innerHTML = '<crm-app></crm-app>';
    } else {
      // Пользователя нет, пытаемся войти анонимно
      try {
        await signInAnonymously(auth);
        // После успешного входа, onAuthStateChanged сработает снова и выполнит блок if(user)
      } catch (error) {
        console.error("Ошибка анонимного входа:", error);
        // Если анонимный вход не удался, показываем форму входа
        await import('./auth-shell.js');
        appDiv.innerHTML = '<auth-shell></auth-shell>';
      }
    }
  });
};

bootstrapApp();