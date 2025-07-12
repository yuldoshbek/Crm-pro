// src/auth-shell.ts
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { auth } from './firebase-init.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

@customElement('auth-shell')
export class AuthShell extends LitElement {
    @state() private isLoginMode = true;
    @state() private errorMessage = '';
    @state() private isLoading = false;

    static styles = css`
        .auth-container { 
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: var(--bg-main);
        }
        .form-panel {
            width: 100%; 
            max-width: 400px; 
            background-color: var(--bg-card); 
            padding: 2.5rem; 
            border-radius: 12px; 
            box-shadow: var(--shadow-lg); 
            text-align: center;
        }
        h2 { 
            font-size: 1.875rem; 
            font-weight: bold; 
            margin-bottom: 0.5rem; 
            color: var(--text-primary);
        }
        p { 
            color: var(--text-secondary); 
            margin-bottom: 2rem; 
        }
        label { 
            display: block; 
            text-align: left; 
            font-size: 0.875rem; 
            font-weight: 500; 
            margin-bottom: 0.25rem; 
        }
        input { 
            width: 100%; 
            padding: 0.75rem; 
            margin-top: 0.25rem; 
            margin-bottom: 1rem; 
            border: 1px solid var(--border-color); 
            border-radius: 8px; 
            box-sizing: border-box; 
            background-color: var(--bg-main);
            color: var(--text-primary);
        }
        button { 
            width: 100%; 
            padding: 0.875rem; 
            border: none; 
            border-radius: 8px; 
            color: white; 
            font-weight: bold; 
            cursor: pointer; 
            transition: background-color 0.2s;
            background-color: var(--accent-primary);
        }
        button:disabled { 
            opacity: 0.6;
            cursor: not-allowed; 
        }
        button:hover:not(:disabled) {
            filter: brightness(1.1);
        }
        .error { 
            color: var(--accent-danger); 
            margin-top: 1rem; 
            font-size: 0.875rem; 
            min-height: 1.25rem; 
        }
        .toggle-link { 
            display: block; 
            margin-top: 1.5rem; 
            font-size: 0.875rem; 
            color: var(--accent-primary); 
            cursor: pointer;
            font-weight: 500;
        }
    `;

    private async _handleAuth(e: Event) {
        e.preventDefault();
        this.isLoading = true;
        this.errorMessage = '';
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            if (this.isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // onAuthStateChanged в main.ts автоматически обработает успешный вход
        } catch (error: any) { 
            console.error("Ошибка аутентификации:", error);
            this.errorMessage = 'Произошла ошибка. Проверьте данные или попробуйте позже.'; 
        } finally { 
            this.isLoading = false; 
        }
    }

    private _toggleMode(e: Event) { 
        e.preventDefault(); 
        this.isLoginMode = !this.isLoginMode; 
        this.errorMessage = ''; 
    }

    render() {
        return html`
            <div class="auth-container">
                <div class="form-panel">
                    <h2>CRM Pro</h2>
                    <p>${this.isLoginMode ? 'Вход в систему' : 'Создание аккаунта'}</p>
                    <form @submit=${this._handleAuth}>
                        <div>
                            <label for="email">Email</label>
                            <input id="email" name="email" type="email" required autocomplete="email">
                        </div>
                        <div>
                            <label for="password">Пароль</label>
                            <input id="password" name="password" type="password" minlength="6" required autocomplete="current-password">
                        </div>
                        <button type="submit" ?disabled=${this.isLoading}>
                            ${this.isLoading ? 'Загрузка...' : (this.isLoginMode ? 'Войти' : 'Создать аккаунт')}
                        </button>
                    </form>
                    <div class="error">${this.errorMessage}</div>
                    <a href="#" class="toggle-link" @click=${this._toggleMode}>
                        ${this.isLoginMode ? 'У меня еще нет аккаунта' : 'У меня уже есть аккаунт'}
                    </a>
                </div>
            </div>
        `;
    }
}