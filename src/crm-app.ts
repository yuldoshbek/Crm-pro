// src/crm-app.ts
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { auth } from './firebase-init';
import { signOut } from 'firebase/auth';

// Пока импортируем только базовые компоненты, которые точно работают
import './modal-dialog.js';

@customElement('crm-app')
export class CrmApp extends LitElement {
  @state() private _view: 'tasks' | 'analytics' | 'finances' | 'resources' = 'tasks';

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background-color: #f7f8fc;
    }
    .app-layout {
      display: flex;
      width: 100%;
      height: 100%;
    }
    
    .sidebar {
      width: 260px;
      flex-shrink: 0;
      background-color: #ffffff;
      border-right: 1px solid #e5e7eb;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }
    .main-content {
      flex-grow: 1;
      padding: 2rem 3rem;
      overflow-y: auto;
    }

    .logo-section {
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .logo-section h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .nav-menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .nav-menu li a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.8rem 1rem;
      margin-bottom: 0.5rem;
      border-radius: 8px;
      text-decoration: none;
      color: #6b7280;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .nav-menu li a:hover {
      background-color: #f0f3f8;
      color: #4f46e5;
    }
    .nav-menu li a.active {
      background-color: #4f46e5;
      color: white;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
    }
    .nav-menu li a i {
      width: 20px;
      text-align: center;
    }

    .user-profile {
      margin-top: auto;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #4f46e5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      text-transform: uppercase;
    }
    .user-email { font-weight: 500; color: #111827; }
    .logout-btn {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      font-size: 1.2rem;
    }
  `;

  private _renderView() {
    switch (this._view) {
      case 'tasks':
        return html`<h1>Раздел "Задачи"</h1>`;
      case 'analytics':
        return html`<h1>Раздел "Аналитика"</h1>`;
      case 'finances':
        return html`<h1>Раздел "Финансы"</h1>`;
      case 'resources':
        return html`<h1>Раздел "Ресурсы"</h1>`;
      default:
        return html`<h1>Выберите раздел</h1>`;
    }
  }

  render() {
    const user = auth.currentUser;
    const userEmail = user?.email || 'Аноним';
    
    return html`
      <div class="app-layout">
        <aside class="sidebar">
          <div class="logo-section">
            <h2>CRM Pro</h2>
          </div>
          <nav class="nav-menu">
            <ul>
              <li><a href="#" class="${this._view === 'tasks' ? 'active' : ''}" @click=${() => this._view = 'tasks'}><i class="fas fa-tasks"></i> Задачи</a></li>
              <li><a href="#" class="${this._view === 'analytics' ? 'active' : ''}" @click=${() => this._view = 'analytics'}><i class="fas fa-chart-pie"></i> Аналитика</a></li>
              <li><a href="#" class="${this._view === 'finances' ? 'active' : ''}" @click=${() => this._view = 'finances'}><i class="fas fa-wallet"></i> Финансы</a></li>
              <li><a href="#" class="${this._view === 'resources' ? 'active' : ''}" @click=${() => this._view = 'resources'}><i class="fas fa-book"></i> Ресурсы</a></li>
            </ul>
          </nav>
          <div class="user-profile">
            <div class="user-avatar">${userEmail[0]}</div>
            <div class="user-email">${userEmail}</div>
            <button class="logout-btn" @click=${() => signOut(auth)} title="Выйти"><i class="fas fa-sign-out-alt"></i></button>
          </div>
        </aside>

        <main class="main-content">
          ${this._renderView()}
        </main>
      </div>
    `;
  }
}