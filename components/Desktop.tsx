"use client";

import { useWindows } from "@/contexts/WindowsContext";
import { useFileSystem } from "@/contexts/FileSystemContext";
import Window from "@/components/Window";
import {
  Terminal,
  Calculator,
  Monitor,
  Info,
  FileEdit,
  FileQuestion,
  Layout,
  Cloud,
  Calendar as CalendarIcon,
  HardDrive,
  Folder,
  Globe,
  Code
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { DesktopGrid } from "./desktop/DesktopGrid";
import { FileExplorer } from "./FileExplorer";
import { AboutMeContent } from "./AboutMeContent";
import { TextEditor } from "./TextEditor";
import { useContextMenu } from "@/hooks/useContextMenu";
import { generateRandomColor } from "@/lib/utils";
import type { AppIcon, WindowContent } from "@/types/global";
import { Calculator as CalculatorApp } from "./Calculator";
import { ReadmeContent } from "./ReadmeContent";
import { MemoryGame } from "./MemoryGame";
import { WeatherApp } from "./WeatherApp";
import { Calendar } from "./Calender";
import { FileSystemExplorer } from "./FileSystemExplorer";
import ContextMenu from './ContextMenu';
import styles from '../styles/Desktop.module.css';
import { fileSystem } from '@/lib/fileSystem';

// First, let's define our default icons outside the component to keep it clean
const DEFAULT_ICONS: AppIcon[] = [
  { id: "myPC", title: "My PC", icon: Monitor, x: 0, y: 0, color: "text-indigo-400", type: "app", isSystemApp: true },
  { id: "weather", title: "Weather", icon: Cloud, x: 1, y: 0, color: "text-sky-400", type: "app" },
  { id: "terminal", title: "Terminal", icon: Terminal, x: 0, y: 1, color: "text-green-400", type: "app" },
  { id: "aboutMe", title: "About Me", icon: Info, x: 1, y: 1, color: "text-cyan-400", type: "file" },
  { id: "calculator", title: "Calculator", icon: Calculator, x: 0, y: 2, color: "text-yellow-400", type: "app" },
  { id: "textEditor", title: "Text Editor", icon: FileEdit, x: 1, y: 2, color: "text-orange-400", type: "app" },
  { id: "memory", title: "Memory Game", icon: Layout, x: 0, y: 3, color: "text-purple-400", type: "app" },
  { id: "readme", title: "README", icon: FileQuestion, x: 1, y: 3, color: "text-blue-400", type: "app" },
  { id: "calendar", title: "Calendar", icon: CalendarIcon, x: 0, y: 4, color: "text-rose-400", type: "app" },
  { id: "fileSystem", title: "Files", icon: HardDrive, x: 1, y: 4, color: "text-emerald-400", type: "app" },
  { id: "browser", title: "Browser", icon: Globe, x: 0, y: 5, color: "text-blue-500", type: "app" },
  { id: "codeIndexer", title: "Code Indexer", icon: Code, x: 1, y: 5, color: "text-violet-400", type: "app" },
];

const LOCAL_STORAGE_KEY = 'desktop-icons-v2';

export default function Desktop() {
  const { windows, openWindow, isWindowOpen, focusWindow } = useWindows();
  
  const { 
    files, 
    desktopItems, 
    createFile, 
    createFolder, 
    deleteItem, 
    renameItem, 
    updateItemContent, 
    getItemContent,
    sortItems,
    isInitialized,
    systemApps,
    updateIconPosition,
    updateIconTitle,
    deleteIcon
  } = useFileSystem();
  
  const desktopRef = useRef<HTMLDivElement>(null);
  const { menuProps, handleContextMenu: handleGridContextMenu, closeMenu } = useContextMenu({ containerRef: desktopRef });
  
  // Replace your existing icon state management with this
  const [icons, setIcons] = useState<AppIcon[]>(() => {
    // Try to load from localStorage on initial render
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // Create a map of default icons for reference
          const defaultIconMap = DEFAULT_ICONS.reduce((map, icon) => {
            map[icon.id] = icon;
            return map;
          }, {} as Record<string, AppIcon>);
          
          // Process saved icons and merge with defaults
          const mergedIcons = parsedData.map((savedIcon: any) => {
            const defaultIcon = defaultIconMap[savedIcon.id];
            if (defaultIcon) {
              return {
                ...defaultIcon,
                x: savedIcon.x,
                y: savedIcon.y,
                title: savedIcon.title || defaultIcon.title,
                color: savedIcon.color || defaultIcon.color
              };
            }
            return savedIcon;
          });
          
          console.log('Loaded icons from localStorage:', mergedIcons);
          return mergedIcons;
        }
      }
    } catch (error) {
      console.error('Error loading icons from localStorage:', error);
    }
    
    // Fall back to defaults if loading fails
    return DEFAULT_ICONS;
  });

  // Replace your handleIconsChange function with this simpler version
  const handleIconsChange = useCallback((newIcons: AppIcon[]) => {
    setIcons(newIcons);
    
    // Save directly to localStorage without any debouncing
    try {
      const iconData = newIcons.map(icon => ({
        id: icon.id,
        x: icon.x,
        y: icon.y,
        title: icon.title,
        type: icon.type,
        isSystemApp: icon.isSystemApp,
        color: icon.color
      }));
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(iconData));
      console.log('Saved icons to localStorage:', iconData);
    } catch (error) {
      console.error('Error saving icons to localStorage:', error);
    }
  }, []);

  const [editingIcon, setEditingIcon] = useState<string | null>(null);
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; targetId?: string }>({
    visible: false,
    x: 0,
    y: 0
  });

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const getRandomWindowPosition = useCallback((width: number, height: number) => {
    const centerX = (window.innerWidth - width) / 2;
    const centerY = (window.innerHeight - height - 48) / 2;
    const maxOffset = Math.min(200, Math.min(centerX, centerY) / 2);
    
    const offsetX = (Math.random() - 0.5) * maxOffset * 2;
    const offsetY = (Math.random() - 0.5) * maxOffset * 2;

    return {
      x: Math.max(0, Math.min(window.innerWidth - width, centerX + offsetX)),
      y: Math.max(0, Math.min(window.innerHeight - height - 48, centerY + offsetY))
    };
  }, []);

  const handleIconOpen = useCallback((icon: AppIcon) => {
    if (isWindowOpen(icon.id)) {
      focusWindow(icon.id);
      return;
    }

    let width = 600;
    let height = 400;

    switch (icon.id) {
      case 'textEditor':
        width = 800;
        height = 600;
        break;
      case 'calculator':
        width = 300;
        height = 450;
        break;
      case 'memory':
        width = 450;
        height = 600;
        break;
      case 'weather':
        width = 400;
        height = 500;
        break;
      case 'calendar':
        width = 400;
        height = 500;
        break;
      case 'readme':
        width = 900;
        height = 700;
        break;
      case 'fileSystem':
        width = 800;
        height = 600;
        break;
      case 'browser':
        width = 1200;
        height = 800;
        break;
      case 'codeIndexer':
        width = 1000;
        height = 700;
        break;
    }

    const position = getRandomWindowPosition(width, height);

    let content: WindowContent;

    switch (icon.id) {
      case 'myPC':
        content = {
          type: 'file-explorer',
          icons: icons.filter(i => i.id !== 'myPC'),
          aboutMeContent: <AboutMeContent />
        };
        break;
      case 'aboutMe':
        content = {
          type: 'about',
          content: <AboutMeContent />
        };
        break;
      case 'calculator':
        content = {
          type: 'default',
          content: <CalculatorApp />
        };
        break;
      case 'memory':
        content = {
          type: 'default',
          content: <MemoryGame />
        };
        break;
      case 'weather':
        content = {
          type: 'default',
          content: <WeatherApp />
        };
        break;
      case 'readme':
        content = {
          type: 'default',
          content: <ReadmeContent />
        };
        break;
      case 'calendar':
        content = {
          type: 'default',
          content: <Calendar />
        };
        break;
      case 'browser':
        content = {
          type: 'browser'
        };
        break;
      case 'codeIndexer':
        content = {
          type: 'code-indexer'
        };
        break;
      case 'textEditor':
        content = {
          type: 'default',
          content: <TextEditor initialContent="" />
        };
        break;
      case icon.type === 'file' && icon.id:
        if (icon.id.startsWith('file-')) {
          const pathSegments = icon.id.slice(5).split('-');
          const fileName = pathSegments.pop() || '';
          const path = pathSegments;
          
          content = {
            type: 'default',
            content: <TextEditor fileId={icon.id} path={path} fileName={fileName} />
          };
        } else {
          content = {
            type: 'default',
            content: <TextEditor fileId={icon.id} />
          };
        }
        break;
      case 'terminal':
        content = {
          type: 'default',
          content: (
            <div className="font-mono p-4 bg-black text-green-400">
              <p>Terminal not implemented yet.</p>
              <p className="animate-pulse">▋</p>
            </div>
          )
        };
        break;
      case 'fileSystem':
        content = {
          type: 'default' as const,
          content: <FileSystemExplorer />
        };
        width = 800;
        height = 600;
        break;
      default:
        if (icon.type === 'file') {
          content = {
            type: 'text-editor',
            id: icon.id
          };
        } else if (icon.type === 'folder') {
          content = {
            type: 'default',
            content: <FileExplorer folderId={icon.id} title={icon.title} />
          };
        } else {
          content = {
            type: 'default',
            content: `Content for ${icon.title}`
          };
        }
    }

    openWindow({
      id: icon.id,
      title: icon.title,
      content,
      ...position,
      width,
      height,
    });
  }, [openWindow, isWindowOpen, focusWindow, icons, getRandomWindowPosition]);

  const findNextAvailablePosition = useCallback(() => {
    const maxY = Math.max(...icons.map(icon => icon.y || 0), 0) + 1;
    return { x: 0, y: maxY };
  }, [icons]);

  const handleNewFile = useCallback(async () => {
    const newFileName = prompt('Enter file name:', 'New File.txt');
    if (newFileName && newFileName.trim()) {
      try {
        const newFile = await createFile(newFileName, null);
        
        const position = findNextAvailablePosition();
        
        const newIcon: AppIcon = {
          id: newFile.id,
          title: newFile.name,
          icon: FileEdit,
          x: position.x,
          y: position.y,
          color: generateRandomColor(),
          type: 'file'
        };
        
        setIcons(prev => [...prev, newIcon]);
        
        closeContextMenu();
      } catch (error) {
        console.error('Error creating file:', error);
        alert('Failed to create file');
      }
    }
  }, [createFile, findNextAvailablePosition, closeContextMenu]);

  const handleNewFolder = useCallback(async () => {
    const newFolderName = prompt('Enter folder name:', 'New Folder');
    if (newFolderName && newFolderName.trim()) {
      try {
        const newFolder = await createFolder(newFolderName, null);
        
        const position = findNextAvailablePosition();
        
        const newIcon: AppIcon = {
          id: newFolder.id,
          title: newFolder.name,
          icon: Folder,
          x: position.x,
          y: position.y,
          color: generateRandomColor(),
          type: 'folder'
        };
        
        setIcons(prev => [...prev, newIcon]);
        
        closeMenu();
        closeContextMenu();
      } catch (error) {
        console.error('Error creating folder:', error);
        alert('Failed to create folder');
      }
    }
  }, [createFolder, findNextAvailablePosition, closeMenu, closeContextMenu]);

  const handleRenameIcon = useCallback((iconId: string) => {
    setEditingIcon(iconId);
    closeMenu();
  }, [closeMenu]);

  const handleRenameComplete = useCallback((iconId: string, newName: string) => {
    if (newName.trim()) {
      renameItem(iconId, newName)
        .then(() => {
          setIcons(prev => prev.map(icon => 
            icon.id === iconId ? { ...icon, title: newName } : icon
          ));
        })
        .catch(error => {
          console.error('Error renaming item:', error);
        });
    }
    setEditingIcon(null);
  }, [renameItem]);

  const handleDeleteIcon = useCallback((iconId: string) => {
    const icon = icons.find(i => i.id === iconId);
    if (!icon) return;
    
    const isSystemApp = icon.type === 'app';
    if (isSystemApp) {
      alert('System applications cannot be deleted.');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${icon.title}"?`)) {
      deleteItem(iconId)
        .then(() => {
          setIcons(prev => prev.filter(i => i.id !== iconId));
        })
        .catch(error => {
          console.error('Error deleting item:', error);
        });
    }
    
    closeMenu();
  }, [icons, deleteItem, closeMenu]);

  const handleDuplicateIcon = useCallback((iconId: string) => {
    const iconToDuplicate = icons.find(icon => icon.id === iconId);
    if (!iconToDuplicate) return;
    
    if (iconToDuplicate.type === 'app') {
      alert('System applications cannot be duplicated.');
      return;
    }

    if (iconToDuplicate.type === 'file') {
      getItemContent(iconId)
        .then(content => {
          if (content !== undefined) {
            return createFile(`${iconToDuplicate.title} Copy`, null)
              .then(newFile => {
                return updateItemContent(newFile.id, content)
                  .then(() => newFile);
              });
          }
        })
        .then(newFile => {
          if (newFile) {
            const position = findNextAvailablePosition();
            const newIcon: AppIcon = {
              id: newFile.id,
              title: newFile.name,
              icon: iconToDuplicate.icon,
              x: position.x,
              y: position.y,
              color: generateRandomColor(),
              type: 'file'
            };
            setIcons(prev => [...prev, newIcon]);
          }
        })
        .catch(error => {
          console.error('Error duplicating file:', error);
        });
    } else if (iconToDuplicate.type === 'folder') {
      createFolder(`${iconToDuplicate.title} Copy`, null)
        .then(newFolder => {
          const position = findNextAvailablePosition();
          const newIcon: AppIcon = {
            id: newFolder.id,
            title: newFolder.name,
            icon: Folder,
            x: position.x,
            y: position.y,
            color: generateRandomColor(),
            type: 'folder'
          };
          setIcons(prev => [...prev, newIcon]);
        })
        .catch(error => {
          console.error('Error duplicating folder:', error);
        });
    }
    
    closeMenu();
  }, [icons, getItemContent, createFile, updateItemContent, createFolder, findNextAvailablePosition, closeMenu]);

  const handleOpenIcon = useCallback((iconId: string) => {
    const icon = icons.find(i => i.id === iconId);
    if (icon) {
      handleIconOpen(icon);
    }
    closeMenu();
  }, [icons, handleIconOpen, closeMenu]);

  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    setSelectedIcons(new Set(selectedIds));
  }, []);

  const desktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    const element = e.target as HTMLElement;
    const iconElement = element.closest('[data-icon-id]');
    const targetId = iconElement ? iconElement.getAttribute('data-icon-id') || undefined : undefined;
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetId
    });
  }, []);

  const handleSort = useCallback((sortType: string) => {
    const userIcons = icons.filter(icon => icon.type !== 'app');
    const systemIcons = icons.filter(icon => icon.type === 'app');
    
    const fileSystemItems = userIcons.map(icon => ({
      id: icon.id,
      name: icon.title,
      type: icon.type === 'file' ? 'file' as const : 'folder' as const,
      icon: icon.icon,
      created: new Date(),
      modified: new Date(),
    }));
    
    const sortedItems = sortItems(fileSystemItems, sortType);
    
    const sortedIcons = sortedItems.map((item, index) => {
      const originalIcon = userIcons.find(i => i.id === item.id)!;
      const row = Math.floor(index / 2);
      const col = index % 2;
      
      return {
        ...originalIcon,
        title: item.name,
        x: col,
        y: systemIcons.length / 2 + row
      };
    });
    
    setIcons([...systemIcons, ...sortedIcons]);
    closeContextMenu();
  }, [icons, sortItems, closeContextMenu]);

  const handleRefresh = useCallback(() => {
    setIcons([...icons]);
    closeContextMenu();
  }, [icons, closeContextMenu]);

  const handleChangeBackground = useCallback(() => {
    alert('Change Background functionality would go here');
    closeContextMenu();
  }, [closeContextMenu]);

  const handleDisplaySettings = useCallback(() => {
    alert('Display Settings functionality would go here');
    closeContextMenu();
  }, [closeContextMenu]);

  const getContextMenuType = useCallback((targetId?: string) => {
    if (!targetId) return 'desktop';
    
    const icon = icons.find(i => i.id === targetId);
    if (!icon) return 'desktop';
    
    return icon.type;
  }, [icons]);

  return (
    <div
      ref={desktopRef}
      className={cn(
        "flex-1 relative overflow-hidden",
        "contain-layout"
      )}
      onContextMenu={desktopContextMenu}
    >
      <DesktopGrid
        icons={icons}
        onIconsChange={handleIconsChange}
        onIconOpen={handleIconOpen}
        onContextMenu={handleGridContextMenu}
        editingIcon={editingIcon}
        onRenameComplete={handleRenameComplete}
        selectedIcons={selectedIcons}
        onSelectionChange={handleSelectionChange}
        columns={2}
      >
        {menuProps.isOpen && (
          <ContextMenu
            x={menuProps.position.x}
            y={menuProps.position.y}
            type={getContextMenuType(menuProps.targetId)}
            targetId={menuProps.targetId}
            onClose={closeMenu}
            onOpen={menuProps.targetId ? () => handleOpenIcon(menuProps.targetId!) : undefined}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onRename={menuProps.targetId ? () => handleRenameIcon(menuProps.targetId!) : undefined}
            onDelete={menuProps.targetId ? () => handleDeleteIcon(menuProps.targetId!) : undefined}
            onDuplicate={menuProps.targetId ? () => handleDuplicateIcon(menuProps.targetId!) : undefined}
            onSort={handleSort}
            onRefresh={handleRefresh}
            onChangeBackground={handleChangeBackground}
            onDisplaySettings={handleDisplaySettings}
          />
        )}

        {windows.map((window) => (
          <Window key={window.id} {...window} />
        ))}
      </DesktopGrid>

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={getContextMenuType(contextMenu.targetId)}
          targetId={contextMenu.targetId}
          onClose={closeContextMenu}
          onOpen={contextMenu.targetId ? () => handleOpenIcon(contextMenu.targetId!) : undefined}
          onNewFile={handleNewFile}
          onNewFolder={handleNewFolder}
          onRename={contextMenu.targetId ? () => handleRenameIcon(contextMenu.targetId!) : undefined}
          onDelete={contextMenu.targetId ? () => handleDeleteIcon(contextMenu.targetId!) : undefined}
          onDuplicate={contextMenu.targetId ? () => handleDuplicateIcon(contextMenu.targetId!) : undefined}
          onSort={handleSort}
          onRefresh={handleRefresh}
          onChangeBackground={handleChangeBackground}
          onDisplaySettings={handleDisplaySettings}
        />
      )}
    </div>
  );
}