// src/task-board.ts
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Task } from './types.js';
import { taskBoardStyles } from './task-board.styles.js';

const STATUSES: Record<Task['status'], string> = {
  todo: 'К выполнению',
  inprogress: 'В работе',
  review: 'На проверке',
  done: 'Готово'
};

@customElement('task-board')
export class TaskBoard extends LitElement {
  static styles = taskBoardStyles;

  @property({ attribute: false })
  tasks: Task[] = [];

  @state() private _draggedTaskId: string | null = null;

  private _getTasksByStatus(status: Task['status']) {
    return this.tasks.filter(task => task.status === status);
  }
  
  private _handleAddTask() {
    this.dispatchEvent(new CustomEvent('add-task', { bubbles: true, composed: true }));
  }

  private _handleEditTask(task: Task) {
    this.dispatchEvent(new CustomEvent('edit-task', {
      detail: { taskId: task.id },
      bubbles: true,
      composed: true
    }));
  }

  private _handleDragStart(e: DragEvent, task: Task) {
    this._draggedTaskId = task.id;
    (e.target as HTMLElement).classList.add('dragging');
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  private _handleDragEnd(e: DragEvent) {
    (e.target as HTMLElement).classList.remove('dragging');
    this._draggedTaskId = null;
  }

  private _handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }
  
  private _handleDrop(e: DragEvent, newStatus: Task['status']) {
    e.preventDefault();
    if (!this._draggedTaskId) return;

    this.dispatchEvent(new CustomEvent('update-task-status', {
      detail: {
        taskId: this._draggedTaskId,
        newStatus: newStatus
      },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="page-header">
        <h1>Задачи</h1>
        <button class="add-task-btn" @click=${this._handleAddTask}>
          <i class="fas fa-plus"></i> Новая задача
        </button>
      </div>

      <div class="board">
        ${Object.entries(STATUSES).map(([status, title]) => {
          const tasksInColumn = this._getTasksByStatus(status as Task['status']);
          return html`
            <div 
              class="column" 
              data-status=${status}
              @dragover=${this._handleDragOver}
              @drop=${(e: DragEvent) => this._handleDrop(e, status as Task['status'])}
            >
              <div class="column-header">
                <h3 class="column-title">${title}</h3>
                <span class="task-count">${tasksInColumn.length}</span>
              </div>
              <div class="task-list">
                ${tasksInColumn.map(task => html`
                  <!-- ИЗМЕНЕНИЕ: Добавляем класс с приоритетом к карточке -->
                  <div
                    class="task-card priority-${task.priority}"
                    draggable="true"
                    @click=${() => this._handleEditTask(task)}
                    @dragstart=${(e: DragEvent) => this._handleDragStart(e, task)}
                    @dragend=${this._handleDragEnd}
                  >
                    <div class="task-title">${task.title}</div>
                    <div class="task-footer">
                      <div class="priority-indicator priority-${task.priority}">
                        ${task.priority}
                      </div>
                      ${task.dueDate ? html`
                        <div class="due-date">
                          <i class="far fa-calendar-alt"></i>
                          <span>${new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `)}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}
