export interface FileSystemEntry {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  metadata?: {
    size?: number;
    mimeType?: string;
    icon?: string;
  };
}

export interface FileSystemError extends Error {
  code: string;
}

export interface FileSystemOperationResult<T> {
  success: boolean;
  data?: T;
  error?: FileSystemError;
}