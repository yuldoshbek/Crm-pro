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
      gap: 1.25rem; /* Увеличиваем отступы */
    }
    label { 
      display: block; 
      font-size: 0.875rem; 
      font-weight: 500; 
      margin-bottom: 0.35rem; 
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
      /* Добавляем плавные переходы */
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    /* Добавляем подсветку при фокусе */
    input:focus, textarea:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--accent-primary-light);
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
      padding: 0.75rem 1.5rem; /* Увеличиваем padding */
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: 600; /* Делаем шрифт жирнее */
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }
    .save-btn:hover {
        filter: brightness(1.1);
        box-shadow: var(--shadow-md);
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
