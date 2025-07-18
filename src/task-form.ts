// src/task-form.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Task, ChecklistItem } from './types.js';
import { nanoid } from 'nanoid';

@customElement('task-form')
export class TaskForm extends LitElement {
  @property({ attribute: false })
  task?: Task;

  @state()
  private _checklistItems: ChecklistItem[] = [];

  willUpdate(changedProperties: Map<string | symbol, unknown>) {
    if (changedProperties.has('task')) {
      // Создаем глубокую копию, чтобы избежать мутации оригинального объекта
      this._checklistItems = this.task?.checklist?.map(item => ({...item})) || [];
    }
  }

  static styles = css`
    form { 
      display: flex; 
      flex-direction: column; 
      gap: 1.25rem; /* Немного увеличим отступы */
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

    .section { 
      margin-top: 1rem; 
      border-top: 1px solid var(--border-color); 
      padding-top: 1.25rem; 
    }
    .section-header { 
      font-weight: 600; 
      margin-bottom: 1rem; 
      font-size: 1rem;
    }
    
    .checklist-item { 
      display: flex; 
      align-items: center; 
      gap: 0.75rem; 
      padding: 0.5rem;
      border-radius: 6px;
      transition: background-color 0.2s ease;
    }
    .checklist-item:hover {
      background-color: var(--bg-hover);
    }
    .checklist-item input[type="checkbox"] { 
      width: 1rem; 
      height: 1rem;
      flex-shrink: 0; 
    }
    .checklist-item .checklist-text { 
      flex-grow: 1; 
      margin-bottom: 0; 
      font-weight: 400; 
      color: var(--text-primary);
    }
    .checklist-item .completed { 
      text-decoration: line-through; 
      color: var(--text-secondary); 
    }
    .item-delete-btn { 
      background: none; 
      border: none; 
      color: var(--text-secondary); 
      cursor: pointer; 
      font-size: 1.25rem; 
      padding: 0 0.5rem; 
      margin-left: auto; 
      border-radius: 50%;
      opacity: 0.5;
      transition: all 0.2s ease;
    }
    .checklist-item:hover .item-delete-btn {
      opacity: 1;
    }
    .item-delete-btn:hover {
      color: var(--accent-danger);
      background-color: var(--bg-card);
    }
    
    .add-item { 
      display: flex; 
      gap: 0.5rem; 
      margin-top: 1rem; 
    }
    .add-item input { flex-grow: 1; }
    .add-btn { 
      background-color: var(--bg-hover); 
      border: 1px solid var(--border-color);
      padding: 0.6rem 1rem; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: bold; 
      color: var(--text-secondary);
    }
    .add-btn:hover { 
      background-color: var(--border-color);
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
    const eventData = { ...data, checklist: this._checklistItems };
    
    this.dispatchEvent(new CustomEvent('save-task', { detail: { data: eventData }, bubbles: true, composed: true }));
  }

  private _handleDelete() {
    this.dispatchEvent(new CustomEvent('delete-task', { detail: { taskId: this.task?.id }, bubbles: true, composed: true }));
  }

  private _addChecklistItem() {
    const input = this.shadowRoot?.getElementById('checklist-input') as HTMLInputElement;
    if (input && input.value.trim()) {
      this._checklistItems = [...this._checklistItems, { id: nanoid(10), text: input.value.trim(), completed: false }];
      input.value = '';
    }
  }

  private _toggleChecklistItem(item: ChecklistItem, completed: boolean) {
    const foundItem = this._checklistItems.find(i => i.id === item.id);
    if (foundItem) {
      foundItem.completed = completed;
      this.requestUpdate('_checklistItems');
    }
  }

  private _deleteChecklistItem(itemId: string) {
    this._checklistItems = this._checklistItems.filter(item => item.id !== itemId);
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <input type="hidden" name="id" .value=${this.task?.id || ''}>
        
        <div><label for="title">Название задачи</label><input id="title" name="title" type="text" .value=${this.task?.title || ''} required></div>
        <div><label for="description">Описание</label><textarea id="description" name="description" rows="3" .value=${this.task?.description || ''}></textarea></div>
        
        <div class="form-row">
          <div><label for="status">Статус</label><select id="status" name="status" .value=${this.task?.status || 'todo'}><option value="todo">К выполнению</option><option value="inprogress">В работе</option><option value="review">На проверке</option><option value="done">Готово</option></select></div>
          <div><label for="priority">Приоритет</label><select id="priority" name="priority" .value=${this.task?.priority || 'medium'}><option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option></select></div>
        </div>
        
        <div><label for="dueDate">Срок выполнения</label><input id="dueDate" name="dueDate" type="date" .value=${this.task?.dueDate || ''}></div>
        
        <div class="section">
          <div class="section-header">Чек-лист</div>
          ${this._checklistItems.map(item => html`
            <div class="checklist-item">
              <input type="checkbox" .checked=${item.completed} @change=${(e: Event) => this._toggleChecklistItem(item, (e.target as HTMLInputElement).checked)}>
              <label class="checklist-text ${item.completed ? 'completed' : ''}">${item.text}</label>
              <button type="button" class="item-delete-btn" @click=${() => this._deleteChecklistItem(item.id)} title="Удалить пункт">&times;</button>
            </div>
          `)}
          <div class="add-item">
            <input id="checklist-input" type="text" placeholder="Добавить подзадачу..." @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); this._addChecklistItem(); }}}>
            <button type="button" class="add-btn" @click=${this._addChecklistItem}>+</button>
          </div>
        </div>

        <div class="actions">
          ${this.task?.id ? html`<button type="button" class="delete-btn" @click=${this._handleDelete}>Удалить</button>` : ''}
          <button type="submit" class="save-btn">Сохранить</button>
        </div>
      </form>
    `;
  }
}
