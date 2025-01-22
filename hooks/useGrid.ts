"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  calculateGridDimensions,
  calculateGridPosition,
  findNearestEmptyPosition,
  getOccupiedPositions,
  type GridPosition,
  type GridItem,
  type GridDimensions
} from '@/lib/grid';

interface UseGridOptions {
  containerRef: React.RefObject<HTMLElement>;
  initialItems: GridItem[];
  selectedItems?: Set<string>;
  onItemsChange?: (items: GridItem[]) => void;
}

export function useGrid({ 
  containerRef, 
  initialItems, 
  selectedItems = new Set(),
  onItemsChange 
}: UseGridOptions) {
  const [items, setItems] = useState<GridItem[]>(initialItems);
  const [draggedItems, setDraggedItems] = useState<Set<string>>(new Set());
  const [gridDimensions, setGridDimensions] = useState<GridDimensions | null>(null);
  const dragImageRef = useRef<HTMLDivElement | null>(null);
  const dragStartPositionsRef = useRef<Map<string, GridPosition>>(new Map());
  const dragOffsetRef = useRef<GridPosition>({ x: 0, y: 0 });

  const updateGridDimensions = useCallback(() => {
    if (!containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    setGridDimensions(calculateGridDimensions(width, height));
  }, []);

  useEffect(() => {
    updateGridDimensions();
    
    const resizeObserver = new ResizeObserver(updateGridDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [updateGridDimensions]);

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    e.stopPropagation();
    
    // Determine which items to drag (either the selection or just this item)
    const itemsToDrag = selectedItems.has(itemId) ? selectedItems : new Set([itemId]);
    setDraggedItems(new Set(itemsToDrag));

    // Store initial positions of all dragged items
    const dragStartPositions = new Map<string, GridPosition>();
    items.forEach(item => {
      if (itemsToDrag.has(item.id)) {
        dragStartPositions.set(item.id, { ...item.position });
      }
    });
    dragStartPositionsRef.current = dragStartPositions;

    // Calculate drag offset from the clicked item
    const clickedItem = items.find(item => item.id === itemId);
    if (clickedItem) {
      dragOffsetRef.current = {
        x: clickedItem.position.x,
        y: clickedItem.position.y
      };
    }

    // Set custom drag image
    if (dragImageRef.current) {
      const dragImage = dragImageRef.current.cloneNode(true) as HTMLElement;
      if (itemsToDrag.size > 1) {
        dragImage.setAttribute('data-count', String(itemsToDrag.size));
      }
      dragImage.style.opacity = '0';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  }, [items, selectedItems]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    if (!gridDimensions || !containerRef.current || draggedItems.size === 0) return;

    const position = calculateGridPosition(
      e.clientX,
      e.clientY,
      gridDimensions,
      containerRef.current.getBoundingClientRect()
    );

    // Calculate the movement delta from the drag offset
    const deltaX = position.x - dragOffsetRef.current.x;
    const deltaY = position.y - dragOffsetRef.current.y;

    requestAnimationFrame(() => {
      setItems(prevItems => {
        const newItems = prevItems.map(item => {
          if (!draggedItems.has(item.id)) return item;

          const startPos = dragStartPositionsRef.current.get(item.id);
          if (!startPos) return item;

          return {
            ...item,
            position: {
              x: startPos.x + deltaX,
              y: startPos.y + deltaY
            }
          };
        });

        return newItems;
      });
    });
  }, [gridDimensions, draggedItems]);

  const handleDragEnd = useCallback(() => {
    // Snap all dragged items to grid
    setItems(prevItems => {
      const occupiedPositions = getOccupiedPositions(
        prevItems.filter(item => !draggedItems.has(item.id))
      );

      const newItems = prevItems.map(item => {
        if (!draggedItems.has(item.id)) return item;

        const nearestPosition = findNearestEmptyPosition(
          item.position,
          occupiedPositions,
          gridDimensions!
        );

        occupiedPositions.add(`${nearestPosition.x},${nearestPosition.y}`);
        return { ...item, position: nearestPosition };
      });

      onItemsChange?.(newItems);
      return newItems;
    });

    setDraggedItems(new Set());
    dragStartPositionsRef.current = new Map();
    dragOffsetRef.current = { x: 0, y: 0 };
  }, [gridDimensions, onItemsChange]);

  return {
    items,
    draggedItems,
    gridDimensions,
    dragImageRef,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  };
}