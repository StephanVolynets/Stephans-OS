"use client";

import { useWindows } from "@/contexts/WindowsContext";
import { Button } from "@/components/ui/button";
import { FileText, Terminal, Calculator, Image, Settings } from "lucide-react";
import { useEffect, useRef } from "react";
import { WindowContent } from "@/types/global";


// Define the props interface
interface StartMenuProps {
  onClose: () => void; // Specify the type for onClose
}

export default function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow } = useWindows();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Small delay to prevent immediate closure
    setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
    }, 0);

    return () => window.removeEventListener('click', handleClickOutside);
  }, [onClose]);


  
  const handleAppClick = (app: { id: string; title: string; icon: React.ElementType }) => {
    openWindow({
      id: app.id,
      title: app.title,
      content: `Content for ${app.title}` as unknown as WindowContent,
      x: 100,
      y: 100,
      width: 600,
      height: 400,
    });
    onClose();
  };

  const apps = [
    { id: "notepad", title: "Notepad", icon: FileText },
    { id: "terminal", title: "Terminal", icon: Terminal },
    { id: "calculator", title: "Calculator", icon: Calculator },
    { id: "imageViewer", title: "Images", icon: Image },
    { id: "settings", title: "Settings", icon: Settings },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute bottom-12 left-0 w-64 bg-card/95 backdrop-blur rounded-lg shadow-lg p-4 border border-border z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-2">
        {apps.map((app) => (
          <Button
            key={app.id}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleAppClick(app)}
          >
            <app.icon className="h-5 w-5 mr-2" />
            {app.title}
          </Button>
        ))}
      </div>
    </div>
  );
}