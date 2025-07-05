import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('modal-dialog')
export class ModalDialog extends LitElement {
    static styles = css`
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .panel { background-color: white; padding: 1.5rem 2rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); width: 100%; max-width: 600px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .header ::slotted(h2) { margin: 0; font-size: 1.5rem; }
        .close-btn { background: none; border: none; font-size: 2rem; line-height: 1; cursor: pointer; color: #a0aec0; }
        .close-btn:hover { color: #4a5568; }
    `;

    private _close() { this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true })); }

    render() {
        return html`
            <div class="overlay" @click=${this._close}>
                <div class="panel" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="header">
                        <slot name="title"></slot>
                        <button class="close-btn" @click=${this._close}>&times;</button>
                    </div>
                    <div class="content"><slot></slot></div>
                </div>
            </div>
        `;
    }
}