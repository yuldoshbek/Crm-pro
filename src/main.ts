import './style.css';
import './auth-shell';
import './crm-app';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase-init';

const appDiv = document.querySelector<HTMLDivElement>('#app')!;

// Главный "маршрутизатор" приложения
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Если пользователь вошел, показываем ему CRM
    appDiv.innerHTML = `<crm-app></crm-app>`;
  } else {
    // Если нет, показываем форму входа
    appDiv.innerHTML = `<auth-shell></auth-shell>`;
  }
});
