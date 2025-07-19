// src/task-board.styles.ts
import { css } from 'lit';

export const taskBoardStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    /* Занимаем всю доступную высоту (viewport минус padding родителя) */
    height: calc(100vh - 4rem); 
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-shrink: 0; /* Заголовок не должен сжиматься */
  }
  .page-header h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
  }
  .add-task-btn {
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
  .add-task-btn:hover {
    filter: brightness(1.1);
    box-shadow: var(--shadow-md);
  }

  .board {
    display: grid;
    /* Создаем 4 колонки одинаковой ширины */
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    flex-grow: 1;
    overflow-x: auto; /* Горизонтальный скролл для маленьких экранов */
    min-height: 0; /* Важно для правильной работы flex/grid */
  }

  .column {
    background-color: var(--bg-main); /* Фон колонок теперь основной, а не карточный */
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }

  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }
  .column-title {
    font-weight: 600;
    font-size: 1rem;
    color: var(--text-primary);
  }
  .task-count {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    background-color: var(--bg-hover);
    padding: 0.2rem 0.6rem;
    border-radius: 12px; /* Более скругленный */
  }
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    flex-grow: 1;
    overflow-y: auto; /* Вертикальный скролл внутри колонки */
  }

  .task-card {
    background-color: var(--bg-card);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: var(--shadow-sm);
    border-left: 4px solid transparent; /* Основа для цветного индикатора */
    cursor: pointer;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .task-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  /* Стиль для перетаскиваемой карточки */
  .task-card.dragging {
    opacity: 0.8;
    box-shadow: var(--shadow-lg);
    transform: rotate(3deg) translateY(-5px);
  }

  .task-title {
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
  }
  .task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
  .priority-indicator {
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    font-weight: 600;
    text-transform: capitalize;
    font-size: 0.75rem;
  }
  
  /* Цветные индикаторы приоритета */
  .priority-high {
    background-color: #fee2e2;
    color: #b91c1c;
  }
  .task-card.priority-high {
    border-left-color: #ef4444;
  }

  .priority-medium {
    background-color: #ffedd5;
    color: #c2410c;
  }
  .task-card.priority-medium {
    border-left-color: #f97316;
  }

  .priority-low {
    background-color: #d1fae5;
    color: #047857;
  }
  .task-card.priority-low {
    border-left-color: #10b981;
  }

  .due-date {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;
