// src/crm-app.ts
import { LitElement, html } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { auth, db } from './firebase-init.js';
import { signOut } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { crmAppStyles } from './crm-app.styles.js';
import type { Task, FinanceOperation, CalendarEvent, Contact, Regulation, Workspace } from './types.js';

// Импортируем все компоненты, включая новый для настроек
import './modal-dialog.js';
import './task-board.js';
import './task-form.js';
import './finance-dashboard.js';
import './finance-form.js';
import './task-analytics.js';
import './calendar-view.js';
import './event-form.js';
import './resource-view.js';
import './resource-form.js';
import './project-settings.js'; // <-- НОВЫЙ ИМПОРТ

@customElement('crm-app')
export class CrmApp extends LitElement {
  static styles = crmAppStyles;

  @property({ type: String })
  workspaceId = '';

  // --- Состояния ---
  // Добавляем 'settings' в возможные виды
  @state() private _view: 'tasks' | 'analytics' | 'finances' | 'calendar' | 'resources' | 'settings' = 'tasks';
  @state() private _workspace: Workspace | null = null;
  @state() private _tasks: Task[] = [];
  @state() private _financeOperations: FinanceOperation[] = [];
  @state() private _calendarEvents: CalendarEvent[] = [];
  @state() private _contacts: Contact[] = [];
  @state() private _regulations: Regulation[] = [];
  @state() private _modalContent: TemplateResult | null = null;
  @state() private _modalTitle = '';
  
  // Функции отписки
  private _listeners: (() => void)[] = [];

