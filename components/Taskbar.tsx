"use client";

import { useState } from "react";
import { useWindows } from "@/contexts/WindowsContext";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import StartMenu from "./StartMenu";
import { TaskbarClock } from "./TaskbarClock";
import { cn } from "@/lib/utils";

export default function Taskbar() {
  const { windows, focusWindow, updateWindow } = useWindows();
  const [showStartMenu, setShowStartMenu] = useState(false);

  const handleTaskbarClick = (windowId: string) => {
    const targetWindow = windows.find(w => w.id === windowId);
    if (!targetWindow) return;

    if (targetWindow.minimized) {
      // If window is minimized, restore it and focus it
      updateWindow(windowId, { minimized: false });
      focusWindow(windowId);
    } else if (targetWindow.focused) {
      // If window is focused, minimize it
      updateWindow(windowId, { minimized: true });
    } else {
      // If window is neither minimized nor focused, focus it
      focusWindow(windowId);
    }
  };

  return (
    <div className="h-12 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t flex items-center px-2 justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowStartMenu(!showStartMenu)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex space-x-1">
          {windows.map((window) => (
            <Button
              key={window.id}
              variant={window.focused ? "secondary" : "ghost"}
              className={cn(
                "h-8 transition-all",
                window.minimized && "opacity-50"
              )}
              onClick={() => handleTaskbarClick(window.id)}
            >
              {window.title}
            </Button>
          ))}
        </div>
      </div>

      <TaskbarClock />

      {showStartMenu && <StartMenu onClose={() => setShowStartMenu(false)} />}
    </div>
  );
}