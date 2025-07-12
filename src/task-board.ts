// src/task-board.ts
import { LitElement, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import type { Task, ChecklistItem } from './types.js';
import { taskBoardStyles } from './task-board.styles.js';

@customElement('task-board')
export class TaskBoard extends LitElement {
  static styles = taskBoardStyles;

  @property({ attribute: false })
  tasks: Task[] = [];
  
  @state() private _draggedTaskId: string | null = null;
  
  private _getChecklistProgress(items: ChecklistItem[] = []) {
    const total = items.length;
    if (!total) return { completed: 0, total: 0 };
    const completed = items.filter(item => item.completed).length;
    return { completed, total };
  }
  
  private _handleDragStart(e: DragEvent, task: Task) {
    this._draggedTaskId = task.id;
    const target = e.target as HTMLElement;
    setTimeout(() => {
      target.classList.add('dragging');
    }, 0);
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
    (e.currentTarget as HTMLElement).classList.add('drag-over');
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  private _handleDragLeave(e: DragEvent) {
    (e.currentTarget as HTMLElement).classList.remove('drag-over');
  }

  private _handleDrop(e: DragEvent) {
    e.preventDefault();
    const columnEl = (e.currentTarget as HTMLElement);
    columnEl.classList.remove('drag-over');
    const newStatus = columnEl.dataset.status;

    if (newStatus && this._draggedTaskId) {
      this.dispatchEvent(new CustomEvent('update-task-status', {
        detail: { taskId: this._draggedTaskId, newStatus },
        bubbles: true,
        composed: true
      }));
    }
  }
  
  private _requestOpenModal(task: Task) {
    this.dispatchEvent(new CustomEvent('open-task-modal', { detail: { task }, bubbles: true, composed: true }));
  }

  render() {
    const columns: Record<string, { title: string, tasks: Task[] }> = {
        todo: { title: 'К выполнению', tasks: [] },
        inprogress: { title: 'В работе', tasks: [] },
        review: { title: 'На проверке', tasks: [] },
        done: { title: 'Готово', tasks: [] }
    };
    
    this.tasks.forEach(task => { 
      if (columns[task.status]) {
        columns[task.status].tasks.push(task);
      }
    });

    return html`
      <div class="page-header">
        <h1>Задачи</h1>
        <button class="add-task-btn" @click=${() => this.dispatchEvent(new CustomEvent('add-task'))}>
            <i class="fas fa-plus"></i> Новая задача
        </button>
      </div>
      <div class="board">
        ${Object.entries(columns).map(([status, columnData]) => html`
          <div class="column" data-status=${status} @dragover=${this._handleDragOver} @dragleave=${this._handleDragLeave} @drop=${this._handleDrop}>
            <div class="column-header">
                <h3 class="column-title">${columnData.title}</h3>
                <span class="task-count">${columnData.tasks.length}</span>
            </div>
            ${columnData.tasks.map(task => {
              const progress = this._getChecklistProgress(task.checklist);
              return html`
                <div class="task-card" draggable="true" @dragstart=${(e: DragEvent) => this._handleDragStart(e, task)} @dragend=${this._handleDragEnd} @click=${() => this._requestOpenModal(task)}>
                  <div class="priority-indicator priority-${task.priority}"></div>
                  <div class="task-title">${task.title}</div>
                  <div class="task-footer">
                    <div class="task-meta">
                      ${progress.total > 0 ? html`
                        <span class="meta-item">
                          <i class="fas fa-check-square"></i>
                          <span>${progress.completed}/${progress.total}</span>
                        </span>
                      ` : ''}
                    </div>
                    ${task.dueDate ? html`
                      <span class="meta-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${new Date(task.dueDate).toLocaleDateString()}</span>
                      </span>
                    ` : ''}
                  </div>
                </div>
              `;
            })}
          </div>
        `)}
      </div>
    `;
  }
}