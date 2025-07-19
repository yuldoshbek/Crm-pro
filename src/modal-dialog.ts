// src/modal-dialog.ts
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

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
            /* Улучшенная анимация появления фона */
            animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .panel {
            background-color: var(--bg-card);
            padding: 0; /* Убираем внутренний padding, чтобы заголовок и контент управляли им */
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            width: 100%;
            max-width: 600px;
            /* Улучшенная анимация появления панели */
            animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            max-height: 90vh; /* Ограничиваем высоту для больших форм */
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0; /* Заголовок не должен сжиматься */
        }
        
        /* Стили для заголовка, который передается через <slot> */
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
            transition: color 0.2s ease;
        }
        .close-btn:hover {
            color: var(--text-primary);
        }

        .content {
            padding: 1.5rem 2rem;
            overflow-y: auto; /* Добавляем прокрутку для контента, если он не помещается */
        }

        /* Анимации определены в глобальном style.css, но дублируем на всякий случай */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideInUp {
            from { transform: translateY(50px) scale(0.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
    `;

    private _close() {
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
