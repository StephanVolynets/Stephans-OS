"use client";

import { WindowControls } from "./WindowControls";

interface WindowTitleBarProps {
  title: string;
  isMaximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onPointerDown: (e: React.MouseEvent) => void;
}

export function WindowTitleBar({
  title,
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
  onPointerDown,
}: WindowTitleBarProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onPointerDown(e);
  };

  return (
    <div
      className="h-8 bg-muted flex items-center justify-between px-2 cursor-move select-none"
      onMouseDown={handleMouseDown}
    >
      <span className="text-sm font-medium px-2">{title}</span>
      <WindowControls
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
        isMaximized={isMaximized}
      />
    </div>
  );
}