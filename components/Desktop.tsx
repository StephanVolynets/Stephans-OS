"use client";

import { useWindows } from "@/contexts/WindowsContext";
import Window from "@/components/Window";
import {
  FileText,
  Terminal,
  Calculator,
  Image,
  Folder,
  Info,
  Monitor,
  Users,
  FileEdit,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ContextMenu } from "./desktop/ContextMenu";
import { DesktopGrid } from "./desktop/DesktopGrid";
import { FileExplorer } from "./FileExplorer";
import { AboutMeContent } from "./AboutMeContent";
import { TextEditor } from "./TextEditor";
import { useContextMenu } from "@/hooks/useContextMenu";
import { generateRandomColor } from "@/lib/utils";

interface AppIcon {
  id: string;
  title: string;
  icon: any;
  x: number;
  y: number;
  color: string;
}

const getRandomWindowPosition = (width: number, height: number) => {
  const centerX = (window.innerWidth - width) / 2;
  const centerY = (window.innerHeight - height - 48) / 2;
  const maxOffset = Math.min(200, Math.min(centerX, centerY) / 2);
  
  const offsetX = (Math.random() - 0.5) * maxOffset * 2;
  const offsetY = (Math.random() - 0.5) * maxOffset * 2;

  return {
    x: Math.max(0, Math.min(window.innerWidth - width, centerX + offsetX)),
    y: Math.max(0, Math.min(window.innerHeight - height - 48, centerY + offsetY))
  };
};

export default function Desktop() {
  const { windows, openWindow, isWindowOpen, focusWindow } = useWindows();
  const desktopRef = useRef<HTMLDivElement>(null);
  const { menuProps, handleContextMenu, closeMenu } = useContextMenu({ containerRef: desktopRef });
  const [icons, setIcons] = useState<AppIcon[]>([
    { id: "notepad", title: "Notepad", icon: FileText, x: 0, y: 0, color: "text-blue-400" },
    { id: "terminal", title: "Terminal", icon: Terminal, x: 1, y: 0, color: "text-green-400" },
    { id: "calculator", title: "Calculator", icon: Calculator, x: 2, y: 0, color: "text-yellow-400" },
    { id: "imageViewer", title: "Images", icon: Image, x: 3, y: 0, color: "text-purple-400" },
    { id: "aboutMe", title: "About Me", icon: Info, x: 0, y: 1, color: "text-cyan-400" },
    { id: "myPC", title: "My PC", icon: Monitor, x: 1, y: 1, color: "text-indigo-400" },
    { id: "public", title: "Public", icon: Users, x: 2, y: 1, color: "text-pink-400" },
    { id: "textEditor", title: "Text Editor", icon: FileEdit, x: 3, y: 1, color: "text-orange-400" },
  ]);

  const [editingIcon, setEditingIcon] = useState<string | null>(null);
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());

  const handleIconOpen = useCallback((icon: AppIcon) => {
    if (isWindowOpen(icon.id)) {
      focusWindow(icon.id);
      return;
    }

    const width = 600;
    const height = 400;
    const position = getRandomWindowPosition(width, height);

    const aboutMeContent = <AboutMeContent />;
    const content = icon.id === 'myPC' ? (
      <FileExplorer icons={icons} aboutMeContent={aboutMeContent} />
    ) : icon.id === 'aboutMe' ? (
      aboutMeContent
    ) : icon.id === 'public' ? (
      <div className="prose dark:prose-invert">
        <h2>Public Folder</h2>
        <p>This is a shared space for all users. Content coming soon!</p>
      </div>
    ) : icon.id === 'textEditor' ? (
      <TextEditor id={icon.id} />
    ) : (
      `Content for ${icon.title}`
    );

    openWindow({
      id: icon.id,
      title: icon.title,
      content,
      ...position,
      width: icon.id === 'textEditor' ? 800 : width,
      height: icon.id === 'textEditor' ? 600 : height,
    });
  }, [openWindow, isWindowOpen, focusWindow, icons]);

  const handleNewTextFile = useCallback(() => {
    const newId = `text-${Date.now()}`;
    const newIcon = {
      id: newId,
      title: "New Text File",
      icon: FileText,
      x: 0,
      y: icons.length,
      color: generateRandomColor()
    };
    setIcons(prev => [...prev, newIcon]);
    closeMenu();
    handleIconOpen(newIcon);
  }, [icons, closeMenu, handleIconOpen]);

  const handleNewFolder = useCallback(() => {
    const newId = `folder-${Date.now()}`;
    setIcons(prev => [...prev, {
      id: newId,
      title: "New Folder",
      icon: Folder,
      x: 0,
      y: prev.length,
      color: "text-neutral-400"
    }]);
    closeMenu();
  }, [closeMenu]);

  const handleRenameIcon = useCallback((iconId: string) => {
    setEditingIcon(iconId);
    closeMenu();
  }, [closeMenu]);

  const handleRenameComplete = useCallback((iconId: string, newName: string) => {
    if (newName.trim()) {
      setIcons(prev => prev.map(icon => 
        icon.id === iconId ? { ...icon, title: newName } : icon
      ));
    }
    setEditingIcon(null);
  }, []);

  const handleDeleteIcon = useCallback((iconId: string) => {
    setIcons(prev => prev.filter(icon => icon.id !== iconId));
    closeMenu();
  }, [closeMenu]);

  const handleDuplicateIcon = useCallback((iconId: string) => {
    const iconToDuplicate = icons.find(icon => icon.id === iconId);
    if (!iconToDuplicate) return;

    const newIcon = {
      ...iconToDuplicate,
      id: `${iconToDuplicate.id}-${Date.now()}`,
      title: `${iconToDuplicate.title} Copy`,
      x: 0,
      y: icons.length,
      color: generateRandomColor()
    };

    setIcons(prev => [...prev, newIcon]);
    closeMenu();
  }, [icons, closeMenu]);

  const handleOpenIcon = useCallback((iconId: string) => {
    const icon = icons.find(i => i.id === iconId);
    if (icon) {
      handleIconOpen(icon);
      closeMenu();
    }
  }, [icons, handleIconOpen, closeMenu]);

  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    setSelectedIcons(new Set(selectedIds));
  }, []);

  return (
    <div
      ref={desktopRef}
      className={cn(
        "flex-1 relative overflow-hidden",
        "contain-layout"
      )}
      onContextMenu={(e) => handleContextMenu(e)}
    >
      <DesktopGrid
        icons={icons}
        onIconsChange={setIcons}
        onIconOpen={handleIconOpen}
        onContextMenu={handleContextMenu}
        editingIcon={editingIcon}
        onRenameComplete={handleRenameComplete}
        selectedIcons={selectedIcons}
        onSelectionChange={handleSelectionChange}
      >
        {menuProps.isOpen && (
          <ContextMenu
            x={menuProps.position.x}
            y={menuProps.position.y}
            type={menuProps.type}
            onOpen={menuProps.targetId ? () => handleOpenIcon(menuProps.targetId!) : undefined}
            onNewTextFile={handleNewTextFile}
            onNewFolder={handleNewFolder}
            onRename={menuProps.targetId ? () => handleRenameIcon(menuProps.targetId!) : undefined}
            onDelete={menuProps.targetId ? () => handleDeleteIcon(menuProps.targetId!) : undefined}
            onDuplicate={menuProps.targetId ? () => handleDuplicateIcon(menuProps.targetId!) : undefined}
            onClose={closeMenu}
          />
        )}

        {windows.map((window) => (
          <Window key={window.id} {...window} />
        ))}
      </DesktopGrid>
    </div>
  );
}