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

"use client";

import { toast } from "sonner";
// TypeScript will automatically pick up .d.ts files - no need to import them explicitly
// import "../types/file-system";

export interface FileSystemItem {
  name: string;
  kind: "file" | "directory";
  size?: number;
  lastModified?: number;
  path: string[];
}

export interface FileData {
  content: string | ArrayBuffer;
  type: string;
}

class FileSystemAPI {
  private rootDirHandle: FileSystemDirectoryHandle | null = null;
  private initialized = false;

  // Check if File System Access API is supported
  isSupported(): boolean {
    return 'showDirectoryPicker' in window && 'showOpenFilePicker' in window;
  }

  // Initialize the file system
  async init(): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      // Get OPFS root
      this.rootDirHandle = await navigator.storage.getDirectory();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize file system:", error);
      return false;
    }
  }

  // List directory contents
  async listDirectory(path: string[] = []): Promise<FileSystemItem[]> {
    if (!this.rootDirHandle) await this.init();
    
    try {
      let currentDir = this.rootDirHandle!;
      
      // Navigate to the specified path
      for (const segment of path) {
        currentDir = await currentDir.getDirectoryHandle(segment);
      }
      
      const entries: FileSystemItem[] = [];
      
      // Get all entries in the directory
      for await (const [name, handle] of currentDir.entries()) {
        const entry: FileSystemItem = {
          name,
          kind: handle.kind,
          path: [...path, name],
        };
        
        if (handle.kind === "file") {
          const fileHandle = handle as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          entry.size = file.size;
          entry.lastModified = file.lastModified;
        }
        
        entries.push(entry);
      }
      
      // Sort: directories first, then files, both alphabetically
      return entries.sort((a, b) => {
        if (a.kind !== b.kind) {
          return a.kind === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error("Error listing directory:", error);
      return [];
    }
  }

  // Create a directory
  async createDirectory(path: string[], name: string): Promise<boolean> {
    if (!this.rootDirHandle) await this.init();
    
    try {
      let currentDir = this.rootDirHandle!;
      
      // Navigate to the specified path
      for (const segment of path) {
        currentDir = await currentDir.getDirectoryHandle(segment, { create: true });
      }
      
      // Create the new directory
      await currentDir.getDirectoryHandle(name, { create: true });
      return true;
    } catch (error) {
      console.error("Error creating directory:", error);
      return false;
    }
  }

  // Create a file
  async createFile(
    path: string[], 
    name: string, 
    content: string | ArrayBuffer = ""
  ): Promise<boolean> {
    if (!this.rootDirHandle) await this.init();
    
    try {
      let currentDir = this.rootDirHandle!;
      
      // Navigate to the specified path
      for (const segment of path) {
        currentDir = await currentDir.getDirectoryHandle(segment, { create: true });
      }
      
      // Create the file
      const fileHandle = await currentDir.getFileHandle(name, { create: true });
      
      // Write content to the file
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      
      return true;
    } catch (error) {
      console.error("Error creating file:", error);
      return false;
    }
  }

  // Read a file
  async readFile(
    path: string[], 
    name: string, 
    asText: boolean = true
  ): Promise<FileData | null> {
    if (!this.rootDirHandle) await this.init();
    
    try {
      let currentDir = this.rootDirHandle!;
      
      // Navigate to the specified path
      for (const segment of path) {
        currentDir = await currentDir.getDirectoryHandle(segment);
      }
      
      // Get the file
      const fileHandle = await currentDir.getFileHandle(name);
      const file = await fileHandle.getFile();
      
      let content: string | ArrayBuffer;
      if (asText) {
        content = await file.text();
      } else {
        content = await file.arrayBuffer();
      }
      
      return {
        content,
        type: file.type
      };
    } catch (error) {
      console.error("Error reading file:", error);
      return null;
    }
  }

  // Write to a file
  async writeFile(
    path: string[], 
    name: string, 
    content: string | ArrayBuffer
  ): Promise<boolean> {
    if (!this.rootDirHandle) await this.init();
    
    try {
      let currentDir = this.rootDirHandle!;
      
      // Navigate to the specified path
      for (const segment of path) {
        currentDir = await currentDir.getDirectoryHandle(segment, { create: true });
      }
      
      // Get or create the file
      const fileHandle = await currentDir.getFileHandle(name, { create: true });
      
      // Write content to the file
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      
      return true;
    } catch (error) {
      console.error("Error writing file:", error);
      return false;
    }
  }

  // Delete a file or directory
  async delete(path: string[], name: string): Promise<boolean> {
    if (!this.rootDirHandle) await this.init();
    
    try {
      let currentDir = this.rootDirHandle!;
      
      // Navigate to the specified path
      for (const segment of path) {
        currentDir = await currentDir.getDirectoryHandle(segment);
      }
      
      // Delete the entry
      await currentDir.removeEntry(name, { recursive: true });
      return true;
    } catch (error) {
      console.error("Error deleting entry:", error);
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

  // Add this method to your FileSystem class
  async saveConfig(config: any): Promise<boolean> {
    try {
      // Read existing config first
      const existingConfig = await this.loadConfig() || {};
      
      // Deep merge the configs
      const newConfig = {
        ...existingConfig,
        ...config,
        lastModified: Date.now(),
        // Ensure icons array is completely replaced rather than merged
        icons: config.icons || existingConfig.icons
      };
      
      // Convert to string with pretty printing
      const configString = JSON.stringify(newConfig, null, 2);
      
      // Save to file system
      await this.writeFile([], 'system-config.json', configString);
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }

  // Add this method to load config
  async loadConfig(): Promise<any> {
    try {
      const configData = await this.readFile([], 'system-config.json');
      if (configData?.content) {
        const contentString = typeof configData.content === 'string' 
          ? configData.content 
          : new TextDecoder().decode(configData.content as ArrayBuffer);
        
        return JSON.parse(contentString);
      }
      return null;
    } catch (error) {
      console.error('Error loading config:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const fileSystem = new FileSystemAPI(); 