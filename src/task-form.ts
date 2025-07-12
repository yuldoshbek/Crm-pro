import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Task } from './task-board';
import { nanoid } from 'nanoid';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}
export interface AttachedFile {
  id: string;
  name: string;
  url: string;
  path: string;
}

export interface TaskWithDetails extends Task {
  checklist?: ChecklistItem[];
  files?: AttachedFile[];
}

@customElement('task-form')
export class TaskForm extends LitElement {
  @property({ attribute: false })
  task?: TaskWithDetails;

  @state()
  private _checklistItems: ChecklistItem[] = [];

  willUpdate(changedProperties: Map<string | symbol, unknown>) {
    if (changedProperties.has('task')) {
      this._checklistItems = this.task?.checklist?.map(item => ({...item})) || [];
    }
  }

  static styles = css`
    form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: var(--text-secondary); }
    input, select, textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 1rem; }
    .section { margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; }
    .section-header { font-weight: 600; margin-bottom: 0.5rem; }
    
    .checklist-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .checklist-item input[type="checkbox"] { width: auto; flex-shrink: 0; }
    .checklist-item .checklist-text { flex-grow: 1; margin-bottom: 0; font-weight: normal; }
    .checklist-item .completed { text-decoration: line-through; color: var(--text-secondary); }
    .item-delete-btn { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1.25rem; padding: 0 0.5rem; margin-left: auto; }
    
    .add-item { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .add-item input { flex-grow: 1; }
    .add-btn { background-color: #e2e8f0; border: none; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; font-weight: bold; }

    .actions { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; margin-top: 1.5rem; }
    .save-btn { background-color: var(--accent-primary); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: bold; }
    .delete-btn { background: none; border: none; color: var(--accent-danger); cursor: pointer; font-weight: 500; margin-right: auto; }
  `;

  private _handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const eventData = { ...data, checklist: this._checklistItems };
    this.dispatchEvent(new CustomEvent('save-task', { detail: eventData, bubbles: true, composed: true }));
  }

  private _handleDelete() {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      this.dispatchEvent(new CustomEvent('delete-task', { detail: { id: this.task?.id }, bubbles: true, composed: true }));
    }
  }

  private _addChecklistItem() {
    const input = this.shadowRoot?.getElementById('checklist-input') as HTMLInputElement;
    if (input && input.value.trim()) {
      this._checklistItems = [...this._checklistItems, { id: nanoid(10), text: input.value.trim(), completed: false }];
      input.value = '';
    }
  }
  private _handleChecklistItemChange(item: ChecklistItem, completed: boolean) {
    const foundItem = this._checklistItems.find(i => i.id === item.id);
    if (foundItem) {
      foundItem.completed = completed;
      this.requestUpdate('_checklistItems');
    }
  }
  private _handleChecklistItemDelete(itemId: string) {
    this._checklistItems = this._checklistItems.filter(item => item.id !== itemId);
  }

  renderChecklist() {
    return html`
      <div class="section">
        <div class="section-header">Чек-лист</div>
        ${this._checklistItems.map(item => html`
          <div class="checklist-item">
            <input 
              type="checkbox" 
              .checked=${item.completed}
              @change=${(e: Event) => this._handleChecklistItemChange(item, (e.target as HTMLInputElement).checked)}
            >
            <label class="checklist-text ${item.completed ? 'completed' : ''}">${item.text}</label>
            <button type="button" class="item-delete-btn" @click=${() => this._handleChecklistItemDelete(item.id)}>&times;</button>
          </div>
        `)}
        <div class="add-item">
          <input id="checklist-input" type="text" placeholder="Добавить подзадачу..." @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); this._addChecklistItem(); }}}>
          <button type="button" class="add-btn" @click=${this._addChecklistItem}>+</button>
        </div>
      </div>
    `;
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
        
        ${this.renderChecklist()}

        <div class="actions">
          ${this.task?.id ? html`<button type="button" class="delete-btn" @click=${this._handleDelete}>Удалить</button>` : ''}
          <button type="submit" class="save-btn">Сохранить</button>
        </div>
      </form>
    `;
  }
}