"use client";

import { FileSystemEntry, FileSystemError, FileSystemOperationResult } from './types';

const DB_NAME = 'StephansOSDB';
const DB_VERSION = 1;
const STORE_NAME = 'filesStore';

class FileSystemDatabase {
  private static instance: FileSystemDatabase;
  private db: IDBDatabase | null = null;

  private constructor() {}

  static getInstance(): FileSystemDatabase {
    if (!FileSystemDatabase.instance) {
      FileSystemDatabase.instance = new FileSystemDatabase();
    }
    return FileSystemDatabase.instance;
  }

  async init(): Promise<FileSystemOperationResult<void>> {
    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('parentId', 'parentId', { unique: false });
            store.createIndex('type', 'type', { unique: false });
            store.createIndex('updatedAt', 'updatedAt', { unique: false });
          }
        };
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'DatabaseInitError',
          message: 'Failed to initialize database',
          code: 'DB_INIT_ERROR',
        } as FileSystemError,
      };
    }
  }

  async createEntry(entry: Omit<FileSystemEntry, 'id'>): Promise<FileSystemOperationResult<FileSystemEntry>> {
    try {
      if (!this.db) throw new Error('Database not initialized');

      const newEntry: FileSystemEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(newEntry);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      return { success: true, data: newEntry };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'CreateEntryError',
          message: 'Failed to create file system entry',
          code: 'CREATE_ENTRY_ERROR',
        } as FileSystemError,
      };
    }
  }

  async getEntry(id: string): Promise<FileSystemOperationResult<FileSystemEntry>> {
    try {
      if (!this.db) throw new Error('Database not initialized');

      const entry = await new Promise<FileSystemEntry>((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      return { success: true, data: entry };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'GetEntryError',
          message: 'Failed to retrieve file system entry',
          code: 'GET_ENTRY_ERROR',
        } as FileSystemError,
      };
    }
  }

  async updateEntry(id: string, updates: Partial<FileSystemEntry>): Promise<FileSystemOperationResult<FileSystemEntry>> {
    try {
      if (!this.db) throw new Error('Database not initialized');

      const { data: existingEntry } = await this.getEntry(id);
      if (!existingEntry) throw new Error('Entry not found');

      const updatedEntry: FileSystemEntry = {
        ...existingEntry,
        ...updates,
        id,
        updatedAt: Date.now(),
      };

      await new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(updatedEntry);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      return { success: true, data: updatedEntry };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'UpdateEntryError',
          message: 'Failed to update file system entry',
          code: 'UPDATE_ENTRY_ERROR',
        } as FileSystemError,
      };
    }
  }

  async deleteEntry(id: string): Promise<FileSystemOperationResult<void>> {
    try {
      if (!this.db) throw new Error('Database not initialized');

      await new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'DeleteEntryError',
          message: 'Failed to delete file system entry',
          code: 'DELETE_ENTRY_ERROR',
        } as FileSystemError,
      };
    }
  }

  async listDirectory(parentId: string | null): Promise<FileSystemOperationResult<FileSystemEntry[]>> {
    try {
      if (!this.db) throw new Error('Database not initialized');

      const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('parentId');
        const request = index.getAll(parentId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      return { success: true, data: entries };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'ListDirectoryError',
          message: 'Failed to list directory contents',
          code: 'LIST_DIRECTORY_ERROR',
        } as FileSystemError,
      };
    }
  }
}

export const fileSystem = FileSystemDatabase.getInstance();