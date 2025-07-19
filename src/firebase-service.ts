// src/firebase-service.ts
import { db, storage, auth } from './firebase-init.js'; // Импортируем auth
import {
  collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy, where, arrayUnion, arrayRemove
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject
} from 'firebase/storage';
import { nanoid } from 'nanoid';
import type { Unsubscribe } from 'firebase/firestore';
import type { Task, FinanceOperation, CalendarEvent, Contact, Regulation, Workspace, AttachedFile } from './types';

// ... (весь код до функции uploadFileToTask без изменений) ...
type DataCallback<T> = (data: T[]) => void;
function listenToCollection<T>(path: string, callback: DataCallback<T>, orderField = 'createdAt', orderDir: 'asc' | 'desc' = 'desc'): Unsubscribe {
  const q = query(collection(db, path), orderBy(orderField, orderDir));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    callback(data);
  }, (error) => { console.error(`Error listening to ${path}:`, error); callback([]); });
}
export function listenToWorkspaces(userId: string, callback: DataCallback<Workspace>): Unsubscribe {
    const q = query(collection(db, 'workspaces'), where('members', 'array-contains', userId));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
        callback(data);
    });
}
export async function createWorkspace(data: { name: string, description: string }, ownerId: string): Promise<string | null> {
    try {
        const newWorkspace = { ...data, ownerId: ownerId, members: [ownerId], createdAt: serverTimestamp() };
        const docRef = await addDoc(collection(db, 'workspaces'), newWorkspace);
        return docRef.id;
    } catch (error) { console.error("Error creating workspace: ", error); return null; }
}
export const listenForTasks = (workspaceId: string, callback: DataCallback<Task>) => listenToCollection<Task>(`workspaces/${workspaceId}/tasks`, callback, 'createdAt');
export const listenForFinanceOperations = (workspaceId: string, callback: DataCallback<FinanceOperation>) => listenToCollection<FinanceOperation>(`workspaces/${workspaceId}/finances`, callback, 'date');
export const listenForCalendarEvents = (workspaceId: string, callback: DataCallback<CalendarEvent>) => listenToCollection<CalendarEvent>(`workspaces/${workspaceId}/calendarEvents`, callback, 'start');
export const listenForContacts = (workspaceId: string, callback: DataCallback<Contact>) => listenToCollection<Contact>(`workspaces/${workspaceId}/contacts`, callback, 'name', 'asc');
export const listenForRegulations = (workspaceId: string, callback: DataCallback<Regulation>) => listenToCollection<Regulation>(`workspaces/${workspaceId}/regulations`, callback, 'title', 'asc');
export function listenForWorkspaceDetails(workspaceId: string, callback: (ws: Workspace | null) => void): Unsubscribe {
    return onSnapshot(doc(db, 'workspaces', workspaceId), (doc) => {
        if (doc.exists()) { callback({ id: doc.id, ...doc.data() } as Workspace); } 
        else { console.error("Workspace not found!"); callback(null); }
    });
}
export async function saveItem(workspaceId: string, collectionName: string, data: any) {
    const path = `workspaces/${workspaceId}/${collectionName}`;
    const itemData = { ...data };
    const itemId = itemData.id;
    delete itemData.id;
    if (itemId) {
        await updateDoc(doc(db, path, itemId), itemData);
    } else {
        if (collectionName === 'tasks') itemData.createdAt = serverTimestamp();
        await addDoc(collection(db, path), itemData);
    }
}
export async function deleteItem(workspaceId: string, collectionName: string, itemId: string) {
    if (!itemId) return;
    const path = `workspaces/${workspaceId}/${collectionName}`;
    await deleteDoc(doc(db, path, itemId));
}
export async function updateTaskStatus(workspaceId: string, taskId: string, newStatus: Task['status']) {
    const path = `workspaces/${workspaceId}/tasks`;
    await updateDoc(doc(db, path, taskId), { status: newStatus });
}
export async function saveWorkspaceSettings(workspaceId: string, data: { name: string, description: string }) {
    await updateDoc(doc(db, 'workspaces', workspaceId), data);
}
export async function deleteWorkspace(workspaceId: string) {
    await deleteDoc(doc(db, 'workspaces', workspaceId));
}

// --- ИЗМЕНЕНИЯ ЗДЕСЬ ---
export function uploadFileToTask(
  workspaceId: string,
  taskId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<AttachedFile> {
  return new Promise((resolve, reject) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return reject(new Error("User not authenticated"));

    const fileId = nanoid(10);
    // Новый путь: включает ID пользователя для проверки в правилах
    const filePath = `workspaces/${workspaceId}/tasks/${taskId}/${userId}/${fileId}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => { onProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100); },
      (error) => { console.error("Ошибка при загрузке файла:", error); reject(error); },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const attachedFile: AttachedFile = { id: fileId, name: file.name, url: downloadURL, path: filePath, size: file.size, type: file.type, };
          const taskRef = doc(db, `workspaces/${workspaceId}/tasks`, taskId);
          await updateDoc(taskRef, { files: arrayUnion(attachedFile) });
          resolve(attachedFile);
        } catch (error) { console.error("Ошибка при получении URL или обновлении задачи:", error); reject(error); }
      }
    );
  });
}

export async function deleteFileFromTask(workspaceId: string, taskId: string, fileToDelete: AttachedFile) {
    const fileRef = ref(storage, fileToDelete.path);
    await deleteObject(fileRef);
    const taskRef = doc(db, `workspaces/${workspaceId}/tasks`, taskId);
    await updateDoc(taskRef, { files: arrayRemove(fileToDelete) });
}

export function uploadFileToRegulation(
  workspaceId: string,
  regulationId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<AttachedFile> {
  return new Promise((resolve, reject) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return reject(new Error("User not authenticated"));

    const fileId = nanoid(10);
    // Новый путь: включает ID пользователя для проверки в правилах
    const filePath = `workspaces/${workspaceId}/regulations/${regulationId}/${userId}/${fileId}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => { onProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100); },
      (error) => { console.error("Ошибка при загрузке файла регламента:", error); reject(error); },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const attachedFile: AttachedFile = { id: fileId, name: file.name, url: downloadURL, path: filePath, size: file.size, type: file.type, };
          const regulationRef = doc(db, `workspaces/${workspaceId}/regulations`, regulationId);
          await updateDoc(regulationRef, { files: arrayUnion(attachedFile) });
          resolve(attachedFile);
        } catch (error) { console.error("Ошибка при получении URL или обновлении регламента:", error); reject(error); }
      }
    );
  });
}

export async function deleteFileFromRegulation(workspaceId: string, regulationId: string, fileToDelete: AttachedFile) {
    const fileRef = ref(storage, fileToDelete.path);
    await deleteObject(fileRef);
    const regulationRef = doc(db, `workspaces/${workspaceId}/regulations`, regulationId);
    await updateDoc(regulationRef, { files: arrayRemove(fileToDelete) });
}
