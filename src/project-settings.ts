// src/project-settings.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Workspace } from './types.js';

@customElement('project-settings')
export class ProjectSettings extends LitElement {
  @property({ attribute: false })
  workspace?: Workspace;

  // Новые состояния для управления ссылкой-приглашением
  @state()
  private _inviteLink = '';
  @state()
  private _linkCopied = false;

  static styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 2rem 0;
      color: var(--text-primary);
    }
    .settings-section {
      background-color: var(--bg-card);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      margin-bottom: 2rem;
    }
    .section-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    .section-header h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }
    .section-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .section-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color);
      background-color: var(--bg-main);
      display: flex;
      justify-content: flex-end;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }
    label { 
      display: block; 
      font-size: 0.875rem; 
      font-weight: 500; 
      margin-bottom: 0.25rem; 
      color: var(--text-secondary); 
    }
    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-sizing: border-box;
      font-family: inherit;
      font-size: 1rem;
      background-color: var(--bg-main);
      color: var(--text-primary);
    }
    .btn {
      border: none;
      padding: 0.6rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
    }
    .btn:hover {
      filter: brightness(1.1);
    }
    .btn-primary {
      background-color: var(--accent-primary);
      color: white;
    }
    .btn-danger {
      background-color: var(--accent-danger);
      color: white;
    }
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
    }
    .setting-item:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
    }
    .setting-item p {
        margin: 0.25rem 0 0 0;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    /* Стили для новой секции приглашений */
    .invite-link-area {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-top: 1rem;
    }
    .invite-link-area input {
        flex-grow: 1;
        background-color: var(--bg-main);
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
    }
  `;

  private _generateInviteLink() {
    if (!this.workspace) return;
    // Генерируем ссылку для приглашения
    const link = `${window.location.origin}/invite/${this.workspace.id}`;
    this._inviteLink = link;
  }

  private _copyInviteLink() {
    if (!this._inviteLink) return;
    const input = this.shadowRoot?.querySelector('#invite-link-input') as HTMLInputElement;
    input.select();
    // Используем document.execCommand для совместимости
    try {
      document.execCommand('copy');
      this._linkCopied = true;
      setTimeout(() => { this._linkCopied = false; }, 2000); // Сбрасываем состояние через 2 секунды
    } catch (err) {
      console.error('Не удалось скопировать ссылку: ', err);
    }
  }

  private _handleSave(e: Event) {
    e.preventDefault();
    const form = this.shadowRoot?.querySelector('form');
    if (!form) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    this.dispatchEvent(new CustomEvent('save-settings', { detail: { data }, bubbles: true, composed: true }));
  }

  private _handleDelete() {
    if (confirm(`ВНИМАНИЕ! Это действие необратимо. Вы уверены, что хотите удалить проект "${this.workspace?.name}"? Все связанные с ним данные будут удалены навсегда.`)) {
      this.dispatchEvent(new CustomEvent('delete-workspace', { bubbles: true, composed: true }));
    }
  }

  render() {
    if (!this.workspace) {
      return html`<p>Загрузка настроек...</p>`;
    }

    return html`
      <div class="page-header">
        <h1>Настройки проекта: ${this.workspace.name}</h1>
      </div>

      <!-- General Settings (без изменений) -->
      <form @submit=${this._handleSave}>
        <div class="settings-section">
          <div class="section-header"><h3>Основные настройки</h3></div>
          <div class="section-body">
            <div>
              <label for="name">Название проекта</label>
              <input id="name" name="name" type="text" .value=${this.workspace.name} required>
            </div>
            <div>
              <label for="description">Описание</label>
              <textarea id="description" name="description" rows="4" .value=${this.workspace.description || ''}></textarea>
            </div>
          </div>
          <div class="section-footer">
            <button type="submit" class="btn btn-primary">Сохранить изменения</button>
          </div>
        </div>
      </form>

      <!-- НОВАЯ СЕКЦИЯ: Управление участниками -->
      <div class="settings-section">
        <div class="section-header"><h3>Управление участниками</h3></div>
        <div class="section-body">
          <div class="setting-item">
            <div>
              <strong>Пригласить в проект</strong>
              <p>Отправьте эту ссылку, чтобы пригласить нового участника.</p>
            </div>
            <button type="button" class="btn" @click=${this._generateInviteLink} ?disabled=${this._inviteLink}>Сгенерировать ссылку</button>
          </div>
          ${this._inviteLink ? html`
            <div class="invite-link-area">
              <input id="invite-link-input" type="text" readonly .value=${this._inviteLink}>
              <button class="btn btn-primary" @click=${this._copyInviteLink}>
                ${this._linkCopied ? 'Скопировано!' : 'Копировать'}
              </button>
            </div>
          ` : ''}
          <!-- Здесь в будущем будет список участников -->
        </div>
      </div>

      <!-- Danger Zone (без изменений) -->
      <div class="settings-section danger-zone">
        <div class="section-header"><h3>Опасная зона</h3></div>
        <div class="section-body">
          <div class="setting-item">
            <div>
              <strong>Удалить проект</strong>
              <p>Это действие нельзя будет отменить.</p>
            </div>
            <button type="button" class="btn btn-danger" @click=${this._handleDelete}>Удалить</button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'project-settings': ProjectSettings;
  }
}
