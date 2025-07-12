// src/calendar-view.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Calendar } from '@fullcalendar/core';
import type { EventClickArg } from '@fullcalendar/core';
// ИСПРАВЛЕНИЕ: Импортируем DateClickArg из правильного плагина
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import type { Task, CalendarEvent } from './types.js';

@customElement('calendar-view')
export class CalendarView extends LitElement {
  @property({ attribute: false })
  tasks: Task[] = [];

  @property({ attribute: false })
  events: CalendarEvent[] = [];

  private calendar: Calendar | null = null;

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    .calendar-container {
      height: 100%;
    }
    .fc {
      --fc-border-color: var(--border-color);
      --fc-daygrid-event-dot-width: 8px;
      --fc-list-event-dot-width: 10px;
      --fc-list-event-hover-bg-color: var(--bg-hover);
      color: var(--text-primary);
    }
    .fc .fc-button-primary {
      background-color: var(--accent-primary);
      border-color: var(--accent-primary);
    }
    .fc .fc-button-primary:hover {
      background-color: color-mix(in srgb, var(--accent-primary), #000 10%);
    }
    .fc .fc-daygrid-day.fc-day-today {
      background-color: var(--accent-primary-light);
    }
    .fc-col-header-cell-cushion, .fc-daygrid-day-number {
      color: var(--text-secondary);
    }
    .fc-event-title, .fc-list-event-title {
      font-weight: 500;
    }
  `;

  firstUpdated() {
    const calendarEl = this.shadowRoot!.querySelector('.calendar-container') as HTMLElement;
    if (!calendarEl) return;

    this.calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek'
      },
      locale: 'ru',
      buttonText: { today: 'Сегодня', month: 'Месяц', week: 'Неделя', list: 'Список' },
      events: this._transformDataToEvents(),
      eventClick: (info: EventClickArg) => {
        const { type, id } = info.event.extendedProps;
        if (type === 'task') {
          this.dispatchEvent(new CustomEvent('edit-task', { detail: { taskId: id }, bubbles: true, composed: true }));
        } else if (type === 'event') {
          this.dispatchEvent(new CustomEvent('edit-event', { detail: { eventId: id }, bubbles: true, composed: true }));
        }
      },
      dateClick: (info: DateClickArg) => {
        this.dispatchEvent(new CustomEvent('add-event', {
          detail: { dateStr: info.dateStr },
          bubbles: true,
          composed: true
        }));
      }
    });
    this.calendar.render();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('tasks') || changedProperties.has('events')) {
      if (this.calendar) {
        this.calendar.getEventSources().forEach(source => source.remove());
        this.calendar.addEventSource(this._transformDataToEvents());
      }
    }
  }

  private _transformDataToEvents() {
    const taskEvents = this.tasks
      .filter(task => task.dueDate)
      .map(task => ({
        id: task.id,
        title: task.title,
        start: task.dueDate!,
        allDay: true,
        extendedProps: { type: 'task', id: task.id },
        backgroundColor: this._getColorForPriority(task.priority),
        borderColor: this._getColorForPriority(task.priority),
      }));

    const customEvents = this.events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      extendedProps: { type: 'event', id: event.id },
      backgroundColor: event.color,
      borderColor: event.color,
    }));

    return [...taskEvents, ...customEvents];
  }

  private _getColorForPriority(priority: Task['priority']): string {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f97316';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }

  render() {
    return html`<div class="calendar-container"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'calendar-view': CalendarView;
  }
}
