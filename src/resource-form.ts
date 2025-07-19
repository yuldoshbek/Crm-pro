// src/resource-form.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import type { Contact, Regulation, AttachedFile } from './types.js';
import { uploadFileToRegulation, deleteFileFromRegulation } from './firebase-service.js';

type ResourceType = 'contact' | 'regulation';
interface UploadProgress {
  fileName: string;
  progress: number;
}

@customElement('resource-form')
export class ResourceForm extends LitElement {
  @property({ type: String })
  type: ResourceType = 'contact';

  @property({ attribute: false })
  item?: Partial<Contact & Regulation>;

  @property({ type: String })
  workspaceId = '';

  @state()
  private _attachedFiles: AttachedFile[] = [];
  @state()
  private _uploadingFiles: UploadProgress[] = [];

  @query('#file-input')
  private _fileInput!: HTMLInputElement;

  connectedCallback() {
    super.connectedCallback();
    this._attachedFiles = this.item?.files?.map(file => ({...file})) || [];
  }

  static styles = css`
    /* ... (основные стили без изменений) ... */
    form { display: flex; flex-direction: column; gap: 1.25rem; }
    label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.35rem; color: var(--text-secondary); }
    input, select, textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 1rem; background-color: var(--bg-main); color: var(--text-primary); transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent-primary); box-shadow: 0 0 0 3px var(--accent-primary-light); }
    .actions { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; margin-top: 1.5rem; }
    .save-btn { background-color: var(--accent-primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: var(--shadow-sm); transition: all 0.2s ease; }
    .save-btn:hover { filter: brightness(1.1); box-shadow: var(--shadow-md); }
    .delete-btn { background: none; border: none; color: var(--accent-danger); cursor: pointer; font-weight: 500; margin-right: auto; padding: 0.5rem; border-radius: 6px; }
    .delete-btn:hover { background-color: #fee2e2; }
    
    /* Стили для файлов (аналогично task-form) */
    .file-section { margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem; }
    .file-section h4 { margin: 0 0 1rem 0; font-weight: 600; font-size: 1rem; }
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
    .add-file-btn { margin-top: 1rem; background-color: var(--bg-hover); border: 1px solid var(--border-color); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 500; color: var(--text-secondary); display: inline-flex; align-items: center; gap: 0.5rem; }
    .add-file-btn:hover { background-color: var(--border-color); color: var(--text-primary); }
    input[type="file"] { display: none; }
  `;

  private _handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const eventData = { ...data, files: this._attachedFiles };
    
    this.dispatchEvent(new CustomEvent('save-resource', {
      detail: { data: eventData, type: this.type },
      bubbles: true,
      composed: true
    }));
  }

  private _handleDelete() {
    this.dispatchEvent(new CustomEvent('delete-resource', {
        detail: { itemId: this.item?.id, type: this.type },
        bubbles: true,
        composed: true
    }));
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
      const newFile = await uploadFileToRegulation(this.workspaceId, this.item!.id!, file, (progress) => {
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
      await deleteFileFromRegulation(this.workspaceId, this.item!.id!, fileToDelete);
      this._attachedFiles = this._attachedFiles.filter(f => f.id !== fileToDelete.id);
    } catch (error) {
      console.error("File deletion failed", error);
    }
  }

  private _renderContactForm() {
    return html`
      <div><label for="name">Имя</label><input id="name" name="name" type="text" .value=${this.item?.name || ''} required></div>
      <div><label for="role">Должность</label><input id="role" name="role" type="text" .value=${this.item?.role || ''}></div>
      <div><label for="company">Компания</label><input id="company" name="company" type="text" .value=${this.item?.company || ''}></div>
      <div><label for="phone">Телефон</label><input id="phone" name="phone" type="tel" .value=${this.item?.phone || ''}></div>
      <div><label for="email">Email</label><input id="email" name="email" type="email" .value=${this.item?.email || ''}></div>
      <div><label for="notes">Заметки</label><textarea id="notes" name="notes" rows="4" .value=${this.item?.notes || ''}></textarea></div>
    `;
  }

  private _renderRegulationForm() {
    return html`
      <div><label for="title">Название регламента</label><input id="title" name="title" type="text" .value=${this.item?.title || ''} required></div>
      <div><label for="category">Категория</label><input id="category" name="category" type="text" .value=${this.item?.category || ''}></div>
      <div><label for="description">Описание</label><textarea id="description" name="description" rows="4" .value=${this.item?.description || ''}></textarea></div>
      
      <div class="file-section">
        <h4>Файлы</h4>
        ${this.item?.id ? html`
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
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Сначала сохраните регламент, чтобы можно было прикреплять файлы.</p>
        `}
      </div>
    `;
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <input type="hidden" name="id" .value=${this.item?.id || ''}>
        ${this.type === 'contact' ? this._renderContactForm() : this._renderRegulationForm()}
        <div class="actions">
          ${this.item?.id ? html`<button type="button" class="delete-btn" @click=${this._handleDelete}>Удалить</button>` : ''}
          <button type="submit" class="save-btn">Сохранить</button>
        </div>
      </form>
    `;
  }
}
