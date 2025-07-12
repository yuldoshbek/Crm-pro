// src/finance-form.ts
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('finance-form') // <-- ИСПРАВЛЕНО ЗДЕСЬ
export class FinanceForm extends LitElement {
  static styles = css`
    form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: var(--text-secondary); }
    input, select, textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 1rem; }
    .actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
    .save-btn { background-color: var(--accent-primary); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: bold; }
  `;

  private _handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    this.dispatchEvent(new CustomEvent('save-finance-operation', {
      detail: data,
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const today = new Date().toISOString().substring(0, 10);

    return html`
      <form @submit=${this._handleSubmit}>
        <div>
          <label for="title">Название операции</label>
          <input id="title" name="title" type="text" required>
        </div>

        <div class="form-row">
          <div>
            <label for="amount">Сумма</label>
            <input id="amount" name="amount" type="number" step="0.01" required>
          </div>
          <div>
            <label for="type">Тип</label>
            <select id="type" name="type">
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
          </div>
        </div>

        <div>
          <label for="date">Дата</label>
          <input id="date" name="date" type="date" .value=${today} required>
        </div>

        <div>
          <label for="comment">Комментарий</label>
          <textarea id="comment" name="comment" rows="3"></textarea>
        </div>

        <div class="actions">
          <button type="submit" class="save-btn">Сохранить</button>
        </div>
      </form>
    `;
  }
}