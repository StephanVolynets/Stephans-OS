"use client";

import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import type { Window, WindowPosition, WindowContent } from "@/types/global";

interface WindowsContextType {
  windows: Window[];
  openWindow: (window: Partial<Window>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  isWindowOpen: (id: string) => boolean;
}

const WindowsContext = createContext<WindowsContextType | null>(null);

export function WindowsProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<Window[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);

  const isWindowOpen = (id: string): boolean => {
    return windows.some((w) => w.id === id);
  };

  const openWindow = (window: Partial<Window>) => {
    const existingWindow = windows.find((w) => w.id === window.id);

    if (existingWindow) {
      if (existingWindow.minimized) {
        updateWindow(existingWindow.id, {
          minimized: false,
          ...(existingWindow.prevPosition || {}),
        });
      }
      focusWindow(existingWindow.id);
      toast.info(`${existingWindow.title} is already running`);
      return;
    }

    setWindows((prev) => [
      ...prev.map((w) => ({ ...w, focused: false })),
      {
        id: window.id || Math.random().toString(),
        title: window.title || "Window",
        content: window.content || { type: 'default', content: null },
        x: window.x || 100,
        y: window.y || 100,
        width: window.width || 600,
        height: window.height || 400,
        focused: true,
        minimized: false,
        zIndex: nextZIndex,
      } as Window,
    ]);
    setNextZIndex((prev) => prev + 1);
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => {
      const windowToClose = prev.find((w) => w.id === id);
      if (!windowToClose) return prev;

      const remainingWindows = prev.filter((w) => w.id !== id);

      if (windowToClose.focused && remainingWindows.length > 0) {
        const highestZIndexWindow = remainingWindows.reduce((highest, current) =>
          current.zIndex > highest.zIndex ? current : highest
        );
        return remainingWindows.map((w) => ({
          ...w,
          focused: w.id === highestZIndexWindow.id,
        }));
      }

      return remainingWindows;
    });
  };

  const focusWindow = (id: string) => {
    setWindows((prev) => {
      const windowToFocus = prev.find((w) => w.id === id);
      if (!windowToFocus) return prev;

      const newZIndex = nextZIndex;
      setNextZIndex((prev) => prev + 1);

      return prev.map((w) => ({
        ...w,
        focused: w.id === id,
        zIndex: w.id === id ? newZIndex : w.zIndex,
      }));
    });
  };

  const updateWindow = (id: string, updates: Partial<Window>) => {
    setWindows((prev) => {
      const windowToUpdate = prev.find((w) => w.id === id);
      if (!windowToUpdate) return prev;

      return prev.map((w) => {
        if (w.id !== id) return w;

        // Store the current position before minimizing
        if (updates.minimized && !w.minimized) {
          return {
            ...w,
            ...updates,
            prevPosition: {
              x: w.x,
              y: w.y,
              width: w.width,
              height: w.height,
            },
          };
        }

        // Restore the previous position when unminimizing
        if (!updates.minimized && w.minimized && w.prevPosition) {
          const { prevPosition, ...rest } = w;
          return {
            ...rest,
            ...updates,
            ...prevPosition,
          };
        }

        return { ...w, ...updates };
      });
    });
  };

  return (
    <WindowsContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        focusWindow,
        updateWindow,
        isWindowOpen,
      }}
    >
      {children}
    </WindowsContext.Provider>
  );
}

export const useWindows = () => {
  const context = useContext(WindowsContext);
  if (!context) {
    throw new Error("useWindows must be used within a WindowsProvider");
  }
  return context;
};