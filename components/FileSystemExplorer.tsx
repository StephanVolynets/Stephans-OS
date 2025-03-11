"use client";

import React, { useEffect, useState, useCallback } from "react";
import { File, Folder, FilePlus, FolderPlus, Trash2, ArrowLeft, RefreshCw, X, HardDrive } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fileSystem, FileSystemItem } from "@/lib/fileSystem";
import { useWindows } from "@/contexts/WindowsContext";
import { TextEditor } from "@/components/TextEditor";
import { MyPCView } from "@/components/MyPCView";

interface FileSystemExplorerProps {
  folderId?: string;
  title?: string;
  initialPath?: string[];
}

export const FileSystemExplorer: React.FC<FileSystemExplorerProps> = ({ 
  folderId, 
  title = 'File Explorer', 
  initialPath = [] 
}) => {
  const { openWindow, focusWindow, isWindowOpen } = useWindows();
  const [currentPath, setCurrentPath] = useState<string[]>(initialPath);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<'mypc' | 'fileExplorer'>('fileExplorer');

  // Initialize file system and load directory contents
  const loadDirectory = useCallback(async (path: string[] = currentPath) => {
    setIsLoading(true);
    try {
      if (!isInitialized) {
        const initialized = await fileSystem.init();
        if (!initialized) {
          toast.error("Failed to initialize file system");
          setIsLoading(false);
          return;
        }
        setIsInitialized(true);
      }
      
      const entries = await fileSystem.listDirectory(path);
      setItems(entries);
    } catch (error) {
      console.error("Error loading directory:", error);
      toast.error("Failed to load directory contents");
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, isInitialized]);

  // Load initial directory
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for browser support
      if (!fileSystem.isSupported()) {
        toast.error("Your browser doesn't support the File System API");
        setIsLoading(false);
        return;
      }
      
      loadDirectory();
    }
  }, [loadDirectory]);

  // Navigate to parent directory
  const navigateUp = () => {
    if (currentPath.length === 0) return;
    
    const newPath = [...currentPath];
    newPath.pop();
    setCurrentPath(newPath);
    loadDirectory(newPath);
  };

  // Navigate into a directory
  const navigateInto = (item: FileSystemItem) => {
    if (item.kind !== "directory") return;
    
    const newPath = [...item.path];
    setCurrentPath(newPath);
    loadDirectory(newPath);
  };

  // Open a file
  const openFile = async (item: FileSystemItem) => {
    if (item.kind !== "file") return;
    
    setIsLoading(true);
    try {
      const fileData = await fileSystem.readFile(
        item.path.slice(0, -1), 
        item.path[item.path.length - 1]
      );
      
      if (!fileData) {
        toast.error("Failed to read file");
        return;
      }
      
      const fileName = item.path[item.path.length - 1];
      const fileId = `file-${item.path.join("-")}`;
      const filePath = item.path.slice(0, -1);
      
      if (isWindowOpen(fileId)) {
        focusWindow(fileId);
        return;
      }

      // Convert ArrayBuffer to string if needed
      const content = typeof fileData.content === 'string' 
        ? fileData.content 
        : new TextDecoder().decode(fileData.content as ArrayBuffer);

      openWindow({
        id: fileId,
        title: fileName,
        content: {
          type: 'default',
          content: <TextEditor 
            fileId={fileId} 
            initialContent={content}
            path={filePath}
            fileName={fileName}
          />
        },
        width: 700,
        height: 500,
      });
    } catch (error) {
      console.error("Error opening file:", error);
      toast.error("Failed to open file");
    } finally {
      setIsLoading(false);
    }
  };

  // Create new folder
  const createFolder = async () => {
    if (!newItemName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await fileSystem.createDirectory(currentPath, newItemName.trim());
      if (success) {
        toast.success(`Folder "${newItemName}" created`);
        setNewItemName("");
        setIsCreateFolderOpen(false);
        loadDirectory();
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    } finally {
      setIsLoading(false);
    }
  };

  // Create new file
  const createFile = async () => {
    if (!newItemName.trim()) {
      toast.error("Please enter a file name");
      return;
    }
    
    // Add .txt extension if not specified
    let fileName = newItemName.trim();
    if (!fileName.includes('.')) {
      fileName += '.txt';
    }
    
    setIsLoading(true);
    try {
      // Create empty text file
      const success = await fileSystem.createFile(currentPath, fileName, "");
      if (success) {
        toast.success(`File "${fileName}" created`);
        setNewItemName("");
        setIsCreateFileOpen(false);
        
        // Refresh directory listing
        loadDirectory();
        
        // Optionally, immediately open the file for editing
        const fileId = `file-${[...currentPath, fileName].join("-")}`;
        openWindow({
          id: fileId,
          title: fileName,
          content: {
            type: 'default',
            content: <TextEditor fileId={fileId} path={currentPath} fileName={fileName} />
          },
          width: 700,
          height: 500,
        });
      }
    } catch (error) {
      console.error("Error creating file:", error);
      toast.error("Failed to create file");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete item
  const deleteItem = async () => {
    if (!selectedItem) return;
    
    setIsLoading(true);
    try {
      const itemPath = selectedItem.path;
      const name = itemPath[itemPath.length - 1];
      const parentPath = itemPath.slice(0, -1);
      
      const success = await fileSystem.delete(parentPath, name);
      if (success) {
        toast.success(`${selectedItem.kind === "directory" ? "Folder" : "File"} deleted`);
        setSelectedItem(null);
        loadDirectory();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setIsLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Create breadcrumb path
  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center space-x-1 text-sm mb-2 overflow-x-auto pb-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={() => {
            setCurrentPath([]);
            loadDirectory([]);
          }}
        >
          <HardDrive className="h-4 w-4" />
        </Button>
        <span className="text-muted-foreground">/</span>
        {currentPath.map((segment, index) => (
          <React.Fragment key={index}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1"
              onClick={() => {
                const newPath = currentPath.slice(0, index + 1);
                setCurrentPath(newPath);
                loadDirectory(newPath);
              }}
            >
              {segment}
            </Button>
            {index < currentPath.length - 1 && (
              <span className="text-muted-foreground">/</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const handleNavigate = useCallback((item: FileSystemItem) => {
    if (item.name === 'My PC') {
      // Show My PC view
      setCurrentView('mypc');
    } else if (item.kind === 'directory') {
      // Navigate into directory
      navigateInto(item);
    } else {
      // Open file
      openFile(item);
    }
  }, [navigateInto, openFile]);

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={currentPath.length === 0} 
            onClick={navigateUp}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => loadDirectory()}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setNewItemName("");
              setIsCreateFileOpen(true);
            }}
          >
            <FilePlus className="h-4 w-4 mr-2" />
            New File
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setNewItemName("");
              setIsCreateFolderOpen(true);
            }}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!selectedItem} 
            onClick={deleteItem}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      {renderBreadcrumbs()}
      
      <ScrollArea className="flex-1 border rounded-md">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : currentView === 'mypc' ? (
          <MyPCView />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Folder className="h-16 w-16 mb-2" />
            <p>This folder is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2">
            {items.map((item) => (
              <div
                key={item.path.join("/")}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                  selectedItem?.path.join("/") === item.path.join("/") && "bg-accent"
                )}
                onClick={() => setSelectedItem(item)}
                onDoubleClick={() => handleNavigate(item)}
              >
                {item.kind === "directory" ? (
                  <Folder className="h-10 w-10 text-blue-500" />
                ) : (
                  <File className="h-10 w-10 text-gray-500" />
                )}
                <span className="text-xs text-center mt-1 w-full truncate">
                  {item.name}
                </span>
                {item.kind === "file" && item.size !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(item.size)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") createFolder();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create File Dialog */}
      <Dialog open={isCreateFileOpen} onOpenChange={setIsCreateFileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="File name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") createFile();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 