"use client";

import { useState, useCallback, useRef } from 'react';

interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface UseSelectionOptions {
  containerRef: React.RefObject<HTMLElement>;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function useSelection({ containerRef, onSelectionChange }: UseSelectionOptions) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const selectedIdsRef = useRef<Set<string>>(new Set());
  const startTimeRef = useRef<number>(0);

  const getRelativeCoordinates = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, [containerRef]);

  const handleSelectionStart = useCallback((e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).classList.contains('desktop-grid')) return;
    
    const { x, y } = getRelativeCoordinates(e);
    setIsSelecting(true);
    setSelectionBox({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y
    });
    startTimeRef.current = Date.now();
    selectedIdsRef.current.clear();
  }, [getRelativeCoordinates]);

  const handleSelectionMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionBox) return;

    const { x, y } = getRelativeCoordinates(e);
    setSelectionBox(prev => prev ? {
      ...prev,
      currentX: x,
      currentY: y
    } : null);
  }, [isSelecting, selectionBox, getRelativeCoordinates]);

  const handleSelectionEnd = useCallback(() => {
    if (!isSelecting) return;

    // Only update selection if the drag lasted longer than 150ms
    // This prevents accidental selections when clicking
    const dragDuration = Date.now() - startTimeRef.current;
    if (dragDuration >= 150) {
      onSelectionChange?.(Array.from(selectedIdsRef.current));
    }

    setIsSelecting(false);
    setSelectionBox(null);
  }, [isSelecting, onSelectionChange]);

  const isIntersecting = useCallback((iconRect: DOMRect) => {
    if (!selectionBox || !containerRef.current) return false;

    const containerRect = containerRef.current.getBoundingClientRect();
    const selectionRect = {
      left: Math.min(selectionBox.startX, selectionBox.currentX),
      top: Math.min(selectionBox.startY, selectionBox.currentY),
      right: Math.max(selectionBox.startX, selectionBox.currentX),
      bottom: Math.max(selectionBox.startY, selectionBox.currentY)
    };

    const iconRelativeRect = {
      left: iconRect.left - containerRect.left,
      top: iconRect.top - containerRect.top,
      right: iconRect.right - containerRect.left,
      bottom: iconRect.bottom - containerRect.top
    };

    return !(
      iconRelativeRect.left > selectionRect.right ||
      iconRelativeRect.right < selectionRect.left ||
      iconRelativeRect.top > selectionRect.bottom ||
      iconRelativeRect.bottom < selectionRect.top
    );
  }, [selectionBox, containerRef]);

  const updateSelection = useCallback((iconId: string, iconRect: DOMRect) => {
    if (!isSelecting || !selectionBox) return;

    const shouldBeSelected = isIntersecting(iconRect);
    const isCurrentlySelected = selectedIdsRef.current.has(iconId);

    if (shouldBeSelected !== isCurrentlySelected) {
      if (shouldBeSelected) {
        selectedIdsRef.current.add(iconId);
      } else {
        selectedIdsRef.current.delete(iconId);
      }
    }
  }, [isSelecting, selectionBox, isIntersecting]);

  const clearSelection = useCallback(() => {
    selectedIdsRef.current.clear();
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  return {
    isSelecting,
    selectionBox,
    handleSelectionStart,
    handleSelectionMove,
    handleSelectionEnd,
    updateSelection,
    clearSelection
  };
}