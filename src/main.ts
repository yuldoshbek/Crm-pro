// src/main.ts
import './style.css';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, db } from './firebase-init.js';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

// Импортируем наши корневые компоненты
import './crm-app.js';
import './auth-shell.js';
import './workspace-selector.js';

const appDiv = document.querySelector<HTMLDivElement>('#app')!;

// --- Глобальные переменные ---
let activeWorkspaceId: string | null = sessionStorage.getItem('activeWorkspaceId');

/**
 * Функция для парсинга URL и извлечения ID рабочего пространства из приглашения.
 * @returns {string | null} ID рабочего пространства или null.
 */
const getWorkspaceIdFromInvite = (): string | null => {
  const path = window.location.pathname;
  const match = path.match(/^\/invite\/([a-zA-Z0-9]+)/);
  if (match && match[1]) {
    // Убираем инвайт из URL, чтобы он не мешал при перезагрузке
    window.history.replaceState({}, document.title, '/');
    return match[1];
  }
  return null;
};

/**
 * Функция для добавления пользователя в рабочее пространство.
 * @param {string} userId - ID пользователя для добавления.
 * @param {string} workspaceId - ID рабочего пространства.
 */
const addUserToWorkspace = async (userId: string, workspaceId: string) => {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    try {
        // Используем arrayUnion, чтобы безопасно добавить ID пользователя в массив members,
        // избегая дубликатов.
        await updateDoc(workspaceRef, {
            members: arrayUnion(userId)
        });
        console.log(`Пользователь ${userId} добавлен в пространство ${workspaceId}`);
    } catch (error) {
        console.error("Ошибка при добавлении пользователя в пространство:", error);
    }
};


// --- Функции рендеринга ---
const renderCrmApp = (workspaceId: string) => {
  appDiv.innerHTML = `<crm-app workspaceId="${workspaceId}"></crm-app>`;
};

const renderWorkspaceSelector = () => {
  appDiv.innerHTML = `<workspace-selector></workspace-selector>`;
};

/**
 * Главная функция, которая инициализирует приложение.
 */
const bootstrapApp = () => {
  appDiv.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;"><h2>Загрузка...</h2></div>`;
  
  // Проверяем, есть ли в URL приглашение
  const inviteWorkspaceId = getWorkspaceIdFromInvite();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Пользователь есть.
      if (inviteWorkspaceId) {
        // Если пользователь пришел по ссылке-приглашению
        await addUserToWorkspace(user.uid, inviteWorkspaceId);
        // Сразу делаем это пространство активным и рендерим приложение
        activeWorkspaceId = inviteWorkspaceId;
        sessionStorage.setItem('activeWorkspaceId', inviteWorkspaceId);
        renderCrmApp(inviteWorkspaceId);
      } else if (activeWorkspaceId) {
        // Если пользователь просто вернулся, и у него уже есть активное пространство
        renderCrmApp(activeWorkspaceId);
      } else {
        // Если пользователь вошел, но пространство не выбрано
        renderWorkspaceSelector();
      }
    } else {
      // Пользователя нет.
      try {
        // Пытаемся войти анонимно. onAuthStateChanged сработает снова.
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Ошибка анонимного входа:", error);
        appDiv.innerHTML = '<auth-shell></auth-shell>';
      }
    }
  });
};

// --- Глобальные обработчики событий ---
appDiv.addEventListener('select-workspace', (e: Event) => {
  const { workspaceId } = (e as CustomEvent).detail;
  if (workspaceId) {
    activeWorkspaceId = workspaceId;
    sessionStorage.setItem('activeWorkspaceId', workspaceId);
    renderCrmApp(workspaceId);
  }
});

appDiv.addEventListener('exit-workspace', () => {
  activeWorkspaceId = null;
  sessionStorage.removeItem('activeWorkspaceId');
  renderWorkspaceSelector();
});

auth.onIdTokenChanged(async (user) => {
    if (!user) {
        activeWorkspaceId = null;
        sessionStorage.removeItem('activeWorkspaceId');
    }
});

// Запускаем приложение
bootstrapApp();
