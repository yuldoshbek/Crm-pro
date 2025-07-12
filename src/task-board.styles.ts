// src/task-board.styles.ts
import { css } from 'lit';

export const taskBoardStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-shrink: 0;
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
    transition: background-color 0.2s ease;
  }
  .add-task-btn:hover {
    filter: brightness(1.1);
  }

  .board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    flex-grow: 1;
    overflow-x: auto;
  }

  .column {
    background-color: var(--bg-main);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.25rem 1rem;
    border-bottom: 2px solid var(--border-color);
  }
  .column-title {
    font-weight: 600;
    color: var(--text-primary);
  }
  .task-count {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
    background-color: var(--bg-hover);
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
  }
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1rem;
    flex-grow: 1;
    overflow-y: auto;
  }

  .task-card {
    background-color: var(--bg-card);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: var(--shadow-sm);
    border-left: 4px solid transparent;
    cursor: pointer;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .task-card:hover {
    box-shadow: var(--shadow-md);
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
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-weight: 500;
    text-transform: capitalize;
  }
  .priority-high {
    background-color: #fee2e2;
    color: #b91c1c;
  }
  .priority-medium {
    background-color: #ffedd5;
    color: #c2410c;
  }
  .priority-low {
    background-color: #d1fae5;
    color: #047857;
  }
  .due-date {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;