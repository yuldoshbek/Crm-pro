// src/mode-selector.ts
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('mode-selector')
export class ModeSelector extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 100vh;
      background-color: var(--bg-main);
      padding: 2rem;
      box-sizing: border-box;
    }

    .selector-panel {
      width: 100%;
      max-width: 800px;
      text-align: center;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin-bottom: 3rem;
    }

    .mode-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 768px) {
      .mode-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .mode-card {
      background-color: var(--bg-card);
      border-radius: 16px;
      padding: 2.5rem;
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      text-align: left;
    }

    .mode-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-lg);
      border-color: var(--accent-primary);
    }

    .mode-card .icon {
      font-size: 2.5rem;
      color: var(--accent-primary);
      margin-bottom: 1.5rem;
    }

    .mode-card h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .mode-card .description {
      font-size: 1rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }
  `;

  private _selectMode(mode: 'assistant' | 'projects') {
    this.dispatchEvent(new CustomEvent('select-mode', {
      detail: { mode },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="selector-panel">
        <h1>Добро пожаловать!</h1>
        <p>Выберите режим, в котором хотите продолжить работу.</p>

        <div class="mode-grid">
          <div class="mode-card" @click=${() => this._selectMode('assistant')}>
            <div class="icon"><i class="fas fa-user-circle"></i></div>
            <h2>Личный ассистент</h2>
            <p class="description">Ваше приватное пространство для управления личными задачами, финансами и ресурсами. Данные видны только вам.</p>
          </div>

          <div class="mode-card" @click=${() => this._selectMode('projects')}>
            <div class="icon"><i class="fas fa-users"></i></div>
            <h2>Проекты</h2>
            <p class="description">Пространство для совместной работы. Создавайте проекты, приглашайте участников и управляйте задачами вместе с командой.</p>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mode-selector': ModeSelector;
  }
}
