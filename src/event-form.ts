// src/event-form.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CalendarEvent } from './types.js';

@customElement('event-form')
export class EventForm extends LitElement {
  @property({ attribute: false })
  event?: CalendarEvent;

  @property({ type: String })
  startDate = '';

  static styles = css`
    form { 
      display: flex; 
      flex-direction: column; 
      gap: 1.25rem; 
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
    .checkbox-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: -0.5rem; /* Компенсируем лишний отступ */
    }
    .checkbox-row input {
        width: 1rem;
        height: 1rem;
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
    
    const isAllDay = data.allDay === 'on';
    const processedData = {
      ...data,
      allDay: isAllDay,
      start: isAllDay ? data.startDate : `${data.startDate}T${data.startTime}`,
      end: isAllDay ? data.endDate || data.startDate : `${data.endDate || data.startDate}T${data.endTime}`,
    };

    delete (processedData as any).startTime;
    delete (processedData as any).endTime;
    
    this.dispatchEvent(new CustomEvent('save-event', {
      detail: { data: processedData },
      bubbles: true,
      composed: true
    }));
  }

  private _handleDelete() {
    this.dispatchEvent(new CustomEvent('delete-event', {
        detail: { eventId: this.event?.id },
        bubbles: true,
        composed: true
    }));
  }

  render() {
    const start = this.event?.start ? new Date(this.event.start) : new Date(this.startDate || Date.now());
    const end = this.event?.end ? new Date(this.event.end) : new Date(start.getTime() + 60 * 60 * 1000);

    const startDate = start.toISOString().split('T')[0];
    const startTime = start.toTimeString().substring(0, 5);
    const endDate = end.toISOString().split('T')[0];
    const endTime = end.toTimeString().substring(0, 5);

    return html`
      <form @submit=${this._handleSubmit}>
        <input type="hidden" name="id" .value=${this.event?.id || ''}>

        <div>
          <label for="title">Название события</label>
          <input id="title" name="title" type="text" .value=${this.event?.title || ''} required>
        </div>

        <div class="form-row">
            <div>
                <label for="startDate">Дата начала</label>
                <input id="startDate" name="startDate" type="date" .value=${startDate} required>
            </div>
            <div>
                <label for="startTime">Время начала</label>
                <input id="startTime" name="startTime" type="time" .value=${startTime}>
            </div>
        </div>
        
        <div class="form-row">
            <div>
                <label for="endDate">Дата окончания</label>
                <input id="endDate" name="endDate" type="date" .value=${endDate}>
            </div>
            <div>
                <label for="endTime">Время окончания</label>
                <input id="endTime" name="endTime" type="time" .value=${endTime}>
            </div>
        </div>

        <div class="checkbox-row">
            <input id="allDay" name="allDay" type="checkbox" .checked=${this.event?.allDay || false}>
            <label for="allDay">Весь день</label>
        </div>

        <div>
          <label for="description">Описание</label>
          <textarea id="description" name="description" rows="3" .value=${this.event?.description || ''}></textarea>
        </div>
        
        <div>
            <label for="color">Цвет события</label>
            <input id="color" name="color" type="color" .value=${this.event?.color || '#3788d8'}>
        </div>

        <div class="actions">
          ${this.event?.id ? html`<button type="button" class="delete-btn" @click=${this._handleDelete}>Удалить</button>` : ''}
          <button type="submit" class="save-btn">Сохранить</button>
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'event-form': EventForm;
  }
}
