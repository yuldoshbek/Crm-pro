// src/finance-dashboard.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { FinanceOperation } from './types.js';

@customElement('finance-dashboard')
export class FinanceDashboard extends LitElement {
  @property({ attribute: false })
  operations: FinanceOperation[] = [];

  // --- НОВЫЕ состояния для хранения значений фильтров ---
  @state() private _filterType: 'all' | 'income' | 'expense' = 'all';
  @state() private _filterStartDate = '';
  @state() private _filterEndDate = '';

  static styles = css`
    :host {
      display: block;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);
    }
    .add-btn {
      background-color: var(--accent-primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background-color 0.2s ease;
    }
    .add-btn:hover {
      filter: brightness(1.1);
    }

    /* --- НОВЫЕ СТИЛИ для панели фильтров --- */
    .controls-panel {
      margin-bottom: 2rem;
      padding: 1rem 1.5rem;
      background-color: var(--bg-card);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
    }
    .filters { 
      display: flex; 
      align-items: center; 
      gap: 1.5rem; 
      flex-wrap: wrap; 
    }
    .filter-group { 
      display: flex; 
      align-items: center; 
      gap: 0.5rem; 
    }
    .filters label { 
      font-weight: 500; 
      color: var(--text-secondary); 
      font-size: 0.9rem;
    }
    .filters select, .filters input { 
      padding: 0.5rem 0.75rem; 
      border-radius: 8px; 
      border: 1px solid var(--border-color); 
      background-color: var(--bg-main);
      color: var(--text-primary);
      font-family: inherit;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      background-color: var(--bg-card);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }
    .summary-label {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    .summary-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .income { color: #10b981; }
    .expense { color: #ef4444; }
    .balance { color: var(--text-primary); }

    .table-container {
      background-color: var(--bg-card);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
    }
    th, td { 
      padding: 1.25rem; 
      text-align: left; 
      border-bottom: 1px solid var(--border-color); 
    }
    th { 
      background-color: var(--bg-main);
      color: var(--text-secondary);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    tbody tr {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    tbody tr:hover {
      background-color: var(--bg-hover);
    }
    tr:last-child td { 
      border-bottom: none; 
    }
    td.amount.income { font-weight: 600; }
    td.amount.expense { font-weight: 600; }
  `;

  private _handleAddNew() {
    this.dispatchEvent(new CustomEvent('add-finance-operation', { bubbles: true, composed: true }));
  }

  private _handleEdit(op: FinanceOperation) {
    this.dispatchEvent(new CustomEvent('edit-finance-operation', { detail: { operation: op }, bubbles: true, composed: true }));
  }

  // --- НОВЫЙ getter для получения отфильтрованных операций ---
  private get _filteredOperations() {
    return this.operations.filter(op => {
      const typeMatch = this._filterType === 'all' || op.type === this._filterType;
      const startDateMatch = !this._filterStartDate || op.date >= this._filterStartDate;
      const endDateMatch = !this._filterEndDate || op.date <= this._filterEndDate;
      return typeMatch && startDateMatch && endDateMatch;
    });
  }

  render() {
    // ОБНОВЛЕНО: Используем отфильтрованные данные
    const operationsToDisplay = this._filteredOperations;
    
    const totalIncome = operationsToDisplay.filter(op => op.type === 'income').reduce((sum, op) => sum + op.amount, 0);
    const totalExpense = operationsToDisplay.filter(op => op.type === 'expense').reduce((sum, op) => sum + op.amount, 0);
    const balance = totalIncome - totalExpense;
    
    const currencyFormat = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value);

    return html`
      <div class="page-header">
        <h1>Финансы</h1>
        <button class="add-btn" @click=${this._handleAddNew}>
          <i class="fas fa-plus"></i> Новая операция
        </button>
      </div>

      <!-- НОВАЯ ПАНЕЛЬ ФИЛЬТРОВ -->
      <div class="controls-panel">
        <div class="filters">
          <div class="filter-group">
            <label for="type-filter">Показать</label>
            <select id="type-filter" .value=${this._filterType} @change=${(e: Event) => this._filterType = (e.target as HTMLSelectElement).value as any}>
              <option value="all">Все операции</option>
              <option value="income">Доходы</option>
              <option value="expense">Расходы</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="start-date">От</label>
            <input type="date" id="start-date" .value=${this._filterStartDate} @change=${(e: Event) => this._filterStartDate = (e.target as HTMLInputElement).value}>
          </div>
          <div class="filter-group">
            <label for="end-date">До</label>
            <input type="date" id="end-date" .value=${this._filterEndDate} @change=${(e: Event) => this._filterEndDate = (e.target as HTMLInputElement).value}>
          </div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Доход</div>
          <div class="summary-value income">${currencyFormat(totalIncome)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Расход</div>
          <div class="summary-value expense">${currencyFormat(totalExpense)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Итоговый баланс</div>
          <div class="summary-value balance">${currencyFormat(balance)}</div>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Сумма</th>
              <th>Тип</th>
              <th>Дата</th>
              <th>Категория</th>
            </tr>
          </thead>
          <tbody>
            <!-- ОБНОВЛЕНО: Отображаем отфильтрованные данные -->
            ${operationsToDisplay.map(op => html`
              <tr @click=${() => this._handleEdit(op)}>
                <td>${op.title}</td>
                <td class="amount ${op.type}">${currencyFormat(op.amount)}</td>
                <td>${op.type === 'income' ? 'Доход' : 'Расход'}</td>
                <td>${new Date(op.date).toLocaleDateString('ru-RU')}</td>
                <td>${op.category || '–'}</td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'finance-dashboard': FinanceDashboard;
  }
}
