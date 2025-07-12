// src/finance-dashboard.ts
import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase-init';

export interface FinanceOperation {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  comment?: string;
}

@customElement('finance-dashboard')
export class FinanceDashboard extends LitElement {
  @property({ type: String })
  collectionPath = '';

  @state()
  private _operations: FinanceOperation[] = [];
  @state()
  private _filterType: 'all' | 'income' | 'expense' = 'all';
  @state()
  private _filterStartDate = '';
  @state()
  private _filterEndDate = '';

  private _unsubscribe: (() => void) | null = null;

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribe?.();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('collectionPath') && this.collectionPath) {
      this._listenForFinances();
    }
  }

  private _listenForFinances() {
    this._unsubscribe?.();
    const financesRef = collection(db, this.collectionPath);
    const q = query(financesRef, orderBy('date', 'desc'));
    this._unsubscribe = onSnapshot(q, (snapshot) => {
      this._operations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinanceOperation));
    });
  }

  private get _filteredOperations() {
    const filtered = this._operations.filter(op => {
      const typeMatch = this._filterType === 'all' || op.type === this._filterType;
      const startDateMatch = !this._filterStartDate || op.date >= this._filterStartDate;
      const endDateMatch = !this._filterEndDate || op.date <= this._filterEndDate;
      return typeMatch && startDateMatch && endDateMatch;
    });
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static styles = css`
    :host { 
      display: block; 
      font-family: var(--font-main);
    }
    
    .finance-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .summary-card {
      background-color: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
      text-align: left;
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

    .controls-panel {
      margin-bottom: 1.5rem;
      padding: 1rem 1.5rem;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: var(--shadow-md);
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
      background-color: #f9fafb;
      font-family: inherit;
    }
    
    .table-container {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: var(--shadow-md);
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
      background-color: #f9fafb;
      color: var(--text-secondary);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td {
      font-weight: 500;
    }
    tr:last-child td { 
      border-bottom: none; 
    }
    td.amount.income { font-weight: 700; }
    td.amount.expense { font-weight: 700; }
  `;

  render() {
    const operationsToDisplay = this._filteredOperations;
    const totalIncome = operationsToDisplay.filter(op => op.type === 'income').reduce((sum, op) => sum + op.amount, 0);
    const totalExpense = operationsToDisplay.filter(op => op.type === 'expense').reduce((sum, op) => sum + op.amount, 0);
    const balance = totalIncome - totalExpense;
    const currencyFormat = (value: number) => value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 });

    return html`
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

      <div class="finance-grid">
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
            </tr>
          </thead>
          <tbody>
            ${operationsToDisplay.map(op => html`
              <tr>
                <td>${op.title}</td>
                <td class="amount ${op.type}">${currencyFormat(op.amount)}</td>
                <td>${op.type === 'income' ? 'Доход' : 'Расход'}</td>
                <td>${new Date(op.date).toLocaleDateString('ru-RU')}</td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }
}