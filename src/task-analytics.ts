// src/task-analytics.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { Task } from './types.js';

@customElement('task-analytics')
export class TaskAnalytics extends LitElement {
  @property({ attribute: false })
  tasks: Task[] = [];

  private charts: { [key: string]: ApexCharts } = {};

  // --- НОВЫЕ, ПРОФЕССИОНАЛЬНЫЕ СТИЛИ ДЛЯ ДАШБОРДА ---
  static styles = css`
    :host {
      display: block;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 2rem 0;
      color: var(--text-primary);
    }
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1.5rem;
    }
    .stat-card, .chart-container {
      background-color: var(--bg-card);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }

    /* Адаптивная сетка для KPI-карточек */
    .stat-card {
      grid-column: span 12; /* 1 колонка на мобильных */
    }
    @media (min-width: 640px) { .stat-card { grid-column: span 6; } } /* 2 колонки на планшетах */
    @media (min-width: 1024px) { .stat-card { grid-column: span 4; } } /* 3 колонки на ноутбуках */
    @media (min-width: 1280px) { .stat-card.kpi-total, .stat-card.kpi-progress, .stat-card.kpi-done { grid-column: span 2; } } /* 5 карточек в ряд на больших экранах */
    @media (min-width: 1280px) { .stat-card.kpi-overdue, .stat-card.kpi-completion { grid-column: span 3; } }


    .stat-header {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
    }
    .stat-value {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-top: 0.5rem;
    }

    /* Адаптивная сетка для графиков и виджетов */
    .chart-container.activity { grid-column: span 12; }
    .chart-container.status { grid-column: span 12; }
    .chart-container.priority { grid-column: span 12; }
    .chart-container.completion-rate { grid-column: span 12; }
    .chart-container.recent-activity { grid-column: span 12; }

    @media (min-width: 1024px) {
      .chart-container.activity { grid-column: span 12; }
      .chart-container.status { grid-column: span 7; }
      .chart-container.priority { grid-column: span 5; }
      .chart-container.completion-rate { grid-column: span 5; }
      .chart-container.recent-activity { grid-column: span 7; }
    }

    .chart-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    /* Стили для нового виджета "Лента активности" */
    .activity-list { list-style: none; padding: 0; margin: 0; }
    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
    }
    .activity-item:not(:last-child) { border-bottom: 1px solid var(--border-color); }
    .activity-icon {
      width: 32px; height: 32px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background-color: #d1fae5; color: #047857;
    }
    .activity-text { flex-grow: 1; color: var(--text-secondary); }
    .activity-text strong { color: var(--text-primary); font-weight: 500; }
  `;
  
