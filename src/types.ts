// src/types.ts

// --- Типы для вложенных данных ---
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
 
 // --- ЕДИНЫЙ ТИП ДЛЯ ЗАДАЧИ ---
 export interface Task {
   id: string;
   title: string;
   status: 'todo' | 'inprogress' | 'review' | 'done';
   priority: 'low' | 'medium' | 'high';
   createdAt: { seconds: number, nanoseconds: number };
   description?: string;
   dueDate?: string;
   checklist?: ChecklistItem[];
   files?: AttachedFile[];
 }
 
 // --- ТИП ДЛЯ ФИНАНСОВОЙ ОПЕРАЦИИ ---
 export interface FinanceOperation {
   id: string;
   title: string;
   amount: number;
   type: 'income' | 'expense';
   date: string;
   category?: string;
   currency?: string;
   comment?: string;
 }