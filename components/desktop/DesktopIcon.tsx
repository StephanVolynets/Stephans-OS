"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef, useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface ClickInfo {
  x: number;
  y: number;
  time: number;
}

interface DesktopIconProps {
  id: string;
  title: string;
  icon: any;
  x: number;
  y: number;
  width: number;
  height: number;
  gap: number;
  isDragging: boolean;
  isSelected: boolean;
  isEditing?: boolean;
  color: string;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, type: 'desktop' | 'file' | 'folder', targetId?: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDrag: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onRenameComplete?: (id: string, newName: string) => void;
  onSelectionUpdate?: (rect: DOMRect) => void;
}

const DOUBLE_CLICK_DELAY = 500;
const DOUBLE_CLICK_DISTANCE = 10;

export function DesktopIcon({
  id,
  title,
  icon: Icon,
  x,
  y,
  width,
  height,
  gap,
  isDragging,
  isSelected,
  isEditing,
  color,
  onSelect,
  onOpen,
  onContextMenu,
  onDragStart,
  onDrag,
  onDragEnd,
  onRenameComplete,
  onSelectionUpdate,
}: DesktopIconProps) {
  const iconRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastClick = useRef<ClickInfo | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [editValue, setEditValue] = useState(title);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (iconRef.current && onSelectionUpdate) {
      const rect = iconRef.current.getBoundingClientRect();
      onSelectionUpdate(rect);
    }
  }, [x, y, onSelectionUpdate]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(e);

    const currentClick: ClickInfo = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };

    if (lastClick.current) {
      const timeDiff = currentClick.time - lastClick.current.time;
      const distance = Math.sqrt(
        Math.pow(currentClick.x - lastClick.current.x, 2) +
        Math.pow(currentClick.y - lastClick.current.y, 2)
      );

      if (timeDiff < DOUBLE_CLICK_DELAY && distance < DOUBLE_CLICK_DISTANCE) {
        onOpen(id);
        lastClick.current = null;
        return;
      }
    }

    lastClick.current = currentClick;
  }, [id, onSelect, onOpen]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, 'file', id);
  }, [id, onContextMenu]);

  const handleRenameComplete = useCallback((e: React.KeyboardEvent | React.FocusEvent) => {
    if ('key' in e && e.key !== 'Enter') {
      return;
    }
    if (editValue.trim() && onRenameComplete) {
      onRenameComplete(id, editValue);
    }
  }, [id, editValue, onRenameComplete]);

  return (
    <motion.div
      ref={iconRef}
      className={cn(
        "absolute flex flex-col items-center justify-center p-2",
        "highlight-hover",
        isDragging && "opacity-50",
        isSelected && "bg-primary/20 rounded-lg",
        isHovered && !isDragging && "scale-105"
      )}
      style={{
        width,
        height,
        left: x * (width + gap),
        top: y * (height + gap),
        borderRadius: '0.5rem',
        willChange: 'transform, background-color',
        touchAction: 'none',
      }}
      animate={{
        scale: isDragging ? 1.05 : 1,
      }}
      draggable={!isEditing}
      onDragStart={(e: any) => onDragStart(e as React.DragEvent)}
      onDrag={(e: any) => onDrag(e as React.DragEvent)}
      onDragEnd={onDragEnd}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
    >
      <Icon className={cn("h-8 w-8 pointer-events-none transition-transform", color)} />
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleRenameComplete}
          onBlur={handleRenameComplete}
          className="mt-2 h-6 text-xs text-center bg-background/50"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="text-white text-xs text-foreground font-medium truncate max-w-full mt-2 pointer-events-none">
          {title}
        </span>
      )}
    </motion.div>
  );
}