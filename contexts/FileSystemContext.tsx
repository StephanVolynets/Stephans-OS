"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateRandomColor } from '@/lib/utils';
import type { AppIcon } from '@/types/global';
import { FileEdit, Folder, Monitor, Cloud, Terminal, Info, Calculator, Layout, FileQuestion, CalendarIcon, HardDrive } from 'lucide-react';
import { fileSystem } from '@/lib/fileSystem';

// File system types that will be used throughout the application
export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'application';
  icon: string | React.FC; // Can be either a string for OPFS icons or a React component for app icons
  created: Date;
  modified: Date;
  size?: number;
  content?: string;
  parent?: string; // ID of parent folder, null for root items
  color?: string;
  x?: number; // Position on desktop if applicable
  y?: number;
}

// Add new interface for persisted icon data
interface PersistedIconData {
  id: string;
  title: string;
  x: number;
  y: number;
  type: 'app' | 'file' | 'folder';
  color: string;
  isSystemApp?: boolean;
}

interface FileSystemContextType {
  files: FileSystemItem[];
  desktopItems: AppIcon[]; // Desktop-specific items with positions
  isInitialized: boolean;
  createFile: (name: string, parentId?: string | null) => Promise<FileSystemItem>;
  createFolder: (name: string, parentId?: string | null) => Promise<FileSystemItem>;
  deleteItem: (id: string) => Promise<void>;
  renameItem: (id: string, newName: string) => Promise<void>;
  updateItemContent: (id: string, content: string) => Promise<void>;
  getItemContent: (id: string) => Promise<string | undefined>;
  getItemsInFolder: (folderId: string | null) => FileSystemItem[]; // null for root
  moveItem: (id: string, newParentId: string | null) => Promise<void>;
  sortItems: (items: FileSystemItem[], sortType: string) => FileSystemItem[];
  addToDesktop: (item: FileSystemItem) => void;
  removeFromDesktop: (id: string) => void;
  systemApps: AppIcon[];
  updateIconPosition: (positions: Record<string, { x: number; y: number }>) => void;
  updateIconTitle: (id: string, newTitle: string) => void;
  deleteIcon: (id: string) => void;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const [desktopItems, setDesktopItems] = useState<AppIcon[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [rootDirectoryHandle, setRootDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [systemApps, setSystemApps] = useState<AppIcon[]>([]);
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Initialize the file system when the component mounts
  useEffect(() => {
    const initializeFileSystem = async () => {
      try {
        // Access the origin private file system
        const opfsRoot = await navigator.storage.getDirectory();
        setRootDirectoryHandle(opfsRoot);
        
        // Try to load existing files
        await loadFilesFromOPFS(opfsRoot);
        
        // Initialize with default files if needed
        if (files.length === 0) {
          // Create some default files/folders
          await createDefaultFileStructure(opfsRoot);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing file system:', error);
        // Fall back to localStorage if OPFS is not supported
        loadFilesFromLocalStorage();
      }
    };

    initializeFileSystem();
  }, []);

  // Initialize system apps
  useEffect(() => {
    const defaultSystemApps: AppIcon[] = [
      { id: "myPC", title: "My PC", icon: Monitor, x: 0, y: 0, color: "text-indigo-400", type: "app", isSystemApp: true },
      { id: "weather", title: "Weather", icon: Cloud, x: 1, y: 0, color: "text-sky-400", type: "app", isSystemApp: true },
      { id: "terminal", title: "Terminal", icon: Terminal, x: 0, y: 1, color: "text-green-400", type: "app", isSystemApp: true },
      { id: "aboutMe", title: "About Me", icon: Info, x: 1, y: 1, color: "text-cyan-400", type: "file", isSystemApp: true },
      { id: "calculator", title: "Calculator", icon: Calculator, x: 0, y: 2, color: "text-yellow-400", type: "app", isSystemApp: true },
      { id: "textEditor", title: "Text Editor", icon: FileEdit, x: 1, y: 2, color: "text-orange-400", type: "app", isSystemApp: true },
      { id: "memory", title: "Memory Game", icon: Layout, x: 0, y: 3, color: "text-purple-400", type: "app", isSystemApp: true },
      { id: "readme", title: "README", icon: FileQuestion, x: 1, y: 3, color: "text-blue-400", type: "app", isSystemApp: true },
      { id: "calendar", title: "Calendar", icon: CalendarIcon, x: 0, y: 4, color: "text-rose-400", type: "app", isSystemApp: true },
      { id: "fileSystem", title: "Files", icon: HardDrive, x: 1, y: 4, color: "text-emerald-400", type: "app", isSystemApp: true },
    ];
    setSystemApps(defaultSystemApps);
  }, []);

  // Load files from OPFS
  const loadFilesFromOPFS = async (rootDir: FileSystemDirectoryHandle) => {
    try {
      const loadedFiles: FileSystemItem[] = [];
      
      // Recursively load files and folders
      const loadFilesRecursive = async (
        dirHandle: FileSystemDirectoryHandle,
        parentId: string | null = null
      ) => {
        for await (const [name, handle] of dirHandle.entries()) {
          const fileId = `${handle.kind}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          if (handle.kind === 'file') {
            const file = await (handle as FileSystemFileHandle).getFile();
            const content = await file.text();
            
            loadedFiles.push({
              id: fileId,
              name,
              type: 'file',
              icon: 'file-text',
              created: new Date(file.lastModified),
              modified: new Date(file.lastModified),
              size: file.size,
              content,
              parent: parentId || undefined
            });
          } else if (handle.kind === 'directory') {
            // Add the folder
            loadedFiles.push({
              id: fileId,
              name,
              type: 'folder',
              icon: 'folder',
              created: new Date(),
              modified: new Date(),
              parent: parentId || undefined
            });
            
            // Recursively load contents
            await loadFilesRecursive(handle as FileSystemDirectoryHandle, fileId);
          }
        }
      };
      
      await loadFilesRecursive(rootDir);
      setFiles(loadedFiles);

      // Load desktop items
      const desktopInfoFile = await getDesktopInfoFile(rootDir);
      if (desktopInfoFile) {
        const desktopData = JSON.parse(desktopInfoFile);
        
        // Convert file items to desktop items
        const desktopAppIcons: AppIcon[] = desktopData.map((item: any) => {
          // Convert string icons to component icons for desktop display
          let icon: any = FileEdit;
          if (item.type === 'folder') {
            icon = Folder;
          } else if (item.type === 'application') {
            // Handle app icons here
          }
          
          return {
            id: item.id,
            title: item.name,
            icon,
            x: item.x || 0,
            y: item.y || 0,
            color: item.color || generateRandomColor(),
            type: item.type === 'application' ? 'app' : item.type
          };
        });
        
        setDesktopItems(desktopAppIcons);
      }
    } catch (error) {
      console.error('Error loading files from OPFS:', error);
    }
  };

  // Save desktop configuration
  const saveDesktopInfo = async () => {
    if (!rootDirectoryHandle) return;
    
    try {
      const fileHandle = await rootDirectoryHandle.getFileHandle('desktop.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(desktopItems.map(item => ({
        id: item.id,
        name: item.title,
        type: item.type,
        x: item.x,
        y: item.y,
        color: item.color
      }))));
      await writable.close();
    } catch (error) {
      console.error('Error saving desktop info:', error);
    }
  };

  // Get desktop info file
  const getDesktopInfoFile = async (rootDir: FileSystemDirectoryHandle) => {
    try {
      const fileHandle = await rootDir.getFileHandle('desktop.json', { create: false });
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (error) {
      // File might not exist yet
      return null;
    }
  };

  // Create default file structure
  const createDefaultFileStructure = async (rootDir: FileSystemDirectoryHandle) => {
    // Create some default folders and files
    // This is just a placeholder - you would implement this based on your needs
  };

  // Fallback to localStorage if OPFS is not supported
  const loadFilesFromLocalStorage = () => {
    try {
      const savedFiles = localStorage.getItem('filesystemData');
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles);
        const processedFiles = parsedFiles.map((file: any) => ({
          ...file,
          created: new Date(file.created),
          modified: new Date(file.modified)
        }));
        setFiles(processedFiles);
      }
      
      const savedDesktop = localStorage.getItem('desktopItems');
      if (savedDesktop) {
        setDesktopItems(JSON.parse(savedDesktop));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    
    setIsInitialized(true);
  };

  // Save to localStorage as fallback
  useEffect(() => {
    if (files.length > 0 && !rootDirectoryHandle) {
      localStorage.setItem('filesystemData', JSON.stringify(files));
    }
  }, [files, rootDirectoryHandle]);

  useEffect(() => {
    if (desktopItems.length > 0) {
      if (rootDirectoryHandle) {
        saveDesktopInfo();
      } else {
        localStorage.setItem('desktopItems', JSON.stringify(desktopItems));
      }
    }
  }, [desktopItems, rootDirectoryHandle]);

  // Load persisted data
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        await fileSystem.init();
        
        // Load icon positions and other config
        const systemConfigData = await fileSystem.readFile([], 'system-config.json', true);
        if (systemConfigData) {
          const config = JSON.parse(systemConfigData.content as string);
          setIconPositions(config.iconPositions || {});
          setDesktopItems(config.desktopItems || []);
        }
      } catch (error) {
        console.error('Error loading persisted data:', error);
      }
    };

    loadPersistedData();
  }, []);

  // Save system configuration when it changes
  const saveSystemConfig = useCallback(async () => {
    try {
      const config = {
        iconPositions,
        desktopItems,
        systemApps
      };
      await fileSystem.writeFile([], 'system-config.json', JSON.stringify(config));
    } catch (error) {
      console.error('Error saving system config:', error);
    }
  }, [iconPositions, desktopItems, systemApps]);

  // Save whenever relevant state changes
  useEffect(() => {
    saveSystemConfig();
  }, [iconPositions, desktopItems, systemApps, saveSystemConfig]);

  // Update icon position
  const updateIconPosition = useCallback((positions: Record<string, { x: number; y: number }>) => {
    setIconPositions(prev => ({
      ...prev,
      ...positions
    }));
  }, []);

  // File operations
  const createFile = useCallback(async (name: string, parentId: string | null = null): Promise<FileSystemItem> => {
    if (!name.trim()) throw new Error('File name cannot be empty');
    
    const newFile: FileSystemItem = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'file',
      icon: 'file-text',
      created: new Date(),
      modified: new Date(),
      size: 0,
      content: '',
      parent: parentId || undefined
    };
    
    if (rootDirectoryHandle) {
      try {
        // Create file in OPFS
        let targetDir = rootDirectoryHandle;
        
        // If parentId is provided, navigate to that directory
        if (parentId) {
          const parentFolder = files.find(f => f.id === parentId);
          if (parentFolder && parentFolder.type === 'folder') {
            // Navigate to the parent folder in OPFS
            const pathSegments = getPathToFolder(parentId);
            for (const segment of pathSegments) {
              targetDir = await targetDir.getDirectoryHandle(segment, { create: true });
            }
          }
        }
        
        const fileHandle = await targetDir.getFileHandle(name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write('');
        await writable.close();
      } catch (error) {
        console.error('Error creating file in OPFS:', error);
      }
    }
    
    setFiles(prev => [...prev, newFile]);
    return newFile;
  }, [files, rootDirectoryHandle]);

  const createFolder = useCallback(async (name: string, parentId: string | null = null): Promise<FileSystemItem> => {
    if (!name.trim()) throw new Error('Folder name cannot be empty');
    
    const newFolder: FileSystemItem = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'folder',
      icon: 'folder',
      created: new Date(),
      modified: new Date(),
      parent: parentId || undefined
    };
    
    if (rootDirectoryHandle) {
      try {
        // Create folder in OPFS
        let targetDir = rootDirectoryHandle;
        
        // If parentId is provided, navigate to that directory
        if (parentId) {
          const pathSegments = getPathToFolder(parentId);
          for (const segment of pathSegments) {
            targetDir = await targetDir.getDirectoryHandle(segment, { create: true });
          }
        }
        
        await targetDir.getDirectoryHandle(name, { create: true });
      } catch (error) {
        console.error('Error creating folder in OPFS:', error);
      }
    }
    
    setFiles(prev => [...prev, newFolder]);
    return newFolder;
  }, [files, rootDirectoryHandle]);

  // Helper function to get path to a folder
  const getPathToFolder = (folderId: string): string[] => {
    const path: string[] = [];
    let currentId = folderId;
    
    while (currentId) {
      const folder = files.find(f => f.id === currentId);
      if (!folder) break;
      
      path.unshift(folder.name);
      currentId = folder.parent || '';
    }
    
    return path;
  };

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    const item = files.find(f => f.id === id);
    if (!item) return;
    
    // Delete from OPFS if available
    if (rootDirectoryHandle) {
      try {
        const path = getPathToItem(id);
        if (path.length > 0) {
          let targetDir = rootDirectoryHandle;
          
          // Navigate to the parent directory
          for (let i = 0; i < path.length - 1; i++) {
            targetDir = await targetDir.getDirectoryHandle(path[i], { create: false });
          }
          
          // Remove the item
          await targetDir.removeEntry(path[path.length - 1], { recursive: item.type === 'folder' });
        }
      } catch (error) {
        console.error('Error deleting item from OPFS:', error);
      }
    }
    
    // If it's a folder, also delete all its children
    if (item.type === 'folder') {
      const childIds = getChildrenIds(id);
      setFiles(prev => prev.filter(f => f.id !== id && !childIds.includes(f.id)));
    } else {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
    
    // Also remove from desktop if it exists there
    setDesktopItems(prev => prev.filter(d => d.id !== id));
  }, [files, rootDirectoryHandle]);

  // Helper function to get full path to an item
  const getPathToItem = (itemId: string): string[] => {
    const item = files.find(f => f.id === itemId);
    if (!item) return [];
    
    const path = [item.name];
    let parentId = item.parent;
    
    while (parentId) {
      const parent = files.find(f => f.id === parentId);
      if (!parent) break;
      
      path.unshift(parent.name);
      parentId = parent.parent;
    }
    
    return path;
  };

  // Helper function to get all children of a folder
  const getChildrenIds = (folderId: string): string[] => {
    const result: string[] = [];
    const directChildren = files.filter(f => f.parent === folderId);
    
    for (const child of directChildren) {
      result.push(child.id);
      if (child.type === 'folder') {
        result.push(...getChildrenIds(child.id));
      }
    }
    
    return result;
  };

  const renameItem = useCallback(async (id: string, newName: string): Promise<void> => {
    if (!newName.trim()) throw new Error('Name cannot be empty');
    
    const item = files.find(f => f.id === id);
    if (!item) return;
    
    // Rename in OPFS if available
    if (rootDirectoryHandle) {
      // Renaming in OPFS requires moving the file/folder to a new entry with the new name
      // This is a more complex operation that would require implementing here
    }
    
    // Update in memory
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, name: newName, modified: new Date() } : f
    ));
    
    // Update desktop item if it exists
    setDesktopItems(prev => prev.map(d => 
      d.id === id ? { ...d, title: newName } : d
    ));
  }, [files, rootDirectoryHandle]);

  const updateItemContent = useCallback(async (id: string, content: string): Promise<void> => {
    const file = files.find(f => f.id === id && f.type === 'file');
    if (!file) return;
    
    // Update in OPFS if available
    if (rootDirectoryHandle) {
      try {
        const path = getPathToItem(id);
        if (path.length > 0) {
          let targetDir = rootDirectoryHandle;
          
          // Navigate to the parent directory
          for (let i = 0; i < path.length - 1; i++) {
            targetDir = await targetDir.getDirectoryHandle(path[i], { create: false });
          }
          
          // Update the file
          const fileHandle = await targetDir.getFileHandle(path[path.length - 1], { create: false });
          const writable = await fileHandle.createWritable();
          await writable.write(content);
          await writable.close();
        }
      } catch (error) {
        console.error('Error updating file content in OPFS:', error);
      }
    }
    
    // Update in memory
    setFiles(prev => prev.map(f => 
      f.id === id ? { 
        ...f, 
        content, 
        modified: new Date(),
        size: new Blob([content]).size
      } : f
    ));
  }, [files, rootDirectoryHandle]);

  const getItemContent = useCallback(async (id: string): Promise<string | undefined> => {
    const file = files.find(f => f.id === id && f.type === 'file');
    if (!file) return undefined;
    
    // If we have the content in memory, return it
    if (file.content !== undefined) {
      return file.content;
    }
    
    // Try to load from OPFS if available
    if (rootDirectoryHandle) {
      try {
        const path = getPathToItem(id);
        if (path.length > 0) {
          let targetDir = rootDirectoryHandle;
          
          // Navigate to the parent directory
          for (let i = 0; i < path.length - 1; i++) {
            targetDir = await targetDir.getDirectoryHandle(path[i], { create: false });
          }
          
          // Get the file
          const fileHandle = await targetDir.getFileHandle(path[path.length - 1], { create: false });
          const fileObj = await fileHandle.getFile();
          const content = await fileObj.text();
          
          // Update in memory for next time
          setFiles(prev => prev.map(f => 
            f.id === id ? { ...f, content } : f
          ));
          
          return content;
        }
      } catch (error) {
        console.error('Error reading file content from OPFS:', error);
      }
    }
    
    return '';
  }, [files, rootDirectoryHandle]);

  const getItemsInFolder = useCallback((folderId: string | null) => {
    return files.filter(f => f.parent === folderId);
  }, [files]);

  const moveItem = useCallback(async (id: string, newParentId: string | null): Promise<void> => {
    const item = files.find(f => f.id === id);
    if (!item) return;
    
    // Prevent moving a folder into itself or its descendants
    if (item.type === 'folder' && newParentId) {
      const childIds = getChildrenIds(item.id);
      if (childIds.includes(newParentId) || newParentId === item.id) {
        throw new Error('Cannot move a folder into itself or its descendants');
      }
    }
    
    // Move in OPFS if available
    if (rootDirectoryHandle) {
      // Moving in OPFS would be implemented here
      // This is a complex operation similar to renaming
    }
    
    // Update in memory
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, parent: newParentId || undefined, modified: new Date() } : f
    ));
  }, [files, rootDirectoryHandle]);

  const sortItems = useCallback((items: FileSystemItem[], sortType: string): FileSystemItem[] => {
    const sortedItems = [...items];
    
    switch (sortType) {
      case 'name':
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortedItems.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'date':
        sortedItems.sort((a, b) => b.modified.getTime() - a.modified.getTime());
        break;
      case 'size':
        sortedItems.sort((a, b) => (b.size || 0) - (a.size || 0));
        break;
      case 'type':
        sortedItems.sort((a, b) => {
          if (a.type !== b.type) {
            // Folders first
            if (a.type === 'folder') return -1;
            if (b.type === 'folder') return 1;
            return a.type.localeCompare(b.type);
          }
          return a.name.localeCompare(b.name);
        });
        break;
      default:
        break;
    }
    
    return sortedItems;
  }, []);

  const addToDesktop = useCallback((item: FileSystemItem) => {
    // Find a free position on desktop
    const maxY = desktopItems.length > 0 ? 
      Math.max(...desktopItems.map(i => i.y || 0)) + 1 : 
      0;
    
    // Convert FileSystemItem to AppIcon
    let iconComponent: any = FileEdit;
    if (item.type === 'folder') {
      iconComponent = Folder;
    }
    
    const desktopIcon: AppIcon = {
      id: item.id,
      title: item.name,
      icon: iconComponent,
      x: 0,
      y: maxY,
      color: item.color || generateRandomColor(),
      type: item.type === 'application' ? 'app' : item.type
    };
    
    setDesktopItems(prev => [...prev, desktopIcon]);
  }, [desktopItems]);

  const removeFromDesktop = useCallback((id: string) => {
    setDesktopItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Update icon title
  const updateIconTitle = useCallback((id: string, newTitle: string) => {
    setDesktopItems(prev => prev.map(item => 
      item.id === id ? { ...item, title: newTitle } : item
    ));
    
    // Also update system apps if it's a system app
    setSystemApps(prev => prev.map(item =>
      item.id === id ? { ...item, title: newTitle } : item
    ));

    // Save the updated configuration
    saveSystemConfig();
  }, [saveSystemConfig]);

  // Delete icon
  const deleteIcon = useCallback((id: string) => {
    // Remove from desktop items
    setDesktopItems(prev => prev.filter(item => item.id !== id));
    
    // Remove from system apps if it's a system app
    setSystemApps(prev => prev.filter(item => item.id !== id));
    
    // Remove from positions
    setIconPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[id];
      return newPositions;
    });

    // Save the updated configuration
    saveSystemConfig();
  }, [saveSystemConfig]);

  const contextValue: FileSystemContextType = {
    files,
    desktopItems,
    isInitialized,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    updateItemContent,
    getItemContent,
    getItemsInFolder,
    moveItem,
    sortItems,
    addToDesktop,
    removeFromDesktop,
    systemApps,
    updateIconPosition,
    updateIconTitle,
    deleteIcon,
  };

  return (
    <FileSystemContext.Provider value={contextValue}>
      {children}
    </FileSystemContext.Provider>
  );
};