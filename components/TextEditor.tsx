"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWindowSize } from "@/hooks/useWindowSize";
import { Save, FileSymlink } from "lucide-react";
import { toast } from "sonner";
import { fileSystem } from "@/lib/fileSystem";

interface TextEditorProps {
  fileId?: string;
  initialContent?: string;
  path?: string[];
  fileName?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({ 
  fileId, 
  initialContent = "", 
  path = [],
  fileName = "New File.txt"
}) => {
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [filePath, setFilePath] = useState<string[]>(path);
  const [currentFileName, setCurrentFileName] = useState(fileName);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { height } = useWindowSize();
  
  // Load file content if fileId is provided
  useEffect(() => {
    const loadFile = async () => {
      if (!fileId) {
        setIsLoading(false);
        return;
      }
      
      // If fileId looks like a path (e.g. "file-documents-notes.txt")
      if (fileId.startsWith("file-")) {
        const pathSegments = fileId.slice(5).split("-");
        if (pathSegments.length > 0) {
          const name = pathSegments.pop() || "";
          setCurrentFileName(name);
          setFilePath(pathSegments);
          
          try {
            const fileData = await fileSystem.readFile(pathSegments, name, true);
            if (fileData) {
              setContent(fileData.content as string);
            }
          } catch (error) {
            console.error("Error loading file:", error);
            toast.error("Failed to load file");
          }
        }
      }
      
      setIsLoading(false);
    };
    
    loadFile();
  }, [fileId]);
  
  // Handle content change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  };
  
  // Save file
  const saveFile = async () => {
    setIsLoading(true);
    
    try {
      const success = await fileSystem.writeFile(filePath, currentFileName, content);
      
      if (success) {
        toast.success("File saved successfully");
        setIsDirty(false);
      } else {
        toast.error("Failed to save file");
      }
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error("Failed to save file");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <FileSymlink className="h-4 w-4" />
          <span className="text-sm font-medium">
            {currentFileName}
            {isDirty && "*"}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={saveFile}
          disabled={isLoading || !isDirty}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <textarea
          ref={textareaRef}
          className="w-full h-full min-h-[300px] p-4 resize-none focus:outline-none font-mono text-sm bg-transparent"
          style={{ height: height ? `${height - 100}px` : '100%' }}
          value={content}
          onChange={handleChange}
          placeholder="Start typing..."
          disabled={isLoading}
        />
      </ScrollArea>
    </div>
  );
};