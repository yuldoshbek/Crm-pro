// src/finance-form.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { FinanceOperation } from './types.js';

@customElement('finance-form')
export class FinanceForm extends LitElement {
  @property({ attribute: false })
  operation?: FinanceOperation;

  // --- ОБНОВЛЕННЫЕ СТИЛИ ---
  static styles = css`
    form { 
      display: flex; 
      flex-direction: column; 
      gap: 1.25rem; 
    }
    .form-row { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
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
  `;

  private _handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const processedData = {
      ...data,
      amount: parseFloat(data.amount as string)
    };

    this.dispatchEvent(new CustomEvent('save-finance-operation', {
      detail: { data: processedData },
      bubbles: true,
      composed: true
    }));
  }

  private _handleDelete() {
    this.dispatchEvent(new CustomEvent('delete-finance-operation', {
        detail: { operationId: this.operation?.id },
        bubbles: true,
        composed: true
    }));
  }

  render() {
    const today = new Date().toISOString().substring(0, 10);

    return html`
      <form @submit=${this._handleSubmit}>
        <input type="hidden" name="id" .value=${this.operation?.id || ''}>

        <div>
          <label for="title">Название операции</label>
          <input id="title" name="title" type="text" .value=${this.operation?.title || ''} required>
        </div>

        <div class="form-row">
          <div>
            <label for="amount">Сумма</label>
            <input id="amount" name="amount" type="number" step="0.01" .value=${this.operation?.amount?.toString() || ''} required>
          </div>
          <div>
            <label for="type">Тип</label>
            <select id="type" name="type" .value=${this.operation?.type || 'expense'}>
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
          </div>
        </div>

        <div class="form-row">
            <div>
                <label for="date">Дата</label>
                <input id="date" name="date" type="date" .value=${this.operation?.date || today} required>
            </div>
            <div>
                <label for="category">Категория</label>
                <input id="category" name="category" type="text" .value=${this.operation?.category || ''} placeholder="Например, 'Офис' или 'Транспорт'">
            </div>
        </div>

        <div>
          <label for="comment">Комментарий</label>
          <textarea id="comment" name="comment" rows="3" .value=${this.operation?.comment || ''}></textarea>
        </div>

        <div class="actions">
          ${this.operation?.id ? html`<button type="button" class="delete-btn" @click=${this._handleDelete}>Удалить</button>` : ''}
          <button type="submit" class="save-btn">Сохранить</button>
        </div>
      </form>
    `;
  }
}
