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
import { useFileSystem } from "@/contexts/FileSystemContext";

interface FileExplorerProps {
  folderId?: string;
  title?: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ folderId, title }) => {
  const { getItemsInFolder } = useFileSystem();
  
  // Show either root items or folder items based on folderId
  const items = getItemsInFolder(folderId || null);
  
  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">{title || 'File Explorer'}</h2>
      {/* Render items */}
    </div>
  );
};