// src/types.ts
import { Timestamp } from 'firebase/firestore';

// --- Типы для вложенных данных ---
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// ОБНОВЛЕНО: Детализируем структуру прикрепленного файла
export interface AttachedFile {
  id: string;      // Уникальный ID для записи о файле
  name: string;    // Оригинальное имя файла
  url: string;     // URL для скачивания
  path: string;    // Полный путь в Firebase Storage (нужен для удаления)
  size: number;    // Размер файла в байтах
  type: string;    // MIME-тип файла (например, 'image/png')
}

// --- Основные типы данных ---

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  dueDate?: string;
  checklist?: ChecklistItem[];
  files?: AttachedFile[]; // Тип теперь использует нашу новую структуру
}

export interface FinanceOperation {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category?: string;
  comment?: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start: string;
    end: string;
    allDay: boolean;
    color: string;
}

export interface Contact {
    id: string;
    name: string;
    role?: string;
    company?: string;
    phone?: string;
    email?: string;
    notes?: string;
}

export interface Regulation {
    id: string;
    title: string;
    category?: string;
    description?: string;
    files?: AttachedFile[]; // Регламенты тоже могут иметь файлы
}

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    members: string[];
    createdAt: Timestamp;
}
