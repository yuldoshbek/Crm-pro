import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from './firebase-init';

// Определяем, как выглядит объект одной задачи
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
}

@customElement('task-board')
export class TaskBoard extends LitElement {
  // Сюда будут приходить задачи из Firebase
  @state()
  private _tasks: Task[] = [];
  
  // Сюда мы будем передавать путь к коллекции в Firebase
  @property({ type: String })
  collectionPath = '';

  private _unsubscribe: any;

  // Эта функция вызывается, когда компонент добавляется на страницу
  connectedCallback() {
    super.connectedCallback();
    this._listenForTasks();
  }

  // Эта функция вызывается, когда компонент удаляется со страницы
  disconnectedCallback() {
    super.disconnectedCallback();
    // Отписываемся от слушателя, чтобы избежать утечек памяти
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
  
  // Начинаем "слушать" изменения в задачах
  _listenForTasks() {
    const userId = auth.currentUser?.uid;
    if (!userId || !this.collectionPath) return;

    const tasksRef = collection(db, this.collectionPath);
    const q = query(tasksRef, where("userId", "==", userId));
    
    this._unsubscribe = onSnapshot(q, (snapshot) => {
      this._tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    });
  }
  
  static styles = css`
    .board {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    .column {
      background-color: #f3f4f6;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .column-title {
      font-weight: bold;
      color: var(--text-secondary);
    }
    .task-card {
      background-color: var(--bg-card);
      padding: 1rem;
      border-radius: 8px;
      box-shadow: var(--shadow-md);
      border-left: 5px solid;
    }
    .task-card-low { border-color: #10b981; }
    .task-card-medium { border-color: #f59e0b; }
    .task-card-high { border-color: #ef4444; }
    .task-title { font-weight: bold; }
  `;

  render() {
    const columns = {
        todo: { title: 'К выполнению', tasks: [] as Task[] },
        inprogress: { title: 'В работе', tasks: [] as Task[] },
        review: { title: 'На проверке', tasks: [] as Task[] },
        done: { title: 'Готово', tasks: [] as Task[] }
    };

    this._tasks.forEach(task => {
        columns[task.status]?.tasks.push(task);
    });

    return html`
      <div class="board">
        ${Object.entries(columns).map(([status, columnData]) => html`
          <div class="column" data-status=${status}>
            <h3 class="column-title">${columnData.title} (${columnData.tasks.length})</h3>
            ${columnData.tasks.map(task => html`
              <div class="task-card task-card-${task.priority}">
                <div class="task-title">${task.title}</div>
              </div>
            `)}
          </div>
        `)}
      </div>
    `;
  }
}
