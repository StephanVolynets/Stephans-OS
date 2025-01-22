"use client";

import { useWindows } from "@/contexts/WindowsContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
  icons: Array<{
    id: string;
    title: string;
    icon: any;
    color: string;
  }>;
  aboutMeContent?: React.ReactNode;
}

export function FileExplorer({ icons, aboutMeContent }: FileExplorerProps) {
  const { openWindow, isWindowOpen, focusWindow } = useWindows();

  const handleIconClick = (icon: any) => {
    if (isWindowOpen(icon.id)) {
      focusWindow(icon.id);
    } else {
      const width = 600;
      const height = 400;
      const centerX = (window.innerWidth - width) / 2;
      const centerY = (window.innerHeight - height) / 2;
      const offsetX = (Math.random() - 0.5) * 200;
      const offsetY = (Math.random() - 0.5) * 200;

      openWindow({
        id: icon.id,
        title: icon.title,
        content: icon.id === 'aboutMe' ? aboutMeContent : `Content for ${icon.title}`,
        x: Math.max(50, Math.min(centerX + offsetX, window.innerWidth - width - 50)),
        y: Math.max(50, Math.min(centerY + offsetY, window.innerHeight - height - 50)),
        width,
        height,
      });
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-auto-fit-100 gap-4 p-4">
        {icons.map((icon) => {
          const Icon = icon.icon;
          return (
            <Button
              key={icon.id}
              variant="ghost"
              className="h-24 w-24 flex flex-col items-center justify-center space-y-2 highlight-hover"
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