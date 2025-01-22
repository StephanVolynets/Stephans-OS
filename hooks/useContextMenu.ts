"use client";

import { useState, useCallback, useEffect } from 'react';

interface MenuPosition {
  x: number;
  y: number;
}

interface UseContextMenuOptions {
  containerRef: React.RefObject<HTMLElement>;
}

export function useContextMenu({ containerRef }: UseContextMenuOptions) {
  const [menuProps, setMenuProps] = useState<{
    isOpen: boolean;
    position: MenuPosition;
    type: 'desktop' | 'file' | 'folder';
    targetId?: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    type: 'desktop'
  });

  const handleContextMenu = useCallback((
    e: React.MouseEvent,
    type: 'desktop' | 'file' | 'folder' = 'desktop',
    targetId?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('Context Menu Event:', { type, targetId, x, y });

    setMenuProps({
      isOpen: true,
      position: { x, y },
      type,
      targetId
    });
  }, [containerRef]);

  const closeMenu = useCallback(() => {
    console.log('Closing context menu');
    setMenuProps(prev => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', closeMenu);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', closeMenu);
    };
  }, [containerRef, closeMenu]);

  return {
    menuProps,
    handleContextMenu,
    closeMenu
  };
}