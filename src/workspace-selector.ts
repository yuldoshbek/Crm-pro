// src/workspace-selector.ts
import { LitElement, html, css } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { auth } from './firebase-init.js';
import type { Workspace } from './types.js';

// --- НОВЫЙ ИМПОРТ: Используем функции из нашего сервисного слоя ---
import { listenToWorkspaces, createWorkspace } from './firebase-service.js';

import './modal-dialog.js';
import './workspace-form.js';

@customElement('workspace-selector')
export class WorkspaceSelector extends LitElement {
  @state()
  private _workspaces: Workspace[] = [];
  @state()
  private _isLoading = true;
  @state()
  private _isCreating = false; // Новое состояние для отслеживания процесса создания
  @state()
  private _modalContent: TemplateResult | null = null;
  @state()
  private _modalTitle = '';

  private _unsubscribeWorkspaces: (() => void) | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 100vh;
      background-color: var(--bg-main);
      padding: 2rem;
      box-sizing: border-box;
    }
    .selector-panel {
      width: 100%;
      max-width: 900px;
      text-align: center;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin-bottom: 3rem;
    }
    .workspace-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .workspace-card, .add-card {
      background-color: var(--bg-card);
      border-radius: 12px;
      padding: 2rem 1.5rem;
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .workspace-card:hover, .add-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md);
      border-color: var(--accent-primary);
    }
    .workspace-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    .workspace-description {
      font-size: 0.9rem;
      color: var(--text-secondary);
      flex-grow: 1;
    }
    .add-card .icon {
      font-size: 3rem;
      color: var(--accent-primary);
      margin-bottom: 1rem;
    }
    .add-card .text {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--accent-primary);
    }
    /* Стили для кнопки в форме */
    .save-btn {
      background-color: var(--accent-primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }
    .save-btn:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._listenForWorkspaces();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribeWorkspaces?.();
  }

  private _listenForWorkspaces() {
    const user = auth.currentUser;
    if (!user) {
      this._isLoading = false;
      return;
    }
    // --- ИСПОЛЬЗУЕМ СЕРВИС ---
    this._unsubscribeWorkspaces = listenToWorkspaces(user.uid, (workspaces) => {
      this._workspaces = workspaces;
      this._isLoading = false;
    });
  }

  private _selectWorkspace(id: string) {
    this.dispatchEvent(new CustomEvent('select-workspace', {
      detail: { workspaceId: id },
      bubbles: true,
      composed: true
    }));
  }

  private _openWorkspaceModal() {
    this._modalTitle = 'Создать новое пространство';
    this._modalContent = html`
      <workspace-form @save-workspace=${this._handleSaveWorkspace}></workspace-form>
      <!-- Перемещаем кнопку внутрь модального окна для управления состоянием -->
      <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
          <button 
            class="save-btn" 
            @click=${() => this.shadowRoot?.querySelector('workspace-form')?.shadowRoot?.querySelector('form')?.requestSubmit()}
            ?disabled=${this._isCreating}
          >
            ${this._isCreating ? 'Создание...' : 'Сохранить'}
          </button>
      </div>
    `;
  }

  private _closeModal() {
    this._modalContent = null;
    this._modalTitle = '';
    this._isCreating = false; // Сбрасываем состояние при закрытии
  }

  // --- ЛОГИКА СОЗДАНИЯ УПРОЩЕНА И УЛУЧШЕНА ---
  private async _handleSaveWorkspace(e: CustomEvent) {
    const user = auth.currentUser;
    if (!user || this._isCreating) return;

    this._isCreating = true;
    const { data } = e.detail;

    try {
      // Вызываем функцию из сервисного слоя
      const newWorkspaceId = await createWorkspace(data, user.uid);
      
      if (newWorkspaceId) {
        console.log("Пространство создано с ID: ", newWorkspaceId);
        // Сразу же переходим в новый проект
        this._selectWorkspace(newWorkspaceId);
      } else {
        // Обработка случая, если сервис вернул ошибку
        console.error("Не удалось создать пространство.");
        this._isCreating = false;
      }
    } catch (error) {
      console.error("Ошибка при создании пространства: ", error);
      this._isCreating = false;
    }
    
    // Модальное окно закроется автоматически при переходе в crm-app
  }

  render() {
    if (this._isLoading) {
      return html`<h1>Загрузка пространств...</h1>`;
    }

    return html`
      <div class="selector-panel">
        <h1>Рабочие пространства</h1>
        <p>Выберите проект для продолжения или создайте новый.</p>
        <div class="workspace-grid">
          ${this._workspaces.map(ws => html`
            <div class="workspace-card" @click=${() => this._selectWorkspace(ws.id)}>
              <div class="workspace-name">${ws.name}</div>
              <div class="workspace-description">${ws.description || 'Нет описания'}</div>
            </div>
          `)}
          <div class="add-card" @click=${this._openWorkspaceModal}>
            <div class.icon><i class="fas fa-plus-circle"></i></div>
            <div class="text">Создать пространство</div>
          </div>
        </div>
      </div>
      ${this._modalContent ? html`
        <modal-dialog @close=${this._closeModal}>
          <h2 slot="title">${this._modalTitle}</h2>
          ${this._modalContent}
        </modal-dialog>
      ` : ''}
    `;
  }
}
