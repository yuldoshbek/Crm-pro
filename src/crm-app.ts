import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { auth } from './firebase-init';
import { signOut } from 'firebase/auth';
import { choose } from 'lit/directives/choose.js';

// Импортируем наш новый компонент для доски задач, который мы создадим дальше
import './task-board';

@customElement('crm-app')
export class CrmApp extends LitElement {
  // Состояние нашего приложения: текущий режим и активная вкладка
  @state()
  private _mode: 'assistant' | 'project' = 'assistant';
  @state()
  private _activeTab: 'tasks' | 'finances' | 'calendar' = 'tasks';

  static styles = css`
    /* ... (вставьте сюда стили из компонента crm-app прошлой версии) ... */
  `;

  render() {
    return html`
      <div class="app-shell">
        <header>
            <h1>${this._mode === 'assistant' ? 'Дашборд Ассистента' : 'Управление Проектами'}</h1>
            <div class="user-info">
              <div>${auth.currentUser?.email}</div>
              <button @click=${() => signOut(auth)}>Выйти</button>
            </div>
        </header>
        <nav>
            <button @click=${() => this._activeTab = 'tasks'} class=${this._activeTab === 'tasks' ? 'active' : ''}>Задачи</button>
            <button @click=${() => this._activeTab = 'finances'} class=${this._activeTab === 'finances' ? 'active' : ''}>Финансы</button>
            <button @click=${() => this._activeTab = 'calendar'} class=${this._activeTab === 'calendar' ? 'active' : ''}>Календарь</button>
        </nav>
        <main>
          ${choose(this._activeTab, [
            ['tasks', () => html`<task-board></task-board>`],
            ['finances', () => html`<p>Здесь будут финансы...</p>`],
            ['calendar', () => html`<p>Здесь будет календарь...</p>`],
          ],
          () => html`<p>Выберите вкладку</p>`)}
        </main>
      </div>
    `;
  }
}