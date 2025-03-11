"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fileSystem, FileSystemItem } from "@/lib/fileSystem";
import { HardDrive, AlertTriangle, FileText, Folder, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileSystemControlsProps {
  onFileSelect?: (fileData: { content: string; name: string; path: string[] }) => void;
  showTabs?: boolean;
  className?: string;
}

export function FileSystemControls({
  onFileSelect,
  showTabs = true,
  className,
}: FileSystemControlsProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("browse");

  // Initialize file system
  const initializeFileSystem = async () => {
    setIsLoading(true);
    try {
      if (!fileSystem.isSupported()) {
        toast.error("Your browser doesn't support the File System API");
        return;
      }
      
      const initialized = await fileSystem.init();
      if (initialized) {
        setIsInitialized(true);
        await loadDirectory();
        toast.success("File system initialized");
      } else {
        toast.error("Failed to initialize file system");
      }
    } catch (error) {
      console.error("Error initializing file system:", error);
      toast.error("Failed to initialize file system");
    } finally {
      setIsLoading(false);
    }
  };

  // Load directory contents
  const loadDirectory = async (path: string[] = currentPath) => {
    setIsLoading(true);
    try {
      const entries = await fileSystem.listDirectory(path);
      setItems(entries);
      setCurrentPath(path);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error loading directory:", error);
      toast.error("Failed to load directory");
    } finally {
      setIsLoading(false);
    }
  };

  // Open a file
  const openFile = async (item: FileSystemItem) => {
    if (item.kind !== "file") return;
    
    setIsLoading(true);
    try {
      const fileData = await fileSystem.readFile(
        item.path.slice(0, -1),
        item.path[item.path.length - 1],
        true
      );
      
      if (!fileData) {
        toast.error("Failed to read file");
        return;
      }
      
      const content = fileData.content as string;
      setFileContent(content);
      setFileName(item.name);
      setSelectedItem(item);
      
      if (onFileSelect) {
        onFileSelect({
          content,
          name: item.name,
          path: item.path.slice(0, -1)
        });
      }
      
      if (showTabs) {
        setActiveTab("edit");
      }
      
      toast.success(`Opened ${item.name}`);
    } catch (error) {
      console.error("Error opening file:", error);
      toast.error("Failed to open file");
    } finally {
      setIsLoading(false);
    }
  };

  // Save a file
  const saveFile = async () => {
    if (!fileName) {
      toast.error("Please enter a file name");
      return;
    }
    
    setIsLoading(true);
    try {
      if (selectedItem && selectedItem.kind === "file") {
        // Update existing file
        const success = await fileSystem.writeFile(
          selectedItem.path.slice(0, -1),
          selectedItem.name,
          fileContent
        );
        
        if (success) {
          toast.success(`Updated ${selectedItem.name}`);
          await loadDirectory();
        }
      } else {
        // Create new file
        const fileNameWithExt = fileName.includes(".") ? fileName : `${fileName}.txt`;
        const success = await fileSystem.writeFile(
          currentPath,
          fileNameWithExt,
          fileContent
        );
        
        if (success) {
          toast.success(`Created ${fileNameWithExt}`);
          setFileName("");
          setFileContent("");
          await loadDirectory();
          setActiveTab("browse");
        }
      }
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error("Failed to save file");
    } finally {
      setIsLoading(false);
    }
  };

  // Create new folder
  const createFolder = async () => {
    if (!fileName) {
      toast.error("Please enter a folder name");
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await fileSystem.createDirectory(currentPath, fileName);
      
      if (success) {
        toast.success(`Created folder ${fileName}`);
        setFileName("");
        await loadDirectory();
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to parent directory
  const navigateUp = () => {
    if (currentPath.length === 0) return;
    
    const newPath = [...currentPath];
    newPath.pop();
    loadDirectory(newPath);
  };

  // Navigate into a directory
  const navigateInto = (item: FileSystemItem) => {
    if (item.kind !== "directory") return;
    loadDirectory(item.path);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (!isInitialized) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
        <HardDrive className="h-16 w-16 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">Origin Private File System</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          This feature allows you to store files directly in your browser. 
          Files are private to this website and not accessible outside this application.
        </p>
        
        {!fileSystem.isSupported() ? (
          <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-md text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">Your browser doesn't support the File System API.</p>
          </div>
        ) : (
          <Button 
            onClick={initializeFileSystem} 
            disabled={isLoading}
            className="mt-2"
          >
            {isLoading ? "Initializing..." : "Initialize File System"}
          </Button>
        )}
      </div>
    );
  }

  if (!showTabs) {
    // Simple file browser mode
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button
              variant="outline" 
              size="icon"
              disabled={currentPath.length === 0}
              onClick={navigateUp}
              className="mr-2"
            >
              <HardDrive className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              /{currentPath.join("/")}
            </div>
          </div>
        </div>
        
        <div className="flex-1 border rounded-md overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
              <Folder className="h-12 w-12 mb-2" />
              <p>This folder is empty</p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div 
                  key={item.path.join("/")}
                  className={cn(
                    "flex items-center px-3 py-2 hover:bg-accent/50 cursor-pointer",
                    selectedItem?.path.join("/") === item.path.join("/") && "bg-accent"
                  )}
                  onClick={() => setSelectedItem(item)}
                  onDoubleClick={() => {
                    if (item.kind === "directory") {
                      navigateInto(item);
                    } else {
                      openFile(item);
                    }
                  }}
                >
                  {item.kind === "directory" ? (
                    <Folder className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                  )}
                  <div className="flex-1 truncate">
                    {item.name}
                  </div>
                  {item.kind === "file" && item.size !== undefined && (
                    <div className="text-xs text-muted-foreground ml-2">
                      {formatFileSize(item.size)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="browse">Browse Files</TabsTrigger>
          <TabsTrigger value="edit">Edit File</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="flex-1 flex flex-col space-y-4 data-[state=inactive]:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="outline" 
                size="icon"
                disabled={currentPath.length === 0}
                onClick={navigateUp}
                className="mr-2"
              >
                <HardDrive className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                /{currentPath.join("/")}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="New folder/file name"
                className="w-48"
              />
              <Button 
                variant="outline" 
                onClick={createFolder}
                disabled={!fileName.trim() || isLoading}
                size="sm"
              >
                <Folder className="h-4 w-4 mr-1" />
                Create Folder
              </Button>
              <Button 
                onClick={() => {
                  setFileContent("");
                  setSelectedItem(null);
                  setActiveTab("edit");
                }}
                disabled={!fileName.trim() || isLoading}
                size="sm"
              >
                <FileText className="h-4 w-4 mr-1" />
                New File
              </Button>
            </div>
          </div>
          
          <div className="flex-1 border rounded-md overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
                <Folder className="h-12 w-12 mb-2" />
                <p>This folder is empty</p>
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <div 
                    key={item.path.join("/")}
                    className={cn(
                      "flex items-center px-3 py-2 hover:bg-accent/50 cursor-pointer",
                      selectedItem?.path.join("/") === item.path.join("/") && "bg-accent"
                    )}
                    onClick={() => setSelectedItem(item)}
                    onDoubleClick={() => {
                      if (item.kind === "directory") {
                        navigateInto(item);
                      } else {
                        openFile(item);
                      }
                    }}
                  >
                    {item.kind === "directory" ? (
                      <Folder className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                    )}
                    <div className="flex-1 truncate">
                      {item.name}
                    </div>
                    {item.kind === "file" && item.size !== undefined && (
                      <div className="text-xs text-muted-foreground ml-2">
                        {formatFileSize(item.size)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="edit" className="flex-1 flex flex-col space-y-4 data-[state=inactive]:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Label htmlFor="filename" className="sr-only">Filename</Label>
              <Input
                id="filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="filename.txt"
                className="max-w-xs"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("browse")}
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={saveFile}
                disabled={!fileName.trim() || isLoading}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
          
          <div className="flex-1 border rounded-md overflow-hidden">
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Enter file content here..."
              className="w-full h-full p-3 outline-none resize-none font-mono text-sm focus:ring-0 border-0"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 