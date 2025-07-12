// src/task-board.styles.ts
import { css } from 'lit';

export const taskBoardStyles = css`
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
  }
  .add-task-btn {
    background-color: #4f46e5;
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
    background-color: #4338ca;
  }

  .board {
    display: grid;
    /* Умная сетка, которая адаптируется под ширину экрана */
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    align-items: start;
  }
  .column {
    background-color: #f7f8fc;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.25rem;
  }
  .column-title {
    font-weight: 600;
    color: var(--text-primary);
  }
  .task-count {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
    background-color: #eef2ff;
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
  }
`;