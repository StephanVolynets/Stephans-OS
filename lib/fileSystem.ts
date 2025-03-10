/**
 * Origin Private File System (OPFS) Service
 * 
 * This service provides a wrapper around the File System Access API, specifically
 * targeting the Origin Private File System to store and manage files within the
 * browser's origin-private storage area.
 * 
 * OPFS is not visible to users through the regular file system and is isolated
 * to the web app's origin, making it suitable for app-specific file storage.
 */

import { toast } from "sonner";
// TypeScript will automatically pick up .d.ts files - no need to import them explicitly
// import "../types/file-system";

export interface FileSystemItem {
  name: string;
  kind: 'file' | 'directory';
  path: string[];
  lastModified?: number;
  size?: number;
}

export interface FileData {
  content: string | ArrayBuffer;
  type: string;
}

class FileSystemService {
  private rootDirectory: FileSystemDirectoryHandle | null = null;
  
  /**
   * Initialize the OPFS access
   */
  async init(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || 
          !('storage' in navigator && 'getDirectory' in navigator.storage)) {
        toast.error('File System API is not supported in your browser');
        return false;
      }
      
      this.rootDirectory = await navigator.storage.getDirectory();
      return true;
    } catch (error) {
      console.error('Failed to initialize the file system:', error);
      toast.error('Failed to access file system');
      return false;
    }
  }

  /**
   * List all files and directories in a specified path
   */
  async listDirectory(path: string[] = []): Promise<FileSystemItem[]> {
    try {
      if (!this.rootDirectory) {
        await this.init();
        if (!this.rootDirectory) {
          throw new Error('File system not initialized');
        }
      }
      
      // Navigate to the target directory
      let targetDir = this.rootDirectory;
      for (const segment of path) {
        targetDir = await targetDir.getDirectoryHandle(segment, { create: false });
      }
      
      const entries: FileSystemItem[] = [];
      for await (const [name, handle] of targetDir.entries()) {
        const kind = handle.kind;
        const item: FileSystemItem = {
          name,
          kind,
          path: [...path, name],
        };
        
        if (kind === 'file') {
          const file = await (handle as FileSystemFileHandle).getFile();
          item.lastModified = file.lastModified;
          item.size = file.size;
        }
        
        entries.push(item);
      }
      
      // Sort: directories first, then files alphabetically
      return entries.sort((a, b) => {
        if (a.kind !== b.kind) {
          return a.kind === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Failed to list directory:', error);
      toast.error(`Failed to list directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Create a new directory at the specified path
   */
  async createDirectory(path: string[], name: string): Promise<boolean> {
    try {
      if (!this.rootDirectory) {
        await this.init();
        if (!this.rootDirectory) {
          throw new Error('File system not initialized');
        }
      }
      
      let targetDir = this.rootDirectory;
      for (const segment of path) {
        targetDir = await targetDir.getDirectoryHandle(segment, { create: true });
      }
      
      await targetDir.getDirectoryHandle(name, { create: true });
      return true;
    } catch (error) {
      console.error('Failed to create directory:', error);
      toast.error(`Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Create a new file at the specified path
   */
  async createFile(path: string[], name: string, data: string | ArrayBuffer = '', type: string = 'text/plain'): Promise<boolean> {
    try {
      if (!this.rootDirectory) {
        await this.init();
        if (!this.rootDirectory) {
          throw new Error('File system not initialized');
        }
      }
      
      let targetDir = this.rootDirectory;
      for (const segment of path) {
        targetDir = await targetDir.getDirectoryHandle(segment, { create: true });
      }
      
      const fileHandle = await targetDir.getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      
      await writable.write(data);
      await writable.close();
      return true;
    } catch (error) {
      console.error('Failed to create file:', error);
      toast.error(`Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Read a file from the specified path
   */
  async readFile(path: string[], name: string, asText: boolean = true): Promise<FileData | null> {
    try {
      if (!this.rootDirectory) {
        await this.init();
        if (!this.rootDirectory) {
          throw new Error('File system not initialized');
        }
      }
      
      let targetDir = this.rootDirectory;
      for (const segment of path) {
        targetDir = await targetDir.getDirectoryHandle(segment, { create: false });
      }
      
      const fileHandle = await targetDir.getFileHandle(name, { create: false });
      const file = await fileHandle.getFile();
      
      if (asText) {
        const content = await file.text();
        return { content, type: file.type };
      } else {
        const content = await file.arrayBuffer();
        return { content, type: file.type };
      }
    } catch (error) {
      console.error('Failed to read file:', error);
      toast.error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Update an existing file
   */
  async updateFile(path: string[], name: string, data: string | ArrayBuffer): Promise<boolean> {
    try {
      if (!this.rootDirectory) {
        await this.init();
        if (!this.rootDirectory) {
          throw new Error('File system not initialized');
        }
      }
      
      let targetDir = this.rootDirectory;
      for (const segment of path) {
        targetDir = await targetDir.getDirectoryHandle(segment, { create: false });
      }
      
      const fileHandle = await targetDir.getFileHandle(name, { create: false });
      const writable = await fileHandle.createWritable({ keepExistingData: false });
      
      await writable.write(data);
      await writable.close();
      return true;
    } catch (error) {
      console.error('Failed to update file:', error);
      toast.error(`Failed to update file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Delete a file or directory
   */
  async delete(path: string[], name: string): Promise<boolean> {
    try {
      if (!this.rootDirectory) {
        await this.init();
        if (!this.rootDirectory) {
          throw new Error('File system not initialized');
        }
      }
      
      let targetDir = this.rootDirectory;
      for (const segment of path) {
        targetDir = await targetDir.getDirectoryHandle(segment, { create: false });
      }
      
      await targetDir.removeEntry(name, { recursive: true });
      return true;
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Calculate the total size of the OPFS storage used
   */
  async getStorageUsage(): Promise<{ usage: number; quota: number }> {
    try {
      if (typeof window !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return { 
          usage: estimate.usage || 0, 
          quota: estimate.quota || 0 
        };
      }
      return { usage: 0, quota: 0 };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { usage: 0, quota: 0 };
    }
  }

  /**
   * Check if the file system is available
   */
  isSupported(): boolean {
    return !!(
      typeof window !== 'undefined' && 
      'storage' in navigator && 
      'getDirectory' in navigator.storage
    );
  }
}

// Export a singleton instance
export const fileSystem = new FileSystemService(); 