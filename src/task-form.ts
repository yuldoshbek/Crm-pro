import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Task } from './task-board';

@customElement('task-form')
export class TaskForm extends LitElement {
  @property({ attribute: false })
  task?: Task;

  static styles = css`
    form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: var(--text-secondary); }
    input, select, textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 1rem; }
    .actions { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; margin-top: 1.5rem; }
    .save-btn { background-color: var(--accent-primary); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: bold; }
    .delete-btn { background: none; border: none; color: var(--accent-danger); cursor: pointer; font-weight: 500; margin-right: auto; }
  `;

  private _handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    this.dispatchEvent(new CustomEvent('save-task', { detail: data, bubbles: true, composed: true }));
  }

  private _handleDelete() {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      this.dispatchEvent(new CustomEvent('delete-task', { detail: { id: this.task?.id }, bubbles: true, composed: true }));
    }
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <input type="hidden" name="id" .value=${this.task?.id || ''}>
        <div>
          <label for="title">Название задачи</label>
          <input id="title" name="title" type="text" .value=${this.task?.title || ''} required>
        </div>
        <div>
          <label for="description">Описание</label>
          <textarea id="description" name="description" rows="3" .value=${this.task?.description || ''}></textarea>
        </div>

        <div class="form-row">
          <div>
            <label for="status">Статус</label>
            <select id="status" name="status" .value=${this.task?.status || 'todo'}>
              <option value="todo">К выполнению</option>
              <option value="inprogress">В работе</option>
              <option value="review">На проверке</option>
              <option value="done">Готово</option>
            </select>
          </div>
          <div>
            <label for="priority">Приоритет</label>
            <select id="priority" name="priority" .value=${this.task?.priority || 'medium'}>
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </div>
        </div>
        <div>
  <label for="dueDate">Срок выполнения</label>
  <input id="dueDate" name="dueDate" type="date" .value=${this.task?.dueDate || ''}>
       </div>
        <div class="actions">
          ${this.task?.id ? html`<button type="button" class="delete-btn" @click=${this._handleDelete}>Удалить</button>` : ''}
          <button type="submit" class="save-btn">Сохранить</button>
        </div>
      </form>
    `;
  }
}