  // --- Методы жизненного цикла ---
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('workspaceId') && this.workspaceId) {
      this._detachListeners();
      this._attachListeners();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._detachListeners();
  }

  private _attachListeners() {
    this._listenForWorkspaceDetails();
    this._listenForTasks();
    this._listenForFinanceOperations();
    this._listenForCalendarEvents();
    this._listenForContacts();
    this._listenForRegulations();
  }

  private _detachListeners() {
    this._listeners.forEach(unsubscribe => unsubscribe());
    this._listeners = [];
  }

  // --- Методы для работы с данными ---
  private _listenForWorkspaceDetails() {
    const unsub = onSnapshot(doc(db, 'workspaces', this.workspaceId), (doc) => {
        this._workspace = { id: doc.id, ...doc.data() } as Workspace;
    });
    this._listeners.push(unsub);
  }
  private _listenForTasks() {
    const path = `workspaces/${this.workspaceId}/tasks`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => { this._tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)); });
    this._listeners.push(unsub);
  }
  private _listenForFinanceOperations() {
    const path = `workspaces/${this.workspaceId}/finances`;
    const q = query(collection(db, path), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => { this._financeOperations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinanceOperation)); });
    this._listeners.push(unsub);
  }
  private _listenForCalendarEvents() {
    const path = `workspaces/${this.workspaceId}/calendarEvents`;
    const q = query(collection(db, path), orderBy('start', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => { this._calendarEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent)); });
    this._listeners.push(unsub);
  }
  private _listenForContacts() {
    const path = `workspaces/${this.workspaceId}/contacts`;
    const q = query(collection(db, path), orderBy('name'));
    const unsub = onSnapshot(q, (snapshot) => { this._contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact)); });
    this._listeners.push(unsub);
  }
  private _listenForRegulations() {
    const path = `workspaces/${this.workspaceId}/regulations`;
    const q = query(collection(db, path), orderBy('title'));
    const unsub = onSnapshot(q, (snapshot) => { this._regulations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Regulation)); });
    this._listeners.push(unsub);
  }
  
  // --- Общие CRUD-методы ---
  private async _saveItem(collectionName: string, data: any, isSubCollection = true) {
    const path = isSubCollection ? `workspaces/${this.workspaceId}/${collectionName}` : collectionName;
    const itemData = { ...data };
    const itemId = itemData.id;
    delete itemData.id;
    try {
      if (itemId) { await updateDoc(doc(db, path, itemId), itemData); } 
      else {
        if (collectionName === 'tasks') itemData.createdAt = serverTimestamp();
        await addDoc(collection(db, path), itemData);
      }
    } catch (error) { console.error(`Ошибка при сохранении в ${collectionName}:`, error); }
    this._closeModal();
  }
  private async _deleteItem(collectionName: string, itemId: string, isSubCollection = true) {
    if (!itemId) return;
    const path = isSubCollection ? `workspaces/${this.workspaceId}/${collectionName}` : collectionName;
    try { await deleteDoc(doc(db, path, itemId)); } 
    catch (error) { console.error(`Ошибка при удалении из ${collectionName}:`, error); }
    this._closeModal();
  }

  // --- Обработчики событий от дочерних компонентов ---
  private _handleSaveTask = (e: CustomEvent) => this._saveItem('tasks', e.detail.data);
  private _handleDeleteTask = (e: CustomEvent) => this._deleteItem('tasks', e.detail.taskId);
  private _handleSaveFinanceOperation = (e: CustomEvent) => this._saveItem('finances', e.detail.data);
  private _handleDeleteFinanceOperation = (e: CustomEvent) => this._deleteItem('finances', e.detail.operationId);
  private _handleSaveEvent = (e: CustomEvent) => this._saveItem('calendarEvents', e.detail.data);
  private _handleDeleteEvent = (e: CustomEvent) => this._deleteItem('calendarEvents', e.detail.eventId);
  private _handleSaveResource = (e: CustomEvent) => this._saveItem(e.detail.type === 'contact' ? 'contacts' : 'regulations', e.detail.data);
  private _handleDeleteResource = (e: CustomEvent) => this._deleteItem(e.detail.type === 'contact' ? 'contacts' : 'regulations', e.detail.itemId);
  
  private async _handleUpdateTaskStatus(e: CustomEvent) {
    const { taskId, newStatus } = e.detail;
    const task = this._tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    try { await updateDoc(doc(db, `workspaces/${this.workspaceId}/tasks`, taskId), { status: newStatus }); } 
    catch (error) { console.error("Ошибка при обновлении статуса задачи:", error); }
  }

  // --- НОВЫЕ обработчики для настроек проекта ---
  private async _handleSaveSettings(e: CustomEvent) {
    const { data } = e.detail;
    const workspaceRef = doc(db, 'workspaces', this.workspaceId);
    try {
      await updateDoc(workspaceRef, {
        name: data.name,
        description: data.description
      });
      // Можно добавить уведомление об успехе
    } catch (error) {
      console.error("Ошибка при обновлении настроек проекта:", error);
    }
  }

  private async _handleDeleteWorkspace() {
    const workspaceRef = doc(db, 'workspaces', this.workspaceId);
    try {
      await deleteDoc(workspaceRef);
      this._exitWorkspace();
    } catch (error) {
      console.error("Ошибка при удалении проекта:", error);
    }
  }

  // --- Методы для управления модальным окном ---
  private _openTaskModal = (task?: Task) => this._openModal('task', task);
  private _openFinanceModal = (operation?: FinanceOperation) => this._openModal('finance', operation);
  private _openEventModal = (event?: CalendarEvent, dateStr?: string) => this._openModal('event', event, { dateStr });
  private _openResourceModal = (type: 'contact' | 'regulation', item?: Contact | Regulation) => this._openModal(type, item);

  private _openModal(type: string, item?: any, options: { dateStr?: string } = {}) {
    switch(type) {
        case 'task':
            this._modalTitle = item ? 'Редактировать задачу' : 'Новая задача';
            this._modalContent = html`<task-form .task=${item} @save-task=${this._handleSaveTask} @delete-task=${this._handleDeleteTask}></task-form>`;
            break;
        case 'finance':
            this._modalTitle = item ? 'Редактировать операцию' : 'Новая операция';
            this._modalContent = html`<finance-form .operation=${item} @save-finance-operation=${this._handleSaveFinanceOperation} @delete-finance-operation=${this._handleDeleteFinanceOperation}></finance-form>`;
            break;
        case 'event':
            this._modalTitle = item ? 'Редактировать событие' : 'Новое событие';
            this._modalContent = html`<event-form .event=${item} .startDate=${options.dateStr || ''} @save-event=${this._handleSaveEvent} @delete-event=${this._handleDeleteEvent}></event-form>`;
            break;
        case 'contact':
        case 'regulation':
            this._modalTitle = item ? `Редактировать ${type === 'contact' ? 'контакт' : 'регламент'}` : `Новый ${type === 'contact' ? 'контакт' : 'регламент'}`;
            this._modalContent = html`<resource-form .type=${type} .item=${item} @save-resource=${this._handleSaveResource} @delete-resource=${this._handleDeleteResource}></resource-form>`;
            break;
    }
  }

  private _closeModal() {
    this._modalContent = null;
    this._modalTitle = '';
  }

  private _exitWorkspace() {
    this.dispatchEvent(new CustomEvent('exit-workspace', { bubbles: true, composed: true }));
  }
  
  // --- Рендеринг ---
  private _renderView() {
    switch (this._view) {
      case 'tasks': return html`<task-board .tasks=${this._tasks} @add-task=${() => this._openTaskModal()} @edit-task=${(e: CustomEvent) => this._openTaskModal(this._tasks.find(t => t.id === e.detail.taskId))} @update-task-status=${this._handleUpdateTaskStatus}></task-board>`;
      case 'finances': return html`<finance-dashboard .operations=${this._financeOperations} @add-finance-operation=${() => this._openFinanceModal()} @edit-finance-operation=${(e: CustomEvent) => this._openFinanceModal(e.detail.operation)}></finance-dashboard>`;
      case 'analytics': return html`<task-analytics .tasks=${this._tasks}></task-analytics>`;
      case 'calendar': return html`<calendar-view .tasks=${this._tasks} .events=${this._calendarEvents} @edit-task=${(e: CustomEvent) => this._openTaskModal(this._tasks.find(t => t.id === e.detail.taskId))} @add-event=${(e: CustomEvent) => this._openEventModal(undefined, e.detail.dateStr)} @edit-event=${(e: CustomEvent) => this._openEventModal(this._calendarEvents.find(ev => ev.id === e.detail.eventId))}></calendar-view>`;
      case 'resources': return html`<resource-view .contacts=${this._contacts} .regulations=${this._regulations} @add-contact=${() => this._openResourceModal('contact')} @edit-contact=${(e: CustomEvent) => this._openResourceModal('contact', e.detail.item)} @add-regulation=${() => this._openResourceModal('regulation')} @edit-regulation=${(e: CustomEvent) => this._openResourceModal('regulation', e.detail.item)}></resource-view>`;
      // НОВЫЙ РАЗДЕЛ
      case 'settings':
        return html`<project-settings
          .workspace=${this._workspace}
          @save-settings=${this._handleSaveSettings}
          @delete-workspace=${this._handleDeleteWorkspace}
        ></project-settings>`;
      default: return html`<h1>Выберите раздел</h1>`;
    }
  }

  render() {
    const user = auth.currentUser;
    const userEmail = user?.email || 'Аноним';
    const userInitial = userEmail[0]?.toUpperCase() || 'A';
    return html`
      <div class="app-layout">
        <aside class="sidebar">
          <div class="logo-section"><h2>${this._workspace?.name || 'Загрузка...'}</h2></div>
          <nav class="nav-menu">
            <ul>
              <li><a href="#" class="${this._view === 'tasks' ? 'active' : ''}" @click=${() => this._view = 'tasks'}><i class="fas fa-tasks"></i> Задачи</a></li>
              <li><a href="#" class="${this._view === 'analytics' ? 'active' : ''}" @click=${() => this._view = 'analytics'}><i class="fas fa-chart-pie"></i> Аналитика</a></li>
              <li><a href="#" class="${this._view === 'finances' ? 'active' : ''}" @click=${() => this._view = 'finances'}><i class="fas fa-wallet"></i> Финансы</a></li>
              <li><a href="#" class="${this._view === 'calendar' ? 'active' : ''}" @click=${() => this._view = 'calendar'}><i class="fas fa-calendar-alt"></i> Календарь</a></li>
              <li><a href="#" class="${this._view === 'resources' ? 'active' : ''}" @click=${() => this._view = 'resources'}><i class="fas fa-book"></i> Ресурсы</a></li>
              <!-- НОВАЯ ССЫЛКА НА НАСТРОЙКИ -->
              <li class="separator"></li>
              <li><a href="#" class="${this._view === 'settings' ? 'active' : ''}" @click=${() => this._view = 'settings'}><i class="fas fa-cog"></i> Настройки</a></li>
            </ul>
          </nav>
          <div class="user-profile">
            <div class="user-avatar">${userInitial}</div>
            <div class="user-email">${userEmail}</div>
            <button class="logout-btn" @click=${this._exitWorkspace} title="Сменить проект"><i class="fas fa-exchange-alt"></i></button>
            <button class="logout-btn" @click=${() => signOut(auth)} title="Выйти"><i class="fas fa-sign-out-alt"></i></button>
          </div>
        </aside>
        <main class="main-content">${this._renderView()}</main>
        ${this._modalContent ? html`
          <modal-dialog @close=${this._closeModal}>
            <h2 slot="title">${this._modalTitle}</h2>
            ${this._modalContent}
          </modal-dialog>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'crm-app': CrmApp;
  }
}

