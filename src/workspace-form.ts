// src/workspace-form.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Workspace } from './types.js';

@customElement('workspace-form')
export class WorkspaceForm extends LitElement {
  // Сюда будет передаваться существующее пространство для редактирования
  @property({ attribute: false })
  workspace?: Workspace;

  static styles = css`
    form { 
      display: flex; 
      flex-direction: column; 
      gap: 1rem; 
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
    .actions { 
      display: flex; 
      justify-content: flex-end; 
      align-items: center;
      gap: 1rem; 
      margin-top: 1.5rem; 
    }
    .save-btn { 
      background-color: var(--accent-primary); 
      color: white; 
      border: none; 
      padding: 0.6rem 1.5rem; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: bold; 
    }
    .save-btn:hover {
        filter: brightness(1.1);
    }
  `;

  private _handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    this.dispatchEvent(new CustomEvent('save-workspace', {
      detail: { data },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <input type="hidden" name="id" .value=${this.workspace?.id || ''}>

        <div>
          <label for="name">Название проекта</label>
          <input id="name" name="name" type="text" .value=${this.workspace?.name || ''} required placeholder="Например, 'Запуск нового продукта'">
        </div>
        
        <div>
          <label for="description">Краткое описание</label>
          <textarea id="description" name="description" rows="3" .value=${this.workspace?.description || ''} placeholder="Цели, ключевые участники, основная информация"></textarea>
        </div>

        <div class="actions">
          <button type="submit" class="save-btn">Сохранить</button>
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'workspace-form': WorkspaceForm;
  }
}
