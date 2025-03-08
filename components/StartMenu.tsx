"use client";

import { useWindows } from "@/contexts/WindowsContext";
import { Button } from "@/components/ui/button";
import { 
  Terminal, 
  Calculator, 
  FileEdit,
  Monitor,
  Info,
  Cloud,
  Layout,
  FileQuestion,
  Settings,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Calculator as CalculatorApp } from "@/components/Calculator";
import { WeatherApp } from "@/components/WeatherApp";
import { MemoryGame } from "@/components/MemoryGame";
import { ReadmeContent } from "@/components/ReadmeContent";
import { AboutMeContent } from "@/components/AboutMeContent";
import {Calendar } from "@/components/Calender";
import type { WindowContent } from "@/types/global";

interface StartMenuProps {
  onClose: () => void;
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

    setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
    }, 0);

    return () => window.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  const apps = [,
    { 
      id: "weather", 
      title: "Weather", 
      icon: Cloud,
      color: "text-sky-400",
      content: {
        type: 'default' as const,
        content: <WeatherApp />
      },
      width: 400,
      height: 500
    },
    { 
      id: "terminal", 
      title: "Terminal", 
      icon: Terminal,
      color: "text-green-400",
      content: {
        type: 'default' as const,
        content: (
          <div className="font-mono p-4 bg-black text-green-400">
            <p>Terminal not implemented yet.</p>
            <p className="animate-pulse">▋</p>
          </div>
        )
      },
      width: 600,
      height: 400
    },
    { 
      id: "aboutMe", 
      title: "About Me", 
      icon: Info,
      color: "text-cyan-400",
      content: {
        type: 'about' as const,
        content: <AboutMeContent />
      },
      width: 600,
      height: 400
    },
    { 
      id: "calculator", 
      title: "Calculator", 
      icon: Calculator,
      color: "text-yellow-400",
      content: {
        type: 'default' as const,
        content: <CalculatorApp />
      },
      width: 300,
      height: 450
    },
    { 
      id: "textEditor", 
      title: "Text Editor", 
      icon: FileEdit,
      color: "text-orange-400",
      content: {
        type: 'text-editor' as const,
        id: 'textEditor'
      },
      width: 800,
      height: 600
    },
    { 
      id: "memory", 
      title: "Memory Game", 
      icon: Layout,
      color: "text-purple-400",
      content: {
        type: 'default' as const,
        content: <MemoryGame />
      },
      width: 450,
      height: 600
    },
    { 
      id: "readme", 
      title: "README", 
      icon: FileQuestion,
      color: "text-blue-400",
      content: {
        type: 'default' as const,
        content: <ReadmeContent />
      },
      width: 600,
      height: 400
    },
    { 
      id: "settings", 
      title: "Settings", 
      icon: Settings,
      color: "text-neutral-400",
      content: {
        type: 'default' as const,
        content: (
          <div className="p-4 prose dark:prose-invert">
            <h2>Settings</h2>
            <p>System settings will be implemented soon.</p>
          </div>
        )
      },
      width: 600,
      height: 400
    },
  ];

  const handleAppClick = (app: typeof apps[0]) => {
    const centerX = (window.innerWidth - app.width) / 2;
    const centerY = (window.innerHeight - app.height) / 2;
    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = (Math.random() - 0.5) * 200;

    openWindow({
      id: app.id,
      title: app.title,
      content: app.content,
      x: Math.max(50, Math.min(centerX + offsetX, window.innerWidth - app.width - 50)),
      y: Math.max(50, Math.min(centerY + offsetY, window.innerHeight - app.height - 50)),
      width: app.width,
      height: app.height,
    });
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute bottom-12 left-0 w-80 bg-card/95 backdrop-blur rounded-lg shadow-lg border border-border overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 grid grid-cols-1 gap-1">
        {apps.map((app) => (
          <Button
            key={app.id}
            variant="ghost"
            className="w-full justify-start h-10 px-2 gap-3"
            onClick={() => handleAppClick(app)}
          >
            <app.icon className={`h-5 w-5 ${app.color}`} />
            <span className="font-medium">{app.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}