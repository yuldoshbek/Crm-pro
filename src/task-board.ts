// src/task-board.ts
import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from './firebase-init';

// Определяем, как выглядит объект одной задачи
// Этот интерфейс можно экспортировать, чтобы другие файлы знали о "форме" задачи
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

@customElement('task-board')
export class TaskBoard extends LitElement {
  // Стили должны быть объявлены как статическое свойство ВНУТРИ класса
  static styles = css`
    .board { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
    .column { background-color: #f3f4f6; border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; min-height: 200px; }
    .column-title { font-weight: bold; color: var(--text-secondary); padding: 0 0.5rem; }
    .task-card { background-color: var(--bg-card); padding: 1rem; border-radius: 8px; box-shadow: var(--shadow-md); border-left: 5px solid; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .task-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
    .task-card-low { border-color: #10b981; }
    .task-card-medium { border-color: #f59e0b; }
    .task-card-high { border-color: #ef4444; }
    .task-title { font-weight: 600; }
    .task-description { 
      font-size: 0.875rem; 
      color: var(--text-secondary); 
      margin-top: 0.5rem; 
      white-space: pre-wrap; 
      word-wrap: break-word; 
    }
    .task-done .task-title { 
      text-decoration: line-through; 
      color: var(--text-secondary); 
    }
    .task-footer {
        margin-top: 1rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-color);
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    .due-date {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
  `;

  @state() private _tasks: Task[] = [];
  @property({ type: String }) collectionPath = '';
  private _unsubscribe: (() => void) | null = null;

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('collectionPath') && this.collectionPath) {
      this._listenForTasks();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribe?.();
  }
  
  _listenForTasks() {
    this._unsubscribe?.();
    const userId = auth.currentUser?.uid;
    if (!userId || !this.collectionPath) {
        this._tasks = [];
        return;
    };

    const tasksRef = collection(db, this.collectionPath);
    const q = query(tasksRef, where("userId", "==", userId));
    
    this._unsubscribe = onSnapshot(q, (snapshot) => {
      this._tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    }, (error) => {
        console.error("Ошибка при получении задач: ", error);
        this._tasks = [];
    });
  }

  private _requestOpenModal(task?: Task) {
    const event = new CustomEvent('open-task-modal', {
      detail: { task },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  render() {
    const columns: Record<string, { title: string, tasks: Task[] }> = {
        todo: { title: 'К выполнению', tasks: [] },
        inprogress: { title: 'В работе', tasks: [] },
        review: { title: 'На проверке', tasks: [] },
        done: { title: 'Готово', tasks: [] }
    };

    this._tasks.forEach(task => {
        const status = task.status || 'todo';
        if (columns[status]) {
            columns[status].tasks.push(task);
        }
    });

    return html`
      <div class="board">
        ${Object.entries(columns).map(([status, columnData]) => html`
          <div class="column" data-status=${status}>
            <h3 class="column-title">${columnData.title} (${columnData.tasks.length})</h3>
            ${columnData.tasks.map(task => html`
              <div 
                class="task-card task-card-${task.priority || 'medium'} ${task.status === 'done' ? 'task-done' : ''}"
                @click=${() => this._requestOpenModal(task)}>
                <div class="task-title">${task.title}</div>
                ${task.description ? html`<p class="task-description">${task.description}</p>` : ''}
                
                ${task.dueDate ? html`
                  <div class="task-footer">
                    <span class="due-date">
                      <i class="fas fa-calendar-alt"></i>
                      <span>${new Date(task.dueDate).toLocaleDateString()}</span>
                    </span>
                  </div>
                ` : ''}
              </div>
            `)}
          </div>
        `)}
      </div>
    `;
  }
}
