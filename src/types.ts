// src/types.ts
import { Timestamp } from 'firebase/firestore';

// --- Типы для вложенных данных ---
// (без изменений)
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}
export interface AttachedFile {
  id: string;
  name: string;
  url: string;
  path: string;
}

// --- Основные типы данных ---

// (без изменений)
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  dueDate?: string;
  checklist?: ChecklistItem[];
  files?: AttachedFile[];
}

// (без изменений)
export interface FinanceOperation {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category?: string;
  comment?: string;
}

// (без изменений)
export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start: string;
    end: string;
    allDay: boolean;
    color: string;
}

// (без изменений)
export interface Contact {
    id: string;
    name: string;
    role?: string;
    company?: string;
    phone?: string;
    email?: string;
    notes?: string;
}

// (без изменений)
export interface Regulation {
    id: string;
    title: string;
    category?: string;
    description?: string;
    files?: AttachedFile[];
}

// --- НОВЫЙ ТИП ДЛЯ РАБОЧИХ ПРОСТРАНСТВ ---
export interface Workspace {
    id: string;
    name: string;
    description?: string;
    ownerId: string; // ID пользователя, создавшего пространство
    members: string[]; // Массив ID всех участников
    createdAt: Timestamp;
}
