// src/task-form.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import type { Task, ChecklistItem, AttachedFile } from './types.js';
import { nanoid } from 'nanoid';
import { uploadFileToTask, deleteFileFromTask } from './firebase-service.js';

interface UploadProgress {
  fileName: string;
  progress: number;
}

@customElement('task-form')
export class TaskForm extends LitElement {
  @property({ attribute: false })
  task?: Task;
  
  @property({ type: String })
  workspaceId = '';

  @state()
  private _checklistItems: ChecklistItem[] = [];
  
  @state()
  private _attachedFiles: AttachedFile[] = [];
  @state()
  private _uploadingFiles: UploadProgress[] = [];

  @query('#file-input')
  private _fileInput!: HTMLInputElement;

  connectedCallback() {
    super.connectedCallback();
    this._checklistItems = this.task?.checklist?.map(item => ({...item})) || [];
    this._attachedFiles = this.task?.files?.map(file => ({...file})) || [];
  }

  // --- НОВЫЕ, УНИФИЦИРОВАННЫЕ СТИЛИ ДЛЯ ФОРМ ---
  static styles = css`
    form { 
      display: flex; 
      flex-direction: column; 
      gap: 1.25rem; 
    }
    .form-row { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 1.25rem; 
    }
    label { 
      display: block; 
      font-size: 0.875rem; 
      font-weight: 500; 
      margin-bottom: 0.35rem; 
      color: var(--text-secondary); 
    }
    input, select, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-sizing: border-box;
      font-family: inherit;
      font-size: 1rem;
      background-color: var(--bg-main);
      color: var(--text-primary);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--accent-primary-light);
    }

    .section { 
      margin-top: 1rem; 
      border-top: 1px solid var(--border-color); 
      padding-top: 1.25rem; 
    }
    .section-header { 
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600; 
      margin-bottom: 1rem; 
      font-size: 1rem;
    }
    
    .checklist-item { 
      display: flex; 
      align-items: center; 
      gap: 0.75rem; 
      padding: 0.5rem;
      border-radius: 6px;
      transition: background-color 0.2s ease;
    }
    .checklist-item:hover {
      background-color: var(--bg-hover);
    }
    .checklist-item input[type="checkbox"] { 
      width: 1rem; 
      height: 1rem;
      flex-shrink: 0; 
    }
    .checklist-item .checklist-text { 
      flex-grow: 1; 
      border: none;
      background: none;
      padding: 0;
    }
    .checklist-item .completed { 
      text-decoration: line-through; 
      color: var(--text-secondary); 
    }
    .item-delete-btn { 
      background: none; 
      border: none; 
      color: var(--text-secondary); 
      cursor: pointer; 
      font-size: 1.25rem; 
      padding: 0 0.5rem; 
      margin-left: auto; 
      border-radius: 50%;
      opacity: 0.5;
      transition: all 0.2s ease;
    }
    .checklist-item:hover .item-delete-btn {
      opacity: 1;
    }
    .item-delete-btn:hover {
      color: var(--accent-danger);
      background-color: var(--bg-card);
    }
    
    .add-item { 
      display: flex; 
      gap: 0.5rem; 
      margin-top: 1rem; 
    }
    .add-item input { flex-grow: 1; }
    .add-btn { 
      background-color: var(--bg-hover); 
      border: 1px solid var(--border-color);
      padding: 0.6rem 1rem; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: bold; 
      color: var(--text-secondary);
    }
    .add-btn:hover { 
      background-color: var(--border-color);
      color: var(--text-primary);
    }

    .file-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .file-item, .upload-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background-color: var(--bg-hover); border-radius: 8px; }
    .file-icon { font-size: 1.25rem; color: var(--text-secondary); width: 20px; text-align: center; }
    .file-name { flex-grow: 1; font-weight: 500; color: var(--text-primary); text-decoration: none; }
    .file-name:hover { text-decoration: underline; }
    .file-size { font-size: 0.8rem; color: var(--text-secondary); }
    .file-delete-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.25rem; padding: 0 0.5rem; border-radius: 50%; }
    .file-delete-btn:hover { color: var(--accent-danger); background-color: var(--bg-card); }
    
    .upload-progress-bar { width: 100px; height: 6px; background-color: var(--border-color); border-radius: 3px; overflow: hidden; }
    .upload-progress-inner { height: 100%; background-color: var(--accent-primary); transition: width 0.3s ease; }

    .add-file-btn {
      margin-top: 1rem;
      background-color: var(--bg-hover);
      border: 1px solid var(--border-color);
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .add-file-btn:hover { background-color: var(--border-color); color: var(--text-primary); }
    input[type="file"] { display: none; }

    .actions { 
      display: flex; 
      justify-content: flex-end; 
      align-items: center; 
      gap: 1rem; 
      margin-top: 1.5rem; 
    }
    .save-btn { 
      background-color: var(--accent-primary); 
      color: white; 
      border: none; 
      padding: 0.75rem 1.5rem; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: 600; 
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }
    .save-btn:hover { 
      filter: brightness(1.1);
      box-shadow: var(--shadow-md);
    }
    .delete-btn { 
      background: none; 
      border: none; 
      color: var(--accent-danger); 
      cursor: pointer; 
      font-weight: 500; 
      margin-right: auto; 
      padding: 0.5rem;
      border-radius: 6px;
    }
    .delete-btn:hover {
      background-color: #fee2e2;
    }
  `;

  private _handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const eventData = { ...data, checklist: this._checklistItems, files: this._attachedFiles };
    
