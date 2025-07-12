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

  // Полностью переработанные стили для нового, темного и технологичного дашборда
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
      background-color: #1f2937; /* Темный фон для карточек, как в референсах */
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #374151; /* Едва заметная граница */
    }
    .stat-card {
      grid-column: span 12 / span 12;
    }
    @media (min-width: 640px) { .stat-card { grid-column: span 6 / span 6; } }
    @media (min-width: 1280px) { .stat-card { grid-column: span 3 / span 3; } }

    .stat-header {
      color: #9ca3af;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #f9fafb;
    }
    .chart-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #f9fafb;
      margin-bottom: 1.5rem;
    }

    /* Адаптивная сетка для графиков */
    .chart-container.activity { grid-column: span 12 / span 12; }
    .chart-container.status { grid-column: span 12 / span 12; }
    .chart-container.priority { grid-column: span 12 / span 12; }
    .chart-container.completion { grid-column: span 12 / span 12; }

    @media (min-width: 768px) {
      .chart-container.status { grid-column: span 6 / span 6; }
      .chart-container.completion { grid-column: span 6 / span 6; }
    }
    @media (min-width: 1280px) {
      .chart-container.activity { grid-column: span 12 / span 12; }
      .chart-container.status { grid-column: span 5 / span 5; }
      .chart-container.priority { grid-column: span 7 / span 7; }
      .chart-container.completion { grid-column: span 12 / span 12; }
    }
  `;
  
  firstUpdated() {
    this._initializeCharts();
  }
  
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('tasks')) {
      this._updateAllCharts();
    }
  }

  private _initializeCharts() {
    this._renderActivityChart();
    this._renderStatusChart();
    this._renderPriorityChart();
    this._renderCompletionRateChart();
  }
  
  private _updateAllCharts() {
    if (this.charts.activity) this.charts.activity.updateSeries([{ data: this._getActivityData() }]);
    if (this.charts.status) this.charts.status.updateSeries(this._getStatusData());
    if (this.charts.priority) this.charts.priority.updateSeries([{ data: this._getPriorityData() }]);
    if (this.charts.completion) this.charts.completion.updateSeries(this._getCompletionRateData());
  }

  // --- ИСПРАВЛЕННЫЕ методы подготовки данных ---
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

  private _getStatusData = (): number[] => {
    const statuses: Record<Task['status'], number> = { todo: 0, inprogress: 0, review: 0, done: 0 };
    this.tasks.forEach(task => { statuses[task.status]++; });
    return Object.values(statuses);
  };

  private _getPriorityData = (): number[] => {
    const priorities: Record<Task['priority'], number> = { high: 0, medium: 0, low: 0 };
    this.tasks.forEach(task => { priorities[task.priority]++; });
    return Object.values(priorities);
  };

  private _getCompletionRateData = (): number[] => {
    const total = this.tasks.length;
    if (total === 0) return [0];
    const done = this.tasks.filter(t => t.status === 'done').length;
    return [Math.round((done / total) * 100)];
  };

  // --- ПЕРЕРАБОТАННЫЕ методы рендеринга графиков ---
  private _renderActivityChart() {
    const container = this.shadowRoot?.querySelector('#activity-chart');
    if (!container) return;
    const options: ApexOptions = {
      chart: { type: 'area', height: 350, toolbar: { show: false }, zoom: { enabled: false }, background: 'transparent' },
      series: [{ name: "Создано задач", data: this._getActivityData() }],
      xaxis: { categories: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], labels: { style: { colors: '#9ca3af' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { style: { colors: '#9ca3af' } } },
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      colors: ['#00E396'],
      fill: { type: 'gradient', gradient: { shade: 'dark', type: "vertical", shadeIntensity: 0.5, gradientToColors: undefined, inverseColors: true, opacityFrom: 0.8, opacityTo: 0.2, stops: [0, 90, 100] } },
      grid: { borderColor: '#374151', strokeDashArray: 5 },
      tooltip: { theme: 'dark' }
    };
    this.charts.activity = new ApexCharts(container, options);
    this.charts.activity.render();
  }

  private _renderStatusChart() {
    const container = this.shadowRoot?.querySelector('#status-chart');
    if (!container) return;
    const options: ApexOptions = {
      chart: { type: 'donut', height: 350, background: 'transparent' },
      series: this._getStatusData(),
      labels: ['К выполнению', 'В работе', 'На проверке', 'Готово'],
      colors: ['#008FFB', '#FEB019', '#775DD0', '#00E396'],
      legend: { position: 'bottom', labels: { colors: '#f9fafb' } },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'Всего', color: '#9ca3af', formatter: (w) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString() } } } } },
      tooltip: { theme: 'dark', y: { formatter: (val) => `${val} задач` } }
    };
    this.charts.status = new ApexCharts(container, options);
    this.charts.status.render();
  }

  private _renderPriorityChart() {
    const container = this.shadowRoot?.querySelector('#priority-chart');
    if (!container) return;
    const options: ApexOptions = {
      chart: { type: 'bar', height: 350, toolbar: { show: false }, background: 'transparent' },
      series: [{ name: 'Задачи', data: this._getPriorityData() }],
      plotOptions: { bar: { borderRadius: 4, horizontal: true, distributed: true } },
      dataLabels: { enabled: false },
      xaxis: { categories: ['Высокий', 'Средний', 'Низкий'], labels: { style: { colors: '#9ca3af' } } },
      yaxis: { labels: { show: false } },
      colors: ['#FF4560', '#FEB019', '#00E396'],
      legend: { show: false },
      grid: { borderColor: '#374151', strokeDashArray: 5, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
      tooltip: { theme: 'dark' }
    };
    this.charts.priority = new ApexCharts(container, options);
    this.charts.priority.render();
  }

  private _renderCompletionRateChart() {
    const container = this.shadowRoot?.querySelector('#completion-chart');
    if (!container) return;
    const options: ApexOptions = {
      chart: { type: 'radialBar', height: 350, background: 'transparent' },
      series: this._getCompletionRateData(),
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: { margin: 15, size: '70%', background: 'transparent' },
          dataLabels: {
            name: { show: false },
            value: { fontSize: '2.5rem', fontWeight: 700, color: '#f9fafb', offsetY: 10, formatter: (val) => `${val}%` }
          }
        }
      },
      fill: { type: 'gradient', gradient: { shade: 'dark', type: 'horizontal', shadeIntensity: 0.5, gradientToColors: ['#00E396'], inverseColors: false, opacityFrom: 1, opacityTo: 1, stops: [0, 100] } },
      stroke: { lineCap: 'round' },
      labels: ['Выполнено'],
    };
    this.charts.completion = new ApexCharts(container, options);
    this.charts.completion.render();
  }

  render() {
    const totalTasks = this.tasks.length;
    const doneTasks = this.tasks.filter(t => t.status === 'done').length;
    const overdueTasks = this.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
    const inProgressTasks = this.tasks.filter(t => t.status === 'inprogress').length;

    return html`
      <div class="page-header"><h1>Аналитика по задачам</h1></div>
      <div class="analytics-grid">
        <div class="stat-card">
          <div class="stat-header">Всего задач</div>
          <div class="stat-value">${totalTasks}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">В работе</div>
          <div class="stat-value">${inProgressTasks}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">Выполнено</div>
          <div class="stat-value">${doneTasks}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">Просрочено</div>
          <div class="stat-value">${overdueTasks}</div>
        </div>

        <div class="chart-container activity">
          <h4 class="chart-title">Активность за неделю</h4>
          <div id="activity-chart"></div>
        </div>
        <div class="chart-container status">
          <h4 class="chart-title">Задачи по статусу</h4>
          <div id="status-chart"></div>
        </div>
        <div class="chart-container priority">
          <h4 class="chart-title">Распределение по приоритетам</h4>
          <div id="priority-chart"></div>
        </div>
        <div class="chart-container completion">
          <h4 class="chart-title">Процент выполнения</h4>
          <div id="completion-chart"></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'task-analytics': TaskAnalytics;
  }
}
