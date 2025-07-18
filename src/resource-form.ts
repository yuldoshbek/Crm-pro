// src/resource-form.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Contact, Regulation } from './types.js';

type ResourceType = 'contact' | 'regulation';

@customElement('resource-form')
export class ResourceForm extends LitElement {
  @property({ type: String })
  type: ResourceType = 'contact';

  @property({ attribute: false })
  item?: Partial<Contact & Regulation>;

  static styles = css`
    form { 
      display: flex; 
      flex-direction: column; 
      gap: 1.25rem; 
    }
    label { 
      display: block; 
      font-size: 0.875rem; 
      font-weight: 500; 
      margin-bottom: 0.35rem; 
      color: var(--text-secondary); 
    }
    input, select, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-sizing: border-box;
      font-family: inherit;
      font-size: 1rem;
      background-color: var(--bg-main);
      color: var(--text-primary);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    input:focus, select:focus, textarea:focus {
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
      padding: 0.75rem 1.5rem; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: 600; 
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }
    .save-btn:hover {
        filter: brightness(1.1);
        box-shadow: var(--shadow-md);
    }
    .delete-btn {
        background: none;
        border: none;
        color: var(--accent-danger);
        cursor: pointer;
        font-weight: 500;
        margin-right: auto;
        padding: 0.5rem;
        border-radius: 6px;
    }
    .delete-btn:hover {
      background-color: #fee2e2;
    }
    .file-section {
        margin-top: 1rem;
        border-top: 1px solid var(--border-color);
        padding-top: 1.25rem;
    }
    .file-section h4 {
        margin: 0 0 1rem 0;
        font-weight: 600;
        font-size: 1rem;
    }
    .upload-placeholder {
        border: 2px dashed var(--border-color);
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary);
    }
  `;

  private _handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    this.dispatchEvent(new CustomEvent('save-resource', {
      detail: { data, type: this.type },
      bubbles: true,
      composed: true
    }));
  }

  private _handleDelete() {
    this.dispatchEvent(new CustomEvent('delete-resource', {
        detail: { itemId: this.item?.id, type: this.type },
        bubbles: true,
        composed: true
    }));
  }

  private _renderContactForm() {
    return html`
      <div>
        <label for="name">Имя</label>
        <input id="name" name="name" type="text" .value=${this.item?.name || ''} required>
      </div>
      <div>
        <label for="role">Должность</label>
        <input id="role" name="role" type="text" .value=${this.item?.role || ''}>
      </div>
      <div>
        <label for="company">Компания</label>
        <input id="company" name="company" type="text" .value=${this.item?.company || ''}>
      </div>
      <div>
        <label for="phone">Телефон</label>
        <input id="phone" name="phone" type="tel" .value=${this.item?.phone || ''}>
      </div>
      <div>
        <label for="email">Email</label>
        <input id="email" name="email" type="email" .value=${this.item?.email || ''}>
      </div>
      <div>
        <label for="notes">Заметки</label>
        <textarea id="notes" name="notes" rows="4" .value=${this.item?.notes || ''}></textarea>
      </div>
    `;
  }

  private _renderRegulationForm() {
    return html`
      <div>
        <label for="title">Название регламента</label>
        <input id="title" name="title" type="text" .value=${this.item?.title || ''} required>
      </div>
      <div>
        <label for="category">Категория</label>
        <input id="category" name="category" type="text" .value=${this.item?.category || ''}>
      </div>
      <div>
        <label for="description">Описание</label>
        <textarea id="description" name="description" rows="4" .value=${this.item?.description || ''}></textarea>
      </div>
      <div class="file-section">
        <h4>Файлы</h4>
        <div class="upload-placeholder">
          <p>Функционал загрузки файлов будет добавлен на следующем этапе.</p>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <input type="hidden" name="id" .value=${this.item?.id || ''}>
        
        ${this.type === 'contact' ? this._renderContactForm() : this._renderRegulationForm()}

        <div class="actions">
          ${this.item?.id ? html`<button type="button" class="delete-btn" @click=${this._handleDelete}>Удалить</button>` : ''}
          <button type="submit" class="save-btn">Сохранить</button>
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'resource-form': ResourceForm;
  }
}
