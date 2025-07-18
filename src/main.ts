// src/main.ts
import './style.css';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, db } from './firebase-init.js';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

// Импортируем все наши корневые компоненты
import './crm-app.js';
import './auth-shell.js';
import './workspace-selector.js';
import './mode-selector.js'; // <-- НОВЫЙ ИМПОРТ

const appDiv = document.querySelector<HTMLDivElement>('#app')!;

// --- Глобальное состояние ---
let activeMode: 'assistant' | 'projects' | null = sessionStorage.getItem('activeMode') as any;
let activeWorkspaceId: string | null = sessionStorage.getItem('activeWorkspaceId');

// --- Функции рендеринга ---
const renderCrmApp = (mode: 'assistant' | 'projects', workspaceId?: string) => {
  // Передаем в crm-app и режим, и ID проекта (если он есть)
  appDiv.innerHTML = `<crm-app mode="${mode}" workspaceId="${workspaceId || ''}"></crm-app>`;
};
const renderWorkspaceSelector = () => {
  appDiv.innerHTML = `<workspace-selector></workspace-selector>`;
};
const renderModeSelector = () => {
  appDiv.innerHTML = `<mode-selector></mode-selector>`;
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
      // Пользователь есть. Теперь решаем, что ему показать.
      if (activeMode === 'assistant') {
        renderCrmApp('assistant');
      } else if (activeMode === 'projects') {
        if (activeWorkspaceId) {
          renderCrmApp('projects', activeWorkspaceId);
        } else {
          renderWorkspaceSelector();
        }
      } else {
        // Если режим еще не выбран, показываем переключатель
        renderModeSelector();
      }
    } else {
      // Пользователя нет.
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Ошибка анонимного входа:", error);
        renderAuthShell();
      }
    }
  });
};

// --- Глобальные обработчики событий ---

// НОВЫЙ обработчик для выбора режима
appDiv.addEventListener('select-mode', (e: Event) => {
  const { mode } = (e as CustomEvent).detail;
  activeMode = mode;
  sessionStorage.setItem('activeMode', mode);

  if (mode === 'assistant') {
    renderCrmApp('assistant');
  } else if (mode === 'projects') {
    renderWorkspaceSelector();
  }
});

appDiv.addEventListener('select-workspace', (e: Event) => {
  const { workspaceId } = (e as CustomEvent).detail;
  if (workspaceId) {
    activeWorkspaceId = workspaceId;
    sessionStorage.setItem('activeWorkspaceId', workspaceId);
    renderCrmApp('projects', workspaceId);
  }
});

// ОБНОВЛЕНО: Выход из проекта теперь возвращает к выбору режима
appDiv.addEventListener('exit-workspace', () => {
  activeWorkspaceId = null;
  activeMode = null;
  sessionStorage.removeItem('activeWorkspaceId');
  sessionStorage.removeItem('activeMode');
  renderModeSelector();
});

auth.onIdTokenChanged(async (user) => {
    if (!user) {
        // Полная очистка состояния при выходе
        activeWorkspaceId = null;
        activeMode = null;
        sessionStorage.removeItem('activeWorkspaceId');
        sessionStorage.removeItem('activeMode');
        renderAuthShell();
    }
});

// Запускаем приложение
bootstrapApp();