  firstUpdated() {
    this._initializeCharts();
  }
  
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('tasks')) {
      this._updateAllCharts();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    Object.values(this.charts).forEach(chart => chart.destroy());
    this.charts = {};
  }

  private _initializeCharts() {
    this._renderActivityChart();
    this._renderStatusChart();
    this._renderPriorityChart();
    this._renderCompletionRateChart();
  }
  
  private _updateAllCharts() {
    if (this.charts.activity) this.charts.activity.updateSeries([{ data: this._getActivityData() }]);
    if (this.charts.status) this.charts.status.updateOptions(this._getStatusChartOptions());
    if (this.charts.priority) this.charts.priority.updateOptions(this._getPriorityChartOptions());
    if (this.charts.completion) this.charts.completion.updateSeries(this._getCompletionRateData());
  }

  private _getActivityData = (): number[] => {
    const seriesData = Array(7).fill(0);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    weekAgo.setHours(0, 0, 0, 0);
    this.tasks.forEach(task => {
      if (task.createdAt) {
        const taskDate = task.createdAt.toDate();
        if (taskDate >= weekAgo && taskDate <= today) {
          const dayIndex = (taskDate.getDay() + 6) % 7;
          seriesData[dayIndex]++;
        }
      }
    });
    return seriesData;
  };

  private _getStatusChartOptions(): ApexOptions {
    const statuses: Record<Task['status'], number> = { todo: 0, inprogress: 0, review: 0, done: 0 };
    this.tasks.forEach(task => { statuses[task.status]++; });
    
    return {
      series: [{ data: Object.values(statuses) }],
      chart: { type: 'bar', height: 350, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 4, horizontal: true, distributed: true } },
      dataLabels: { enabled: false },
      xaxis: { categories: ['К выполнению', 'В работе', 'На проверке', 'Готово'], labels: { style: { colors: 'var(--text-secondary)' } } },
      yaxis: { labels: { style: { colors: 'var(--text-secondary)' } } },
      colors: ['#3b82f6', '#f97316', '#8b5cf6', '#10b981'],
      legend: { show: false },
      grid: { borderColor: 'var(--border-color)', strokeDashArray: 4 },
      tooltip: { theme: document.body.classList.contains('dark') ? 'dark' : 'light' }
    };
  }

  private _getPriorityChartOptions(): ApexOptions {
    const priorities: Record<Task['priority'], number> = { high: 0, medium: 0, low: 0 };
    this.tasks.forEach(task => { priorities[task.priority]++; });

    return {
      series: Object.values(priorities),
      chart: { type: 'donut', height: 350, background: 'transparent' },
      labels: ['Высокий', 'Средний', 'Низкий'],
      colors: ['#ef4444', '#f97316', '#10b981'],
      legend: { position: 'bottom', labels: { colors: 'var(--text-secondary)' } },
      dataLabels: { enabled: true, style: { colors: ['var(--text-light)'] }, dropShadow: { enabled: false } },
      tooltip: { theme: document.body.classList.contains('dark') ? 'dark' : 'light', y: { formatter: (val) => `${val} задач` } }
    };
  }

  private _getCompletionRateData = (): number[] => {
    const total = this.tasks.length;
    if (total === 0) return [0];
    const done = this.tasks.filter(t => t.status === 'done').length;
    return [Math.round((done / total) * 100)];
  };

  private _renderActivityChart() {
    const container = this.shadowRoot?.querySelector('#activity-chart');
    if (!container) return;
    const options: ApexOptions = {
      chart: { type: 'area', height: 350, toolbar: { show: false }, zoom: { enabled: false } },
      series: [{ name: "Создано задач", data: this._getActivityData() }],
      xaxis: { categories: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], labels: { style: { colors: 'var(--text-secondary)' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { style: { colors: 'var(--text-secondary)' } } },
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      colors: ['var(--accent-primary)'],
      fill: { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0.1 } },
      grid: { borderColor: 'var(--border-color)', strokeDashArray: 4 },
      tooltip: { theme: document.body.classList.contains('dark') ? 'dark' : 'light' }
    };
    this.charts.activity = new ApexCharts(container, options);
    this.charts.activity.render();
  }

  private _renderStatusChart() {
    const container = this.shadowRoot?.querySelector('#status-chart');
    if (!container) return;
    this.charts.status = new ApexCharts(container, this._getStatusChartOptions());
    this.charts.status.render();
  }

  private _renderPriorityChart() {
    const container = this.shadowRoot?.querySelector('#priority-chart');
    if (!container) return;
    this.charts.priority = new ApexCharts(container, this._getPriorityChartOptions());
    this.charts.priority.render();
  }

  private _renderCompletionRateChart() {
    const container = this.shadowRoot?.querySelector('#completion-chart');
    if (!container) return;
    const options: ApexOptions = {
      chart: { type: 'radialBar', height: 350 },
      series: this._getCompletionRateData(),
      // ИСПРАВЛЕНИЕ: Добавляем 'labels' на верхний уровень для отображения текста
      labels: ['Выполнено'],
      plotOptions: {
        radialBar: {
          hollow: { margin: 15, size: '70%' },
          dataLabels: {
            name: { 
              show: true, 
              // ИСПРАВЛЕНИЕ: Убираем некорректное свойство 'label', так как текст берется из labels выше
              color: 'var(--text-secondary)' 
            },
            value: { 
              fontSize: '2.5rem', 
              fontWeight: 700, 
              color: 'var(--text-primary)', 
              offsetY: 10, 
              formatter: (val) => `${val}%` 
            }
          }
        }
      },
      fill: { colors: ['var(--accent-primary)'] },
      stroke: { lineCap: 'round' },
    };
    this.charts.completion = new ApexCharts(container, options);
    this.charts.completion.render();
  }

  render() {
    const totalTasks = this.tasks.length;
    const doneTasks = this.tasks.filter(t => t.status === 'done').length;
    const overdueTasks = this.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
    const inProgressTasks = this.tasks.filter(t => t.status === 'inprogress').length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const recentCompleted = this.tasks.filter(t => t.status === 'done').slice(0, 5);

    return html`
      <div class="page-header"><h1>Аналитика по задачам</h1></div>
      <div class="analytics-grid">
        <div class="stat-card kpi-total"><div class="stat-header">Всего задач</div><div class="stat-value">${totalTasks}</div></div>
        <div class="stat-card kpi-progress"><div class="stat-header">В работе</div><div class="stat-value">${inProgressTasks}</div></div>
        <div class="stat-card kpi-done"><div class="stat-header">Выполнено</div><div class="stat-value">${doneTasks}</div></div>
        <div class="stat-card kpi-overdue"><div class="stat-header">Просрочено</div><div class="stat-value">${overdueTasks}</div></div>
        <div class="stat-card kpi-completion"><div class="stat-header">Процент выполнения</div><div class="stat-value">${completionRate}%</div></div>

        <div class="chart-container activity"><h4 class="chart-title">Активность за неделю</h4><div id="activity-chart"></div></div>
        <div class="chart-container status"><h4 class="chart-title">Задачи по статусу</h4><div id="status-chart"></div></div>
        <div class="chart-container priority"><h4 class="chart-title">Приоритеты</h4><div id="priority-chart"></div></div>
        
        <div class="chart-container completion-rate"><h4 class="chart-title">Общий прогресс</h4><div id="completion-chart"></div></div>
        <div class="chart-container recent-activity">
          <h4 class="chart-title">Лента активности</h4>
          <ul class="activity-list">
            ${recentCompleted.length > 0 ? recentCompleted.map(task => html`
              <li class="activity-item">
                <div class="activity-icon"><i class="fas fa-check"></i></div>
                <div class="activity-text">Задача <strong>${task.title}</strong> была выполнена.</div>
              </li>
            `) : html`<p style="color: var(--text-secondary);">Нет выполненных задач.</p>`}
          </ul>
        </div>
      </div>
    `;
  }
}
