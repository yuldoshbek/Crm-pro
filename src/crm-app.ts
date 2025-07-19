// src/crm-app.ts
import { LitElement, html } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { auth } from './firebase-init.js';
import { signOut } from 'firebase/auth';
import { crmAppStyles } from './crm-app.styles.js';
import type { Task, FinanceOperation, CalendarEvent, Contact, Regulation, Workspace } from './types.js';
import * as api from './firebase-service.js';

// Импорты дочерних компонентов
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
import './project-settings.js';

type EntityType = 'task' | 'finance' | 'event' | 'contact' | 'regulation';
type CollectionName = 'tasks' | 'finances' | 'calendarEvents' | 'contacts' | 'regulations';

@customElement('crm-app')
export class CrmApp extends LitElement {
  static styles = crmAppStyles;

  @property({ type: String })
  workspaceId = '';

  @state() private _view: 'tasks' | 'analytics' | 'finances' | 'calendar' | 'resources' | 'settings' = 'tasks';
  @state() private _workspace: Workspace | null = null;
  @state() private _tasks: Task[] = [];
  @state() private _financeOperations: FinanceOperation[] = [];
  @state() private _calendarEvents: CalendarEvent[] = [];
  @state() private _contacts: Contact[] = [];
  @state() private _regulations: Regulation[] = [];
  @state() private _modalContent: TemplateResult | null = null;
  @state() private _modalTitle = '';
  
  private _listeners: (() => void)[] = [];

