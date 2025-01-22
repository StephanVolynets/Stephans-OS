import { useCallback, useRef } from 'react';

interface ClickInfo {
  x: number;
  y: number;
  time: number;
}

interface UseDoubleClickOptions {
  onSingleClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  maxDelay?: number;
  maxDistance?: number;
}

export function useDoubleClick({
  onSingleClick,
  onDoubleClick,
  maxDelay = 300,
  maxDistance = 5,
}: UseDoubleClickOptions = {}) {
  const lastClick = useRef<ClickInfo | null>(null);
  const singleClickTimer = useRef<NodeJS.Timeout>();

  const handleClick = useCallback((e: React.MouseEvent) => {
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

      if (timeDiff < maxDelay && distance < maxDistance) {
        // Clear any pending single click
        if (singleClickTimer.current) {
          clearTimeout(singleClickTimer.current);
          singleClickTimer.current = undefined;
        }
        
        // It's a double click
        onDoubleClick?.(e);
        lastClick.current = null;
        return;
      }
    }

    // Clear previous timer
    if (singleClickTimer.current) {
      clearTimeout(singleClickTimer.current);
    }

    // Set up new single click timer
    singleClickTimer.current = setTimeout(() => {
      onSingleClick?.(e);
      singleClickTimer.current = undefined;
    }, maxDelay);

    lastClick.current = currentClick;
  }, [maxDelay, maxDistance, onSingleClick, onDoubleClick]);

  return handleClick;
}