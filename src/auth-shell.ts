import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { auth } from './firebase-init';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

@customElement('auth-shell')
export class AuthShell extends LitElement {
  @state() private isLoginMode = true;
  @state() private errorMessage = '';
  @state() private isLoading = false;

  static styles = css`
    .auth-form {
      width: 100%; max-width: 400px; background-color: var(--bg-card);
      padding: 2.5rem; border-radius: 12px; box-shadow: var(--shadow-md);
    }
    h2 { font-size: 1.875rem; font-weight: bold; text-align: center; margin-bottom: 0.5rem; }
    p { text-align: center; color: var(--text-secondary); margin-bottom: 2rem; }
    input { width: 100%; padding: 0.75rem; margin-top: 0.25rem; margin-bottom: 1rem; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box; }
    button { width: 100%; padding: 0.875rem; border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; transition: background-color 0.2s; }
    button:disabled { background-color: #a0aec0; cursor: not-allowed; }
    .login-btn { background-color: var(--accent-primary); }
    .login-btn:hover:not(:disabled) { background-color: #2b6cb0; }
    .signup-btn { background-color: #38a169; }
    .signup-btn:hover:not(:disabled) { background-color: #2f855a; }
    .error { color: var(--accent-danger); margin-top: 1rem; text-align: center; font-size: 0.875rem; }
    .toggle-link { display: block; text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: var(--accent-primary); cursor: pointer; }
    .toggle-link:hover { text-decoration: underline; }
  `;

  async _handleAuth(e: Event, isLogin: boolean) {
    e.preventDefault();
    this.isLoading = true;
    this.errorMessage = '';
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // onAuthStateChanged в main.ts обработает успешный вход
    } catch (error: any) {
      this.errorMessage = 'Произошла ошибка. Проверьте данные и попробуйте снова.';
    } finally {
      this.isLoading = false;
    }
  }

  _toggleMode(e: Event) {
    e.preventDefault();
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  render() {
    return html`
      <div class="auth-form">
        <h2>CRM Pro</h2>
        <p>${this.isLoginMode ? 'Вход в систему' : 'Регистрация'}</p>
        <form @submit=${(e: Event) => this._handleAuth(e, this.isLoginMode)}>
          <div>
            <label for="email">Email</label>
            <input id="email" name="email" type="email" required>
          </div>
          <div>
            <label for="password">Пароль</label>
            <input id="password" name="password" type="password" required>
          </div>
          <button type="submit" class=${this.isLoginMode ? 'login-btn' : 'signup-btn'} ?disabled=${this.isLoading}>
            ${this.isLoading ? 'Загрузка...' : (this.isLoginMode ? 'Войти' : 'Создать аккаунт')}
          </button>
        </form>
        ${this.errorMessage ? html`<div class="error">${this.errorMessage}</div>` : ''}
        <a href="#" class="toggle-link" @click=${this._toggleMode}>
          ${this.isLoginMode ? 'У меня еще нет аккаунта' : 'У меня уже есть аккаунт'}
        </a>
      </div>
    `;
  }
}