// src/resource-view.ts
import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import type { Contact, Regulation } from './types.js';

type ResourceViewTab = 'contacts' | 'regulations';

@customElement('resource-view')
export class ResourceView extends LitElement {
  @property({ attribute: false })
  contacts: Contact[] = [];

  @property({ attribute: false })
  regulations: Regulation[] = [];

  @state()
  private _activeTab: ResourceViewTab = 'contacts';

  // --- НОВЫЕ, ПЕРЕРАБОТАННЫЕ СТИЛИ ---
  static styles = css`
    :host {
      display: block;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);
    }
    .add-btn {
      background-color: var(--accent-primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      box-shadow: var(--shadow-sm);
    }
    .add-btn:hover {
      filter: brightness(1.1);
      box-shadow: var(--shadow-md);
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid var(--border-color);
      margin-bottom: 2rem;
    }
    .tab-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      background-color: transparent;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      transition: color 0.2s ease, border-color 0.2s ease;
    }
    .tab-btn:hover {
      color: var(--text-primary);
    }
    .tab-btn.active {
      color: var(--accent-primary);
      border-bottom-color: var(--accent-primary);
    }
    .tab-btn i {
      margin-right: 0.5rem;
    }

    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .resource-card {
      background-color: var(--bg-card);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      display: flex;
      flex-direction: column;
    }
    .resource-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md);
      border-color: var(--accent-primary);
    }
    .card-header {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }
    .card-subheader {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 1rem;
      min-height: 1.2em; /* Резервируем место, чтобы карточки не прыгали */
    }
    .card-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      font-size: 0.9rem;
      margin-top: auto; /* Прижимаем информацию к низу */
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-secondary);
    }
    .info-item i {
      width: 16px;
      text-align: center;
      color: var(--accent-primary);
    }
    .no-items {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }
  `;

  private _handleAddClick() {
    const eventName = this._activeTab === 'contacts' ? 'add-contact' : 'add-regulation';
    this.dispatchEvent(new CustomEvent(eventName, { bubbles: true, composed: true }));
  }

  private _handleEditClick(item: Contact | Regulation, type: ResourceViewTab) {
    const eventName = type === 'contacts' ? 'edit-contact' : 'edit-regulation';
    this.dispatchEvent(new CustomEvent(eventName, { detail: { item }, bubbles: true, composed: true }));
  }

  private _renderContactsList() {
    return html`
      <div class="grid-container">
        ${this.contacts.length === 0 ? html`
          <div class="no-items">Список контактов пуст.</div>
        ` : this.contacts.map(contact => html`
          <div class="resource-card" @click=${() => this._handleEditClick(contact, 'contacts')}>
            <div class="card-header">${contact.name}</div>
            <div class="card-subheader">${contact.role || ''}</div>
            <div class="card-info">
              ${contact.phone ? html`<div class="info-item"><i class="fas fa-phone"></i><span>${contact.phone}</span></div>` : ''}
              ${contact.email ? html`<div class="info-item"><i class="fas fa-envelope"></i><span>${contact.email}</span></div>` : ''}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private _renderRegulationsList() {
    return html`
      <div class="grid-container">
        ${this.regulations.length === 0 ? html`
          <div class="no-items">Список регламентов пуст.</div>
        ` : this.regulations.map(reg => html`
          <div class="resource-card" @click=${() => this._handleEditClick(reg, 'regulations')}>
            <div class="card-header">${reg.title}</div>
            <div class="card-subheader">${reg.category || ''}</div>
            <div class="card-info">
              <div class="info-item">
                <i class="fas fa-paperclip"></i>
                <span>${reg.files && reg.files.length > 0 ? `${reg.files.length} вложений` : 'Нет вложений'}</span>
              </div>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private _renderTabContent() {
    switch (this._activeTab) {
      case 'contacts':
        return this._renderContactsList();
      case 'regulations':
        return this._renderRegulationsList();
      default:
        return html``;
    }
  }

  render() {
    return html`
      <div class="page-header">
        <h1>Ресурсы</h1>
        <button class="add-btn" @click=${this._handleAddClick}>
          <i class="fas fa-plus"></i> 
          ${this._activeTab === 'contacts' ? 'Новый контакт' : 'Новый регламент'}
        </button>
      </div>

      <div class="tabs">
        <button 
          class="tab-btn ${this._activeTab === 'contacts' ? 'active' : ''}"
          @click=${() => { this._activeTab = 'contacts'; }}>
          <i class="fas fa-address-book"></i> Контакты
        </button>
        <button 
          class="tab-btn ${this._activeTab === 'regulations' ? 'active' : ''}"
          @click=${() => { this._activeTab = 'regulations'; }}>
          <i class="fas fa-file-alt"></i> Регламенты
        </button>
      </div>

      <div class="tab-content">
        ${this._renderTabContent()}
      </div>
    `;
  }
}
