"use client";

import { Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  isMaximized: boolean;
}

export function WindowControls({ onMinimize, onMaximize, onClose, isMaximized }: WindowControlsProps) {
  const handleClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    callback();
  };

  return (
    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-none hover:bg-background/20 hover:text-foreground focus-visible:ring-0"
        onClick={(e) => handleClick(e, onMinimize)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Minimize2 className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-none hover:bg-background/20 hover:text-foreground focus-visible:ring-0"
        onClick={(e) => handleClick(e, onMaximize)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Maximize2 className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-none hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-0"
        onClick={(e) => handleClick(e, onClose)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}