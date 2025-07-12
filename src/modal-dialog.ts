// src/modal-dialog.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('modal-dialog')
export class ModalDialog extends LitElement {
    static styles = css`
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            /* Анимация появления */
            animation: fadeIn 0.3s ease;
        }

        .panel {
            background-color: var(--bg-card);
            padding: 1.5rem 2rem;
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            width: 100%;
            max-width: 600px;
            /* Анимация появления */
            animation: slideInUp 0.3s ease;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1rem;
        }
        
        /* Стили для заголовка, который будет вставлен через <slot> */
        ::slotted(h2) {
            margin: 0;
            font-size: 1.5rem;
            color: var(--text-primary);
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 2rem;
            line-height: 1;
            cursor: pointer;
            color: var(--text-secondary);
        }
        .close-btn:hover {
            color: var(--text-primary);
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;

    private _close() {
        // Генерируем событие, чтобы родительский компонент знал, что нужно закрыть окно
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    }

    render() {
        return html`
            <div class="overlay" @click=${this._close}>
                <div class="panel" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="header">
                        <slot name="title"></slot>
                        <button class="close-btn" @click=${this._close}>&times;</button>
                    </div>
                    <div class="content">
                        <slot></slot>
                    </div>
                </div>
            </div>
        `;
    }
}