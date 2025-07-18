// src/workspace-selector.ts
import { LitElement, html, css } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase-init.js';
import type { Workspace } from './types.js';

import './modal-dialog.js';
import './workspace-form.js';

@customElement('workspace-selector')
export class WorkspaceSelector extends LitElement {
  @state()
  private _workspaces: Workspace[] = [];
  @state()
  private _isLoading = true;
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
    const q = query(collection(db, 'workspaces'), where('members', 'array-contains', user.uid));
    this._unsubscribeWorkspaces = onSnapshot(q, (snapshot) => {
      this._workspaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
      this._isLoading = false;
    }, (error) => {
      console.error("Ошибка при загрузке рабочих пространств:", error);
      this._isLoading = false;
    });
  }

  private _selectWorkspace(id: string) {
    // ИСПРАВЛЕНИЕ: Добавляем bubbles и composed, чтобы событие "вышло" из компонента
    this.dispatchEvent(new CustomEvent('select-workspace', {
      detail: { workspaceId: id },
      bubbles: true,
      composed: true
    }));
  }

  private _createWorkspace() {
    this._openWorkspaceModal();
  }

  private _openWorkspaceModal() {
    this._modalTitle = 'Создать новое пространство';
    this._modalContent = html`
      <workspace-form @save-workspace=${this._handleSaveWorkspace}></workspace-form>
    `;
  }

  private _closeModal() {
    this._modalContent = null;
    this._modalTitle = '';
  }

  private async _handleSaveWorkspace(e: CustomEvent) {
    const user = auth.currentUser;
    if (!user) return;

    // ИСПРАВЛЕНИЕ: Временно отписываемся от слушателя, чтобы избежать гонки состояний
    this._unsubscribeWorkspaces?.();
    this._unsubscribeWorkspaces = null;

    const { data } = e.detail;
    const newWorkspace = {
      name: data.name,
      description: data.description || '',
      ownerId: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'workspaces'), newWorkspace);
      console.log("Пространство создано с ID: ", docRef.id);
      
      // Сразу же переходим в новый проект
      this._selectWorkspace(docRef.id);

    } catch (error) {
      console.error("Ошибка при создании пространства: ", error);
      // Если произошла ошибка, подписываемся обратно
      this._listenForWorkspaces();
    }
    
    this._closeModal();
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
          <div class="add-card" @click=${this._createWorkspace}>
            <div class="icon"><i class="fas fa-plus-circle"></i></div>
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

declare global {
  interface HTMLElementTagNameMap {
    'workspace-selector': WorkspaceSelector;
  }
}