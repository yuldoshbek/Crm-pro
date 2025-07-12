// src/test-query.ts
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase-init';

@customElement('test-query')
export class TestQuery extends LitElement {
  async runQuery() {
    console.log("Запускаю тестовый запрос...");
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.log("Пользователь не найден.");
      return;
    }
    
    const financesRef = collection(db, `users/${userId}/finances`);
    // Это тот самый запрос, которому нужен индекс
    const q = query(financesRef, orderBy('date', 'desc'));

    try {
      // Пытаемся выполнить запрос
      const querySnapshot = await getDocs(q);
      console.log("Запрос прошел успешно, найдено документов:", querySnapshot.size);
    } catch (error) {
      // Ловим ошибку и выводим ее в консоль
      console.error("ЗАПРОС ПРОВАЛИЛСЯ! Вот ошибка, которая нам нужна:", error);
      console.log("---");
      console.log("ПОЖАЛУЙСТА, НАЙДИТЕ В ОШИБКЕ ВЫШЕ ДЛИННУЮ ССЫЛКУ И НАЖМИТЕ НА НЕЕ.");
      console.log("---");
    }
  }

  render() {
    return html`
      <button @click=${this.runQuery} style="padding: 20px; font-size: 20px; background: red; color: white; border: none; cursor: pointer;">
        ЗАПУСТИТЬ ТЕСТОВЫЙ ЗАПРОС
      </button>
    `;
  }
}
