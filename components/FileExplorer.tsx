"use client";

import React from "react";
import { useWindows } from "@/contexts/WindowsContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AppIcon } from "@/types/global";
import { Calculator } from "@/components/Calculator";
import { TextEditor } from "@/components/TextEditor";
import { AboutMeContent } from "@/components/AboutMeContent";

interface FileExplorerProps {
  icons: AppIcon[];
  aboutMeContent: React.ReactElement;
}

export function FileExplorer({ icons, aboutMeContent }: FileExplorerProps) {
  const { openWindow, isWindowOpen, focusWindow } = useWindows();

  const handleIconClick = (icon: AppIcon) => {
    if (isWindowOpen(icon.id)) {
      focusWindow(icon.id);
      return;
    }

    const width = icon.id === 'textEditor' ? 800 : 600;
    const height = icon.id === 'textEditor' ? 600 : 400;
    const centerX = (window.innerWidth - width) / 2;
    const centerY = (window.innerHeight - height) / 2;
    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = (Math.random() - 0.5) * 200;

    let content;
    switch (icon.id) {
      case 'aboutMe':
        content = {
          type: 'about' as const,
          content: aboutMeContent
        };
        break;
      case 'calculator':
        content = {
          type: 'default' as const,
          content: <Calculator />
        };
        break;
      case 'textEditor':
        content = {
          type: 'text-editor' as const,
          id: icon.id
        };
        break;
      case 'terminal':
        content = {
          type: 'default' as const,
          content: (
            <div className="font-mono p-4 bg-black text-green-400">
              <p>Terminal not implemented yet.</p>
              <p className="animate-pulse">▋</p>
            </div>
          )
        };
        break;
      case 'imageViewer':
        content = {
          type: 'default' as const,
          content: (
            <div className="p-4">
              <p>Image Viewer not implemented yet.</p>
            </div>
          )
        };
        break;
      case 'public':
        content = {
          type: 'default' as const,
          content: (
            <div className="prose dark:prose-invert p-4">
              <h2>Public Folder</h2>
              <p>This is a shared space for all users. Content coming soon!</p>
            </div>
          )
        };
        break;
      default:
        if (icon.type === 'file') {
          content = {
            type: 'text-editor' as const,
            id: icon.id
          };
        } else {
          content = {
            type: 'default' as const,
            content: `Content for ${icon.title}`
          };
        }
    }

    openWindow({
      id: icon.id,
      title: icon.title,
      content,
      x: Math.max(50, Math.min(centerX + offsetX, window.innerWidth - width - 50)),
      y: Math.max(50, Math.min(centerY + offsetY, window.innerHeight - height - 50)),
      width: icon.id === 'calculator' ? 300 : width,
      height: icon.id === 'calculator' ? 450 : height,
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-2 gap-4 p-4">
        {icons.map((icon) => {
          const Icon = icon.icon;
          return (
            <Button
              key={icon.id}
              variant="ghost"
              className="h-24 flex flex-col items-center justify-center space-y-2 highlight-hover"
              onDoubleClick={() => handleIconClick(icon)}
            >
              <Icon className={cn("h-8 w-8", icon.color)} />
              <span className="text-xs font-medium truncate max-w-full">
                {icon.title}
              </span>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
}