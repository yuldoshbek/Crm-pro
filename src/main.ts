import './style.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase-init';

const appDiv = document.querySelector<HTMLDivElement>('#app')!;

onAuthStateChanged(auth, (user) => {
  if (user) {
    import('./crm-app').then(() => {
      appDiv.innerHTML = `<crm-app></crm-app>`;
    });
  } else {
    import('./auth-shell').then(() => {
      appDiv.innerHTML = `<auth-shell></auth-shell>`;
    });
  }
});