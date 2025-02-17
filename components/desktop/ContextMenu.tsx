"use client";

import * as React from 'react';
import { motion } from "framer-motion";
import {
  FileText,
  FolderPlus,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Copy,
  Settings,
  RefreshCw,
  Grid,
  MonitorSmartphone,
  ChevronRight,
  SortAsc,
  SortDesc,
  Calendar,
  FileType2,
  HardDrive
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MenuPosition {
  x: number;
  y: number;
}

interface MenuItem {
  icon?: React.ElementType;
  label: string;
  action?: () => void;
  submenu?: MenuItem[];
  divider?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'desktop' | 'file' | 'folder';
  onOpen?: () => void;
  onNewTextFile?: () => void;
  onNewFolder?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onClose: () => void;
}

export function ContextMenu({
  x,
  y,
  type,
  onOpen,
  onNewTextFile,
  onNewFolder,
  onRename,
  onDelete,
  onDuplicate,
  onClose
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<MenuPosition | null>(null);

  // Define menu items based on context type
  const getMenuItems = (): (MenuItem | { divider: true })[] => {
    switch (type) {
      case 'file':
        return [
          { icon: FileText, label: 'Open', action: onOpen },
          { divider: true, label: '' },
          { icon: Pencil, label: 'Rename', action: onRename },
          { icon: Copy, label: 'Duplicate', action: onDuplicate },
          { icon: Trash2, label: 'Delete', action: onDelete },
          { divider: true, label: '' },
          { icon: Settings, label: 'Properties', disabled: true }
        ];
      case 'folder':
        return [
          { icon: FileText, label: 'Open', action: onOpen },
          { divider: true, label: '' },
          {
            icon: FolderPlus,
            label: 'New',
            submenu: [
              { icon: FileText, label: 'Text Document', action: onNewTextFile },
              { icon: FolderPlus, label: 'Folder', action: onNewFolder }
            ]
          },
          {
            icon: SortAsc,
            label: 'Sort by',
            submenu: [
              { icon: SortAsc, label: 'Name (A → Z)', disabled: true },
              { icon: SortDesc, label: 'Name (Z → A)', disabled: true },
              { icon: Calendar, label: 'Date modified', disabled: true },
              { icon: FileType2, label: 'Type', disabled: true },
              { icon: HardDrive, label: 'Size', disabled: true }
            ]
          },
          { divider: true, label: '' },
          { icon: Pencil, label: 'Rename', action: onRename },
          { icon: Trash2, label: 'Delete', action: onDelete }
        ];
      default: // desktop
        return [
          {
            icon: FolderPlus,
            label: 'New',
            submenu: [
              { icon: FileText, label: 'Text Document', action: onNewTextFile },
              { icon: FolderPlus, label: 'Folder', action: onNewFolder }
            ]
          },
          { divider: true, label: '' },
          {
            icon: SortAsc,
            label: 'Sort by',
            submenu: [
              { icon: SortAsc, label: 'Name (A → Z)', disabled: true },
              { icon: SortDesc, label: 'Name (Z → A)', disabled: true },
              { icon: Calendar, label: 'Date modified', disabled: true },
              { icon: FileType2, label: 'Type', disabled: true }
            ]
          },
          { icon: Grid, label: 'View', submenu: [
            { label: 'Large icons', disabled: true },
            { label: 'Medium icons', disabled: true },
            { label: 'Small icons', disabled: true },
          ]},
          { divider: true, label: '' },
          { icon: RefreshCw, label: 'Refresh', action: () => window.location.reload() },
          { divider: true, label: '' },
          { icon: ImageIcon, label: 'Change Background', disabled: true },
          { icon: MonitorSmartphone, label: 'Display Settings', disabled: true }
        ];
    }
  };

  const handleItemClick = (item: MenuItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (item.submenu) {
      return; // Don't close menu for submenu items
    }
    
    if (!item.disabled && item.action) {
      item.action();
      onClose();
    }
  };

  const handleMouseEnter = (item: MenuItem, event: React.MouseEvent) => {
    if (item.submenu) {
      const menuItem = event.currentTarget as HTMLElement;
      const rect = menuItem.getBoundingClientRect();
      setActiveSubmenu(item.label);
      setSubmenuPosition({
        x: rect.right,
        y: rect.top
      });
    } else {
      setActiveSubmenu(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust menu position to prevent it from going off screen
  const adjustPosition = (x: number, y: number, isSubmenu = false): { x: number; y: number } => {
    if (!menuRef.current) return { x, y };

    const menuRect = menuRef.current.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (!isSubmenu && x + menuRect.width > screenWidth) {
      adjustedX = screenWidth - menuRect.width - 8;
    }

    if (!isSubmenu && y + menuRect.height > screenHeight) {
      adjustedY = screenHeight - menuRect.height - 8;
    }

    return { x: adjustedX, y: adjustedY };
  };

  const position = adjustPosition(x, y);
  const menuItems = getMenuItems();

  const renderSubmenu = (items: MenuItem[], parentLabel: string) => {
    if (activeSubmenu !== parentLabel || !submenuPosition) return null;

    const adjustedPosition = adjustPosition(submenuPosition.x, submenuPosition.y, true);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed bg-card/95 backdrop-blur rounded-lg shadow-lg border border-border overflow-hidden z-50"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          minWidth: '200px'
        }}
      >
        {items.map((item, index) => (
          <button
            key={index}
            className={cn(
              "w-full px-4 py-2 text-sm flex items-center gap-2",
              "hover:bg-accent focus:bg-accent outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            onClick={(e) => handleItemClick(item, e)}
            disabled={item.disabled}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span className="flex-grow text-left">{item.label}</span>
          </button>
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div
      ref={menuRef}
      className="fixed bg-card/95 backdrop-blur rounded-lg shadow-lg border border-border overflow-hidden z-50"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      style={{
        left: position.x,
        top: position.y,
        minWidth: '200px'
      }}
    >
      <div className="py-1">
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {'divider' in item ? (
              <div className="h-px bg-border my-1" />
            ) : (
              <button
                className={cn(
                  "w-full px-4 py-2 text-sm flex items-center gap-2",
                  "hover:bg-accent focus:bg-accent outline-none",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                onClick={(e) => handleItemClick(item, e)}
                onMouseEnter={(e) => handleMouseEnter(item, e)}
                disabled={item.disabled}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span className="flex-grow text-left">{item.label}</span>
                {item.submenu && <ChevronRight className="h-4 w-4" />}
              </button>
            )}
            {!('divider' in item) && item.submenu && renderSubmenu(item.submenu, item.label)}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}