"use client";

import { useState, useEffect } from 'react';
import { fileSystem } from './db';
import type { FileSystemEntry, FileSystemOperationResult } from './types';

export function useFileSystem() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initFS = async () => {
      const result = await fileSystem.init();
      if (result.success) {
        setIsInitialized(true);
      } else {
        setError(result.error || new Error('Failed to initialize file system'));
      }
    };

    initFS();
  }, []);

  const createFile = async (
    name: string,
    content: string = '',
    parentId: string | null = null
  ): Promise<FileSystemOperationResult<FileSystemEntry>> => {
    return fileSystem.createEntry({
      name,
      type: 'file',
      content,
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        size: new Blob([content]).size,
        mimeType: 'text/plain',
      },
    });
  };

  const createDirectory = async (
    name: string,
    parentId: string | null = null
  ): Promise<FileSystemOperationResult<FileSystemEntry>> => {
    return fileSystem.createEntry({
      name,
      type: 'directory',
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const getEntry = async (id: string) => {
    return fileSystem.getEntry(id);
  };

  const updateEntry = async (id: string, updates: Partial<FileSystemEntry>) => {
    return fileSystem.updateEntry(id, updates);
  };

  const deleteEntry = async (id: string) => {
    return fileSystem.deleteEntry(id);
  };

  const listDirectory = async (parentId: string | null = null) => {
    return fileSystem.listDirectory(parentId);
  };

  return {
    isInitialized,
    error,
    createFile,
    createDirectory,
    getEntry,
    updateEntry,
    deleteEntry,
    listDirectory,
  };
}