  // ИСПРАВЛЕНИЕ (Баг №4): Обновляем заголовок вкладки при изменении workspace
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('workspaceId') && this.workspaceId) {
      this._detachListeners();
      this._attachListeners();
    }
    if (changedProperties.has('_workspace') && this._workspace) {
      document.title = `${this._workspace.name} - CRM Pro`;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._detachListeners();
    document.title = 'CRM Pro'; // Возвращаем заголовок по умолчанию
  }

  private _attachListeners() {
    this._listeners.push(api.listenForWorkspaceDetails(this.workspaceId, (ws) => this._workspace = ws));
    this._listeners.push(api.listenForTasks(this.workspaceId, (tasks) => this._tasks = tasks));
    this._listeners.push(api.listenForFinanceOperations(this.workspaceId, (ops) => this._financeOperations = ops));
    this._listeners.push(api.listenForCalendarEvents(this.workspaceId, (events) => this._calendarEvents = events));
    this._listeners.push(api.listenForContacts(this.workspaceId, (contacts) => this._contacts = contacts));
    this._listeners.push(api.listenForRegulations(this.workspaceId, (regs) => this._regulations = regs));
  }

  private _detachListeners() {
    this._listeners.forEach(unsubscribe => unsubscribe());
    this._listeners = [];
  }
  
  private async _handleSaveItem(e: CustomEvent) {
    const { entityType, data } = e.detail;
    const collectionMap: Record<EntityType, CollectionName> = { task: 'tasks', finance: 'finances', event: 'calendarEvents', contact: 'contacts', regulation: 'regulations' };
    const collectionName = collectionMap[entityType as EntityType];
    this._closeModal(); // Закрываем модальное окно сразу для лучшего UX
    try {
      await api.saveItem(this.workspaceId, collectionName, data);
    } catch (error) { console.error(`Ошибка при сохранении ${entityType}:`, error); }
  }

  // ИСПРАВЛЕНИЕ (Баг №2): Добавляем "оптимистичное" обновление для UI
  private async _handleDeleteItem(e: CustomEvent) {
    const { entityType, itemId } = e.detail;
    const collectionMap: Record<EntityType, CollectionName> = { task: 'tasks', finance: 'finances', event: 'calendarEvents', contact: 'contacts', regulation: 'regulations' };
    const collectionName = collectionMap[entityType as EntityType];

    // Оптимистичное обновление: немедленно удаляем элемент из локального состояния,
    // чтобы интерфейс (включая счетчик) обновился мгновенно.
    if (entityType === 'task') {
      this._tasks = this._tasks.filter(item => item.id !== itemId);
    }
    // (можно добавить для других сущностей по аналогии, если потребуется)

    this._closeModal(); // Закрываем модальное окно сразу

    try {
      await api.deleteItem(this.workspaceId, collectionName, itemId);
    } catch (error) { 
      console.error(`Ошибка при удалении ${entityType}:`, error);
      // В продакшен-приложении здесь была бы логика отката и показа ошибки пользователю
    }
  }
  
  private async _handleUpdateTaskStatus(e: CustomEvent) {
    const { taskId, newStatus } = e.detail;
    try {
      await api.updateTaskStatus(this.workspaceId, taskId, newStatus);
    } catch (error) { console.error("Ошибка при обновлении статуса задачи:", error); }
  }

  private async _handleSaveSettings(e: CustomEvent) {
    try {
      await api.saveWorkspaceSettings(this.workspaceId, e.detail.data);
    } catch (error) { console.error("Ошибка при обновлении настроек проекта:", error); }
  }

  private async _handleDeleteWorkspace() {
    try {
      await api.deleteWorkspace(this.workspaceId);
      this._exitWorkspace();
    } catch (error) { console.error("Ошибка при удалении проекта:", error); }
  }

  private _openModal(type: EntityType, item?: any, options: { dateStr?: string } = {}) {
    switch(type) {
        case 'task':
            this._modalTitle = item ? 'Редактировать задачу' : 'Новая задача';
            this._modalContent = html`<task-form .task=${item} .workspaceId=${this.workspaceId}
              @save-task=${(e: CustomEvent) => this._handleSaveItem({ detail: { entityType: 'task', data: e.detail.data } } as CustomEvent)} 
              @delete-task=${(e: CustomEvent) => this._handleDeleteItem({ detail: { entityType: 'task', itemId: e.detail.taskId } } as CustomEvent)}>
            </task-form>`;
            break;
        case 'finance':
            this._modalTitle = item ? 'Редактировать операцию' : 'Новая операция';
            this._modalContent = html`<finance-form .operation=${item} 
              @save-finance-operation=${(e: CustomEvent) => this._handleSaveItem({ detail: { entityType: 'finance', data: e.detail.data } } as CustomEvent)} 
              @delete-finance-operation=${(e: CustomEvent) => this._handleDeleteItem({ detail: { entityType: 'finance', itemId: e.detail.operationId } } as CustomEvent)}>
            </finance-form>`;
            break;
        case 'event':
            this._modalTitle = item ? 'Редактировать событие' : 'Новое событие';
            this._modalContent = html`<event-form .event=${item} .startDate=${options.dateStr || ''} 
              @save-event=${(e: CustomEvent) => this._handleSaveItem({ detail: { entityType: 'event', data: e.detail.data } } as CustomEvent)} 
              @delete-event=${(e: CustomEvent) => this._handleDeleteItem({ detail: { entityType: 'event', itemId: e.detail.eventId } } as CustomEvent)}>
            </event-form>`;
            break;
        case 'contact':
        case 'regulation':
            this._modalTitle = item ? `Редактировать ${type === 'contact' ? 'контакт' : 'регламент'}` : `Новый ${type === 'contact' ? 'контакт' : 'регламент'}`;
            this._modalContent = html`<resource-form .type=${type} .item=${item} .workspaceId=${this.workspaceId}
              @save-resource=${(e: CustomEvent) => this._handleSaveItem({ detail: { entityType: e.detail.type, data: e.detail.data } } as CustomEvent)} 
              @delete-resource=${(e: CustomEvent) => this._handleDeleteItem({ detail: { entityType: e.detail.type, itemId: e.detail.itemId } } as CustomEvent)}>
            </resource-form>`;
            break;
    }
  }

  private _closeModal() { this._modalContent = null; this._modalTitle = ''; }
  private _exitWorkspace() { this.dispatchEvent(new CustomEvent('exit-workspace', { bubbles: true, composed: true })); }
  
  private _renderView() {
    switch (this._view) {
      case 'tasks': return html`<task-board .tasks=${this._tasks} @add-task=${() => this._openModal('task')} @edit-task=${(e: CustomEvent) => this._openModal('task', this._tasks.find(t => t.id === e.detail.taskId))} @update-task-status=${this._handleUpdateTaskStatus}></task-board>`;
      case 'finances': return html`<finance-dashboard .operations=${this._financeOperations} @add-finance-operation=${() => this._openModal('finance')} @edit-finance-operation=${(e: CustomEvent) => this._openModal('finance', e.detail.operation)}></finance-dashboard>`;
      case 'analytics': return html`<task-analytics .tasks=${this._tasks}></task-analytics>`;
      case 'calendar': return html`<calendar-view .tasks=${this._tasks} .events=${this._calendarEvents} @edit-task=${(e: CustomEvent) => this._openModal('task', this._tasks.find(t => t.id === e.detail.taskId))} @add-event=${(e: CustomEvent) => this._openModal('event', undefined, { dateStr: e.detail.dateStr })} @edit-event=${(e: CustomEvent) => this._openModal('event', this._calendarEvents.find(ev => ev.id === e.detail.eventId))}></calendar-view>`;
      case 'resources': return html`<resource-view .contacts=${this._contacts} .regulations=${this._regulations} @add-contact=${() => this._openModal('contact')} @edit-contact=${(e: CustomEvent) => this._openModal('contact', e.detail.item)} @add-regulation=${() => this._openModal('regulation')} @edit-regulation=${(e: CustomEvent) => this._openModal('regulation', e.detail.item)}></resource-view>`;
      case 'settings': return html`<project-settings .workspace=${this._workspace} @save-settings=${this._handleSaveSettings} @delete-workspace=${this._handleDeleteWorkspace}></project-settings>`;
      default: return html`<h1>Выберите раздел</h1>`;
    }
  }

  render() {
    const user = auth.currentUser;
    const isAnonymous = user?.isAnonymous;
    const userEmail = isAnonymous ? 'Аноним' : user?.email || 'Пользователь';
    
    return html`
      <div class="app-layout">
        <aside class="sidebar">
          <div class="logo-section"><h2>${this._workspace?.name || 'Загрузка...'}</h2></div>
          <nav class="nav-menu">
            <ul>
              <!-- ИСПРАВЛЕНИЕ: Оборачиваем иконки в span для корректного центрирования -->
              <li><a href="#" class="${this._view === 'tasks' ? 'active' : ''}" @click=${() => this._view = 'tasks'}><span class="icon-wrapper"><i class="fas fa-tasks"></i></span> Задачи</a></li>
              <li><a href="#" class="${this._view === 'analytics' ? 'active' : ''}" @click=${() => this._view = 'analytics'}><span class="icon-wrapper"><i class="fas fa-chart-pie"></i></span> Аналитика</a></li>
              <li><a href="#" class="${this._view === 'finances' ? 'active' : ''}" @click=${() => this._view = 'finances'}><span class="icon-wrapper"><i class="fas fa-wallet"></i></span> Финансы</a></li>
              <li><a href="#" class="${this._view === 'calendar' ? 'active' : ''}" @click=${() => this._view = 'calendar'}><span class="icon-wrapper"><i class="fas fa-calendar-alt"></i></span> Календарь</a></li>
              <li><a href="#" class="${this._view === 'resources' ? 'active' : ''}" @click=${() => this._view = 'resources'}><span class="icon-wrapper"><i class="fas fa-book"></i></span> Ресурсы</a></li>
              <li><a href="#" class="${this._view === 'settings' ? 'active' : ''}" @click=${() => this._view = 'settings'}><span class="icon-wrapper"><i class="fas fa-cog"></i></span> Настройки</a></li>
            </ul>
          </nav>
          <div class="user-profile">
            <div class="user-avatar">
              <!-- ИСПРАВЛЕНИЕ: Показываем иконку для анонимного пользователя -->
              ${isAnonymous ? html`<i class="fas fa-user"></i>` : userEmail[0]?.toUpperCase()}
            </div>
            <div class="user-info">
                <div class="user-email">${userEmail}</div>
            </div>
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
