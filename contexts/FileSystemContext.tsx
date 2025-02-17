"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useFileSystem } from '@/lib/fs/hooks';
import type { FileSystemEntry, FileSystemOperationResult } from '@/lib/fs/types';
import { toast } from 'sonner';

interface FileSystemContextType {
  isReady: boolean;
  currentDirectory: string | null;
  entries: FileSystemEntry[];
  navigateToDirectory: (id: string | null) => Promise<void>;
  createFile: (name: string, content?: string) => Promise<FileSystemOperationResult<FileSystemEntry>>;
  createDirectory: (name: string) => Promise<FileSystemOperationResult<FileSystemEntry>>;
  deleteEntry: (id: string) => Promise<FileSystemOperationResult<void>>;
  updateEntry: (id: string, updates: Partial<FileSystemEntry>) => Promise<FileSystemOperationResult<FileSystemEntry>>;
  refreshCurrentDirectory: () => Promise<void>;
}

const FileSystemContext = createContext<FileSystemContextType | null>(null);

export function FileSystemProvider({ children }: { children: React.ReactNode }) {
  const fs = useFileSystem();
  const [isReady, setIsReady] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [entries, setEntries] = useState<FileSystemEntry[]>([]);

  useEffect(() => {
    if (fs.isInitialized) {
      setIsReady(true);
      refreshCurrentDirectory();
    }
  }, [fs.isInitialized]);

  const refreshCurrentDirectory = async () => {
    try {
      const result = await fs.listDirectory(currentDirectory);
      if (result.success && result.data) {
        setEntries(result.data);
      } else {
        toast.error('Failed to load directory contents');
      }
    } catch (error) {
      toast.error('Error loading directory contents');
    }
  };

  const navigateToDirectory = async (id: string | null) => {
    setCurrentDirectory(id);
    await refreshCurrentDirectory();
  };

  const createFile = async (name: string, content: string = '') => {
    const result = await fs.createFile(name, content, currentDirectory);
    if (result.success) {
      await refreshCurrentDirectory();
      toast.success(`File "${name}" created`);
    } else {
      toast.error(`Failed to create file "${name}"`);
    }
    return result;
  };

  const createDirectory = async (name: string) => {
    const result = await fs.createDirectory(name, currentDirectory);
    if (result.success) {
      await refreshCurrentDirectory();
      toast.success(`Directory "${name}" created`);
    } else {
      toast.error(`Failed to create directory "${name}"`);
    }
    return result;
  };

  const deleteEntry = async (id: string) => {
    const result = await fs.deleteEntry(id);
    if (result.success) {
      await refreshCurrentDirectory();
      toast.success('Item deleted');
    } else {
      toast.error('Failed to delete item');
    }
    return result;
  };

  const updateEntry = async (id: string, updates: Partial<FileSystemEntry>) => {
    const result = await fs.updateEntry(id, updates);
    if (result.success) {
      await refreshCurrentDirectory();
      toast.success('Item updated');
    } else {
      toast.error('Failed to update item');
    }
    return result;
  };

  return (
    <FileSystemContext.Provider
      value={{
        isReady,
        currentDirectory,
        entries,
        navigateToDirectory,
        createFile,
        createDirectory,
        deleteEntry,
        updateEntry,
        refreshCurrentDirectory,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystemContext() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystemContext must be used within a FileSystemProvider');
  }
  return context;
}