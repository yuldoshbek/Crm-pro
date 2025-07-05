// src/crm-app.ts
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { auth } from './firebase-init';
import { signOut } from 'firebase/auth';
import { choose } from 'lit/directives/choose.js';
import { addDoc, updateDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase-init';

import type { Task } from './task-board';
import './task-board';
import './modal-dialog';
import './task-form';

@customElement('crm-app')
export class CrmApp extends LitElement {
  @state() private _modalContent: { task?: Task } | null = null;

  static styles = css`
    .app-shell { width: 100%; max-width: 1400px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background-color: white; border-radius: 12px; box-shadow: var(--shadow-md); margin-bottom: 2rem; }
    h1 { font-size: 1.875rem; font-weight: bold; margin: 0; }
    .controls { display: flex; align-items: center; gap: 1rem; }
    .user-info { text-align: right; }
    .user-email { font-weight: 500; font-size: 0.875rem; color: var(--text-secondary); }
    .logout-btn { background: none; border: none; color: var(--accent-danger); cursor: pointer; font-size: 0.875rem; margin-top: 0.25rem; font-weight: 500; }
    .add-task-btn { background-color: var(--accent-primary); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 0.5rem; }
  `;
  
  // Открывает модальное окно для новой или существующей задачи
  private _openTaskModal(e?: CustomEvent<{ task?: Task }>) {
    this._modalContent = { task: e?.detail.task };
  }

  // Обрабатывает сохранение данных из формы
  private async _handleTaskSave(e: CustomEvent) {
    const taskData = e.detail;
    const collectionPath = 'tasks_assistant';
    
    const dataToSave: { [key: string]: any } = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      dueDate: taskData.dueDate, // <-- Вот правильное поле
    };

    // Удаляем поле, если дата не была выбрана, чтобы не засорять базу
    if (!dataToSave.dueDate) {
      delete dataToSave.dueDate;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("Пользователь не авторизован");

      if (taskData.id) {
        // Редактируем существующую задачу
        const taskRef = doc(db, collectionPath, taskData.id);
        await updateDoc(taskRef, dataToSave);
      } else {
        // Создаем новую задачу
        const fullData = { ...dataToSave, userId: userId, createdAt: serverTimestamp() };
        await addDoc(collection(db, collectionPath), fullData);
      }
      this._modalContent = null; // Закрываем модальное окно
    } catch (error) {
      console.error("Ошибка сохранения задачи:", error);
      alert("Не удалось сохранить задачу.");
    }
  }

  // Обрабатывает удаление задачи
  private async _handleTaskDelete(e: CustomEvent<{ id: string }>) {
      const collectionPath = 'tasks_assistant';
      try {
        await deleteDoc(doc(db, collectionPath, e.detail.id));
        this._modalContent = null;
      } catch (error) {
        console.error("Ошибка удаления задачи:", error);
        alert("Не удалось удалить задачу.");
      }
  }

  render() {
    return html`
      <div class="app-shell">
        <header>
          <h1>Дашборд Ассистента</h1>
          <div class="controls">
            <div class="user-info">
              <div class="user-email">${auth.currentUser?.email}</div>
              <button class="logout-btn" @click=${() => signOut(auth)}>Выйти</button>
            </div>
            <button class="add-task-btn" @click=${() => this._openTaskModal()}>
              <i class="fas fa-plus"></i>
              <span>Задача</span>
            </button>
          </div>
        </header>

        <main>
          <task-board 
            collectionPath="tasks_assistant" 
            @open-task-modal=${this._openTaskModal}>
          </task-board>
        </main>
        
        ${this._modalContent ? html`
          <modal-dialog @close=${() => this._modalContent = null}>
            <h2 slot="title">
              ${this._modalContent.task ? 'Редактировать задачу' : 'Новая задача'}
            </h2>
            <task-form 
              .task=${this._modalContent.task} 
              @save-task=${this._handleTaskSave}
              @delete-task=${this._handleTaskDelete}>
            </task-form>
          </modal-dialog>
        ` : ''}
      </div>
    `;
  }
}
