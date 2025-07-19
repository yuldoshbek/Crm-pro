// src/main.ts
import './style.css';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase-init.js';

// Импортируем все наши корневые компоненты
import './crm-app.js';
import './auth-shell.js';
import './workspace-selector.js';
import './mode-selector.js';

const appDiv = document.querySelector<HTMLDivElement>('#app')!;

// --- Глобальное состояние ---
// Пытаемся получить сохраненные значения из sessionStorage
let activeMode: 'assistant' | 'projects' | null = sessionStorage.getItem('activeMode') as any;
let activeWorkspaceId: string | null = sessionStorage.getItem('activeWorkspaceId');

// --- Функции рендеринга ---
const renderCrmApp = (workspaceId?: string) => {
  // Мы больше не передаем 'mode', так как crm-app теперь всегда работает в контексте workspace
  appDiv.innerHTML = `<crm-app workspaceId="${workspaceId || ''}"></crm-app>`;
};
const renderWorkspaceSelector = () => {
  appDiv.innerHTML = `<workspace-selector></workspace-selector>`;
};
const renderAuthShell = () => {
  appDiv.innerHTML = '<auth-shell></auth-shell>';
};

/**
 * Главная функция, которая инициализирует приложение.
 */
const bootstrapApp = () => {
  appDiv.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;"><h2>Загрузка...</h2></div>`;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Пользователь аутентифицирован (включая анонимного)
      if (activeWorkspaceId) {
        // Если есть активный workspace, сразу заходим в него
        renderCrmApp(activeWorkspaceId);
      } else {
        // Иначе показываем экран выбора workspace
        renderWorkspaceSelector();
      }
    } else {
      // Пользователя нет, показываем экран входа/регистрации.
      // Анонимный вход теперь будет происходить только при первом заходе
      // или после выхода из аккаунта.
      renderAuthShell();
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

// Обработка полного выхода из аккаунта
auth.onIdTokenChanged(async (user) => {
    if (!user) {
        // Полная очистка состояния при выходе
        activeWorkspaceId = null;
        sessionStorage.removeItem('activeWorkspaceId');
        renderAuthShell();
    }
});

// Запускаем приложение
bootstrapApp();