    this.dispatchEvent(new CustomEvent('save-task', { detail: { data: eventData }, bubbles: true, composed: true }));
  }

  private _handleDelete() {
    this.dispatchEvent(new CustomEvent('delete-task', { detail: { taskId: this.task?.id }, bubbles: true, composed: true }));
  }

  private _addChecklistItem() {
    const input = this.shadowRoot?.getElementById('checklist-input') as HTMLInputElement;
    if (input && input.value.trim()) {
      this._checklistItems = [...this._checklistItems, { id: nanoid(10), text: input.value.trim(), completed: false }];
      input.value = '';
    }
  }
  private _toggleChecklistItem(item: ChecklistItem, completed: boolean) {
    const foundItem = this._checklistItems.find(i => i.id === item.id);
    if (foundItem) {
      foundItem.completed = completed;
      this.requestUpdate('_checklistItems');
    }
  }
  private _deleteChecklistItem(itemId: string) {
    this._checklistItems = this._checklistItems.filter(item => item.id !== itemId);
  }

  private _triggerFileInput() {
    this._fileInput.click();
  }

  private async _handleFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    
    const upload: UploadProgress = { fileName: file.name, progress: 0 };
    this._uploadingFiles = [...this._uploadingFiles, upload];

    try {
      const newFile = await uploadFileToTask(this.workspaceId, this.task!.id, file, (progress) => {
        const currentUpload = this._uploadingFiles.find(f => f.fileName === file.name);
        if (currentUpload) {
          currentUpload.progress = progress;
          this.requestUpdate('_uploadingFiles');
        }
      });
      this._attachedFiles = [...this._attachedFiles, newFile];
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      this._uploadingFiles = this._uploadingFiles.filter(f => f.fileName !== file.name);
    }
  }

  private async _handleDeleteFile(fileToDelete: AttachedFile) {
    if (!confirm(`Вы уверены, что хотите удалить файл "${fileToDelete.name}"?`)) return;
    try {
      await deleteFileFromTask(this.workspaceId, this.task!.id, fileToDelete);
      this._attachedFiles = this._attachedFiles.filter(f => f.id !== fileToDelete.id);
    } catch (error) {
      console.error("File deletion failed", error);
    }
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <input type="hidden" name="id" .value=${this.task?.id || ''}>
        
        <div><label for="title">Название задачи</label><input id="title" name="title" type="text" .value=${this.task?.title || ''} required></div>
        <div><label for="description">Описание</label><textarea id="description" name="description" rows="3" .value=${this.task?.description || ''}></textarea></div>
        
        <div class="form-row">
          <div><label for="status">Статус</label><select id="status" name="status" .value=${this.task?.status || 'todo'}><option value="todo">К выполнению</option><option value="inprogress">В работе</option><option value="review">На проверке</option><option value="done">Готово</option></select></div>
          <div><label for="priority">Приоритет</label><select id="priority" name="priority" .value=${this.task?.priority || 'medium'}><option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option></select></div>
        </div>
        
        <div><label for="dueDate">Срок выполнения</label><input id="dueDate" name="dueDate" type="date" .value=${this.task?.dueDate || ''}></div>
        
        <div class="section">
          <div class="section-header">Чек-лист</div>
          ${this._checklistItems.map(item => html`
            <div class="checklist-item">
              <input type="checkbox" .checked=${item.completed} @change=${(e: Event) => this._toggleChecklistItem(item, (e.target as HTMLInputElement).checked)}>
              <input type="text" class="checklist-text ${item.completed ? 'completed' : ''}" .value=${item.text}>
              <button type="button" class="item-delete-btn" @click=${() => this._deleteChecklistItem(item.id)} title="Удалить пункт">&times;</button>
            </div>
          `)}
          <div class="add-item">
            <input id="checklist-input" type="text" placeholder="Добавить подзадачу..." @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); this._addChecklistItem(); }}}>
            <button type="button" class="add-btn" @click=${this._addChecklistItem}>+</button>
          </div>
        </div>

        <div class="section">
          <div class="section-header">Прикрепленные файлы</div>
          ${this.task?.id ? html`
            <div class="file-list">
              ${this._attachedFiles.map(file => html`
                <div class="file-item">
                  <i class="file-icon fas fa-paperclip"></i>
                  <a href=${file.url} target="_blank" class="file-name">${file.name}</a>
                  <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
                  <button type="button" class="file-delete-btn" @click=${() => this._handleDeleteFile(file)} title="Удалить файл">&times;</button>
                </div>
              `)}
              ${this._uploadingFiles.map(upload => html`
                <div class="upload-item">
                  <i class="file-icon fas fa-spinner fa-spin"></i>
                  <span class="file-name">${upload.fileName}</span>
                  <div class="upload-progress-bar">
                    <div class="upload-progress-inner" style="width: ${upload.progress}%"></div>
                  </div>
                </div>
              `)}
            </div>
            <input type="file" id="file-input" @change=${this._handleFileSelected}>
            <button type="button" class="add-file-btn" @click=${this._triggerFileInput}>
              <i class="fas fa-plus"></i> Прикрепить файл
            </button>
          ` : html`
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Сначала сохраните задачу, чтобы можно было прикреплять файлы.</p>
          `}
        </div>

        <div class="actions">
          ${this.task?.id ? html`<button type="button" class="delete-btn" @click=${this._handleDelete}>Удалить</button>` : ''}
          <button type="submit" class="save-btn">Сохранить</button>
        </div>
      </form>
    `;
  }
}
