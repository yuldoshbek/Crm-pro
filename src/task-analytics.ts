// src/task-analytics.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { Task } from './types.js';

@customElement('task-analytics')
export class TaskAnalytics extends LitElement {
  @property({ attribute: false })
  tasks: Task[] = [];

  @state()
  private charts: { [key: string]: ApexCharts } = {};

  static styles = css`
    .analytics-container {
      background-color: #fff;
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      margin-bottom: 2rem;
    }
    h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.25rem;
      color: var(--text-primary);
      font-weight: 600;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    .stat-card {
      background-color: #f9fafb;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border-color);
    }
    .stat-value {
      font-size: 2.25rem;
      font-weight: 700;
      line-height: 1.2;
      color: var(--accent-primary);
    }
    .stat-label {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
    
    .charts-grid {
      margin-top: 2rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    .chart-container {
      border: 1px solid var(--border-color);
      padding: 1.5rem;
      border-radius: 12px;
    }
    .chart-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
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
    this._renderStatusChart();
    this._renderPriorityChart();
    this._renderActivityChart();
  }
  
  private _updateAllCharts() {
    // Уничтожаем старые инстансы, чтобы избежать проблем с кэшем
    Object.values(this.charts).forEach(chart => chart.destroy());
    this.charts = {};

    // Создаем новые, чистые графики
    this._renderStatusChart();
    this._renderPriorityChart();
    this._renderActivityChart();
  }

  private _renderStatusChart() {
    const container = this.shadowRoot?.querySelector('#status-chart');
    if (!container) return;
    const options = this._getStatusChartOptions();
    this.charts.status = new ApexCharts(container, options);
    this.charts.status.render();
  }
  
  private _getStatusChartOptions(): ApexOptions {
    const statuses = { todo: 0, inprogress: 0, review: 0, done: 0 };
    this.tasks.forEach(task => { statuses[task.status]++; });
    return {
      chart: { type: 'bar', height: 250, toolbar: { show: false } },
      series: [{ name: 'Задачи', data: Object.values(statuses) }],
      xaxis: { categories: ['К выполнению', 'В работе', 'На проверке', 'Готово'] },
      colors: ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'],
      plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '50%' } },
      dataLabels: { enabled: false }
    };
  }

  private _renderPriorityChart() {
    const container = this.shadowRoot?.querySelector('#priority-chart');
    if (!container) return;
    const options = this._getPriorityChartOptions();
    this.charts.priority = new ApexCharts(container, options);
    this.charts.priority.render();
  }
  
  private _getPriorityChartOptions(): ApexOptions {
    const priorities = { high: 0, medium: 0, low: 0 };
    this.tasks.forEach(task => { priorities[task.priority]++; });
    return {
      chart: { type: 'donut', height: 250 },
      series: Object.values(priorities),
      labels: ['Высокий', 'Средний', 'Низкий'],
      colors: ['#ef4444', '#f97316', '#34d399'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(0)}%` },
    };
  }

  private _renderActivityChart() {
    const container = this.shadowRoot?.querySelector('#activity-chart');
    if (!container) return;
    const options = this._getActivityChartOptions();
    this.charts.activity = new ApexCharts(container, options);
    this.charts.activity.render();
  }

  private _getActivityChartOptions(): ApexOptions {
    const seriesData = Array(7).fill(0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    weekAgo.setHours(0, 0, 0, 0);

    this.tasks.forEach(task => {
        const taskDate = new Date(task.createdAt.seconds * 1000);
        if (taskDate >= weekAgo && taskDate <= today) {
            const dayIndex = (taskDate.getDay() + 6) % 7; // Пн = 0, ... Вс = 6
            seriesData[dayIndex]++;
        }
    });
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    return {
      chart: { type: 'area', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
      series: [{ name: "Задач создано", data: seriesData }],
      xaxis: { categories: days },
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      colors: ['#10b981'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100]
        }
      },
    };
  }

  render() {
    const totalTasks = this.tasks.length;
    const doneTasks = this.tasks.filter(t => t.status === 'done').length;
    const overdueTasks = this.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
    
    const weekAgoTimestamp = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
    const doneLast7Days = this.tasks.filter(t => {
      const isDone = t.status === 'done';
      // Используем createdAt, так как у нас нет поля completedAt
      const completionTimestamp = (t.createdAt?.seconds || 0) * 1000;
      return isDone && completionTimestamp >= weekAgoTimestamp;
    }).length;

    return html`
      <div class="analytics-container">
        <h3>Аналитика</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${totalTasks}</div>
            <div class="stat-label">Всего задач</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: #ef4444;">${overdueTasks}</div>
            <div class="stat-label">Просрочено</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: #10b981;">${doneTasks}</div>
            <div class="stat-label">Выполнено</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${doneLast7Days}</div>
            <div class="stat-label">Готово за 7 дней</div>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-container">
            <h4 class="chart-title">Задачи по статусу</h4>
            <div id="status-chart"></div>
          </div>
          <div class="chart-container">
            <h4 class="chart-title">Задачи по приоритету</h4>
            <div id="priority-chart"></div>
          </div>
          <div class="chart-container">
            <h4 class="chart-title">Активность за неделю</h4>
            <div id="activity-chart"></div>
          </div>
        </div>
      </div>
    `;
  }
}