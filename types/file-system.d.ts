/**
 * TypeScript definitions for the File System Access API
 * Based on the File System Standard and File System Access API
 */

interface StorageEstimate {
  quota?: number;
  usage?: number;
  usageDetails?: {
    fileSystem?: number;
    [key: string]: number | undefined;
  };
}

interface StorageManager {
  /**
   * Requests access to the origin private file system root directory
   */
  getDirectory(): Promise<FileSystemDirectoryHandle>;
  
  /**
   * Estimates storage usage and quota information
   */
  estimate(): Promise<StorageEstimate>;
}

declare interface Navigator {
  storage: StorageManager;
}

interface FileSystemHandle {
  /**
   * Returns the name of the entry represented by the handle.
   */
  readonly name: string;

  /**
   * Returns the type of the entry represented by the handle.
   */
  readonly kind: 'file' | 'directory';

  /**
   * Compares two handles to determine if they represent the same file system entry.
   */
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: 'file';

  /**
   * Returns a File representing the state on disk of the entry represented by the handle.
   */
  getFile(): Promise<File>;

  /**
   * Creates a writable stream for writing to the file represented by the handle.
   */
  createWritable(options?: {
    keepExistingData?: boolean;
  }): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  readonly kind: 'directory';

  /**
   * Returns a Promise with a handle for the file with the specified name, 
   * or creates a new file if the `create` option is set to true.
   */
  getFileHandle(name: string, options?: {
    create?: boolean;
  }): Promise<FileSystemFileHandle>;

  /**
   * Returns a Promise with a handle for the directory with the specified name, 
   * or creates a new directory if the `create` option is set to true.
   */
  getDirectoryHandle(name: string, options?: {
    create?: boolean;
  }): Promise<FileSystemDirectoryHandle>;

  /**
   * Removes the entry with the specified name.
   */
  removeEntry(name: string, options?: {
    recursive?: boolean;
  }): Promise<void>;

  /**
   * Returns an async iterator of the entries in the directory.
   * If 'query' option added in the future, use type Record<string, any>
   */
  entries(): AsyncIterable<[string, FileSystemHandle]>;

  /**
   * Returns an async iterator of the names of entries in the directory.
   */
  keys(): AsyncIterable<string>;

  /**
   * Returns an async iterator of handles for entries in the directory.
   */
  values(): AsyncIterable<FileSystemHandle>;

  /**
   * Used with for await...of to iterate through all entries in the directory.
   */
  [Symbol.asyncIterator](): AsyncIterator<[string, FileSystemHandle]>;
}

interface FileSystemWriteChunkType {
  type: 'write';
  position?: number;
  data: BufferSource | Blob | string;
}

interface FileSystemTruncateChunkType {
  type: 'truncate';
  size: number;
}

interface FileSystemSeekChunkType {
  type: 'seek';
  position: number;
}

type FileSystemWriteChunk =
  | FileSystemWriteChunkType
  | FileSystemTruncateChunkType
  | FileSystemSeekChunkType;

interface FileSystemWritableFileStream extends WritableStream {
  /**
   * Writes content at the current file cursor offset.
   */
  write(data: FileSystemWriteChunk | BufferSource | Blob | string): Promise<void>;

  /**
   * Updates the current file cursor offset to the specified position.
   */
  seek(position: number): Promise<void>;

  /**
   * Resizes the file to be the specified size.
   */
  truncate(size: number): Promise<void>;
}

interface WritableStreamDefaultController {
  error(error?: any): void;
}

interface WritableStreamDefaultWriter {
  readonly closed: Promise<undefined>;
  readonly desiredSize: number | null;
  readonly ready: Promise<undefined>;
  abort(reason?: any): Promise<void>;
  close(): Promise<void>;
  releaseLock(): void;
  write(chunk: any): Promise<void>;
} 