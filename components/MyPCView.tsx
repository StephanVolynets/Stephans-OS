"use client";

import React from 'react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { useWindows } from '@/contexts/WindowsContext';
import { ScrollArea } from './ui/scroll-area';
import { Monitor } from 'lucide-react';
import type { AppIcon } from '@/types/global';
import { TextEditor } from './TextEditor';

export const MyPCView: React.FC = () => {
  const { systemApps } = useFileSystem();
  const { openWindow } = useWindows();

  const handleOpenApp = (app: AppIcon) => {
    // Use the same window opening logic as in Desktop.tsx
    let content;
    let width = 600;
    let height = 400;

    switch (app.id) {
      case 'textEditor':
        content = {
          type: 'default' as const,
          content: <TextEditor initialContent="" />
        };
        width = 800;
        height = 600;
        break;
      // Add other cases for different app types
      default:
        content = {
          type: 'default' as const,
          content: <div>App not implemented</div>
        };
    }

    openWindow({
      id: app.id,
      title: app.title,
      content,
      width,
      height
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Monitor className="w-5 h-5 mr-2" />
        <h2 className="text-lg font-semibold">System Applications</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-4 gap-4">
          {systemApps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col items-center p-2 rounded-lg cursor-pointer hover:bg-accent/50"
              onDoubleClick={() => handleOpenApp(app)}
            >
              <app.icon className={`w-12 h-12 ${app.color}`} />
              <span className="mt-2 text-sm text-center">{app.title}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}; 