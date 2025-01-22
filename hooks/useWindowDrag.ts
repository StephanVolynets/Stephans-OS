import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { debounce } from '@/lib/utils';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number | string;
  height: number | string;
}

interface WindowState extends Position, Size {
  isMaximized: boolean;
}

interface UseWindowDragOptions {
  id: string;
  initialState: WindowState;
  minSize: Size;
  taskbarHeight: number;
  onStateChange?: (state: WindowState) => void;
}

const SNAP_THRESHOLD = 20;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

export function useWindowDrag({
  id,
  initialState,
  minSize,
  taskbarHeight,
  onStateChange,
}: UseWindowDragOptions) {
  const [state, setState] = useState<WindowState>(initialState);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");

  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
    lastFrameTime: number;
  }>();
  const stateRef = useRef(state);
  const prevStateRef = useRef<WindowState | null>(null);
  const animationFrameRef = useRef<number>();

  // Update stateRef when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const windowDimensions = useMemo(() => ({
    width: window.innerWidth,
    height: window.innerHeight - taskbarHeight,
  }), [taskbarHeight]);

  const enforceWindowBounds = useCallback((position: Position, size: Size): Position => {
    const width = typeof size.width === 'string' ? parseInt(size.width) : size.width;
    const height = typeof size.height === 'string' ? parseInt(size.height) : size.height;

    return {
      x: Math.max(0, Math.min(position.x, windowDimensions.width - width)),
      y: Math.max(0, Math.min(position.y, windowDimensions.height - height)),
    };
  }, [windowDimensions]);

  const commitState = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      setState((prev) => ({ ...prev }));
      onStateChange?.(stateRef.current);
      animationFrameRef.current = undefined;
    });
  }, [onStateChange]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (stateRef.current.isMaximized) return;
    e.preventDefault();
    console.log("Drag start");

    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: stateRef.current.x,
      initialY: stateRef.current.y,
      initialWidth: rect.width,
      initialHeight: rect.height,
      lastFrameTime: performance.now(),
    };

    setIsDragging(true);

    const handleDragMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const now = performance.now();
      if (now - dragRef.current.lastFrameTime < FRAME_TIME) return;

      dragRef.current.lastFrameTime = now;

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      const newPosition = enforceWindowBounds({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy,
      }, {
        width: dragRef.current.initialWidth,
        height: dragRef.current.initialHeight,
      });

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        setState((prev) => ({ ...prev, ...newPosition }));
      });
    };

    const handleDragEnd = () => {
      console.log("Drag end");
      try {
        commitState();
      } finally {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        setIsDragging(false);
        dragRef.current = undefined;
      }
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  }, [enforceWindowBounds, commitState]);

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    if (state.isMaximized) return;
    e.preventDefault();
    console.log("Resize start:", { direction });

    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: state.x,
      initialY: state.y,
      initialWidth: rect.width,
      initialHeight: rect.height,
      lastFrameTime: performance.now(),
    };

    setResizeDirection(direction);
    setIsResizing(true);

    const handleResizeMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const now = performance.now();
      if (now - dragRef.current.lastFrameTime < FRAME_TIME) return;

      dragRef.current.lastFrameTime = now;

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      console.log("Resize move:", { dx, dy, direction });

      let newState = { ...stateRef.current };

      if (direction.includes('e')) {
        newState.width = Math.max(minSize.width as number, dragRef.current.initialWidth + dx);
      }
      if (direction.includes('s')) {
        newState.height = Math.max(minSize.height as number, dragRef.current.initialHeight + dy);
      }
      if (direction.includes('w')) {
        const newWidth = Math.max(minSize.width as number, dragRef.current.initialWidth - dx);
        newState.x = dragRef.current.initialX + (dragRef.current.initialWidth - newWidth);
        newState.width = newWidth;
      }
      if (direction.includes('n')) {
        const newHeight = Math.max(minSize.height as number, dragRef.current.initialHeight - dy);
        newState.y = dragRef.current.initialY + (dragRef.current.initialHeight - newHeight);
        newState.height = newHeight;
      }

      const boundedPosition = enforceWindowBounds(
        { x: newState.x, y: newState.y },
        { width: newState.width, height: newState.height }
      );

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        setState((prev) => ({ ...prev, ...boundedPosition, width: newState.width, height: newState.height }));
      });
    };

    const handleResizeEnd = () => {
      console.log("Resize end");
      try {
        commitState();
      } finally {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
        setIsResizing(false);
        setResizeDirection("");
        dragRef.current = undefined;
      }
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  }, [state.isMaximized, state.x, state.y, minSize, enforceWindowBounds, commitState]);

  const toggleMaximize = useCallback(() => {
    setState((prev) => {
      if (prev.isMaximized) {
        return prevStateRef.current || prev;
      } else {
        prevStateRef.current = { ...prev };
        return {
          x: 0,
          y: 0,
          width: '100%',
          height: `calc(100vh - ${taskbarHeight}px)`,
          isMaximized: true,
        };
      }
    });
  }, [taskbarHeight]);

  // Reset state on unmount
  useEffect(() => {
    return () => {
      if (dragRef.current) {
        dragRef.current = undefined;
      }
      if (prevStateRef.current) {
        prevStateRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    state,
    isDragging,
    isResizing,
    windowRef,
    handleDragStart,
    handleResizeStart,
    toggleMaximize,
  };
}