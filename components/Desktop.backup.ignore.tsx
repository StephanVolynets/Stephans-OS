// {/* Copy of the current Desktop.tsx content */}
// "use client";

// import { useWindows } from "@/contexts/WindowsContext";
// import Window from "@/components/Window";
// import { FileText, Terminal, Calculator, Image, Folder, Info, Monitor, Users, FileEdit } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useEffect, useState, useRef, useCallback } from "react";
// import { cn } from "@/lib/utils";
// import { ContextMenu } from "./desktop/ContextMenu";
// import { SelectionBox } from "./desktop/SelectionBox";
// import { DesktopGrid } from "./desktop/DesktopGrid";
// import { FileExplorer } from "./FileExplorer";
// import { AboutMeContent } from "./AboutMeContent";
// import { TextEditor } from "./TextEditor";

// interface AppIcon {
//   id: string;
//   title: string;
//   icon: any;
//   x: number;
//   y: number;
// }

// export default function Desktop() {
//   const { windows, openWindow, isWindowOpen, focusWindow } = useWindows();
//   const [icons, setIcons] = useState<AppIcon[]>([
//     { id: "notepad", title: "Notepad", icon: FileText, x: 0, y: 0 },
//     { id: "terminal", title: "Terminal", icon: Terminal, x: 1, y: 0 },
//     { id: "calculator", title: "Calculator", icon: Calculator, x: 2, y: 0 },
//     { id: "imageViewer", title: "Images", icon: Image, x: 3, y: 0 },
//     { id: "aboutMe", title: "About Me", icon: Info, x: 0, y: 1 },
//     { id: "myPC", title: "My PC", icon: Monitor, x: 1, y: 1 },
//     { id: "public", title: "Public", icon: Users, x: 2, y: 1 },
//     { id: "textEditor", title: "Text Editor", icon: FileEdit, x: 3, y: 1 },
//   ]);
//   const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'desktop' | 'icon'; iconId?: string } | null>(null);
//   const desktopRef = useRef<HTMLDivElement>(null);

//   const handleContextMenu = useCallback((e: React.MouseEvent, iconId?: string) => {
//     e.preventDefault();
//     e.stopPropagation();
//     const rect = desktopRef.current?.getBoundingClientRect();
//     if (!rect) return;

//     setContextMenu({
//       x: e.clientX - rect.left,
//       y: e.clientY - rect.top,
//       type: iconId ? 'icon' : 'desktop',
//       iconId
//     });
//   }, []);

//   const handleNewFolder = useCallback(() => {
//     const newId = `folder-${Date.now()}`;
//     setIcons(prev => [...prev, {
//       id: newId,
//       title: "New Folder",
//       icon: Folder,
//       x: 0,
//       y: prev.length
//     }]);
//     setContextMenu(null);
//   }, []);

//   const handleRenameIcon = useCallback((iconId: string) => {
//     // TODO: Implement rename functionality
//     console.log('Rename icon:', iconId);
//     setContextMenu(null);
//   }, []);

//   const handleDeleteIcon = useCallback((iconId: string) => {
//     setIcons(prev => prev.filter(icon => icon.id !== iconId));
//     setContextMenu(null);
//   }, []);

//   const handleDuplicateIcon = useCallback((iconId: string) => {
//     const iconToDuplicate = icons.find(icon => icon.id === iconId);
//     if (!iconToDuplicate) return;

//     const newIcon = {
//       ...iconToDuplicate,
//       id: `${iconToDuplicate.id}-${Date.now()}`,
//       title: `${iconToDuplicate.title} Copy`,
//       x: 0,
//       y: icons.length
//     };

//     setIcons(prev => [...prev, newIcon]);
//     setContextMenu(null);
//   }, [icons]);

//   const getRandomWindowPosition = useCallback((width: number, height: number) => {
//     const centerX = (window.innerWidth - width) / 2;
//     const centerY = (window.innerHeight - height - 48) / 2;
//     const maxOffset = Math.min(200, Math.min(centerX, centerY) / 2);
    
//     const offsetX = (Math.random() - 0.5) * maxOffset * 2;
//     const offsetY = (Math.random() - 0.5) * maxOffset * 2;

//     return {
//       x: Math.max(0, Math.min(window.innerWidth - width, centerX + offsetX)),
//       y: Math.max(0, Math.min(window.innerHeight - height - 48, centerY + offsetY))
//     };
//   }, []);

//   const handleIconOpen = useCallback((icon: AppIcon) => {
//     if (isWindowOpen(icon.id)) {
//       focusWindow(icon.id);
//       return;
//     }

//     const width = 600;
//     const height = 400;
//     const position = getRandomWindowPosition(width, height);

//     const aboutMeContent = <AboutMeContent />;
//     const content = icon.id === 'myPC' ? (
//       <FileExplorer icons={icons} aboutMeContent={aboutMeContent} />
//     ) : icon.id === 'aboutMe' ? (
//       aboutMeContent
//     ) : icon.id === 'public' ? (
//       <div className="prose dark:prose-invert">
//         <h2>Public Folder</h2>
//         <p>This is a shared space for all users. Content coming soon!</p>
//       </div>
//     ) : icon.id === 'textEditor' ? (
//       <TextEditor id={icon.id} />
//     ) : (
//       `Content for ${icon.title}`
//     );

//     openWindow({
//       id: icon.id,
//       title: icon.title,
//       content,
//       ...position,
//       width: icon.id === 'textEditor' ? 800 : width,
//       height: icon.id === 'textEditor' ? 600 : height,
//     });
//   }, [openWindow, isWindowOpen, focusWindow, icons, getRandomWindowPosition]);

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (contextMenu && !e.defaultPrevented) {
//         setContextMenu(null);
//       }
//     };

//     window.addEventListener('click', handleClickOutside);
//     return () => window.removeEventListener('click', handleClickOutside);
//   }, [contextMenu]);

//   return (
//     <div
//       ref={desktopRef}
//       className={cn(
//         "flex-1 relative overflow-hidden",
//         "contain-layout"
//       )}
//       onContextMenu={(e) => handleContextMenu(e)}
//     >
//       <DesktopGrid
//         icons={icons}
//         onIconsChange={setIcons}
//       >
//         {contextMenu && (
//           <ContextMenu
//             x={contextMenu.x}
//             y={contextMenu.y}
//             type={contextMenu.type}
//             onNewFolder={handleNewFolder}
//             onRename={contextMenu.iconId ? () => handleRenameIcon(contextMenu.iconId!) : undefined}
//             onDelete={contextMenu.iconId ? () => handleDeleteIcon(contextMenu.iconId!) : undefined}
//             onDuplicate={contextMenu.iconId ? () => handleDuplicateIcon(contextMenu.iconId!) : undefined}
//             onClose={() => setContextMenu(null)}
//           />
//         )}

//         {windows.map((window) => (
//           <Window key={window.id} {...window} />
//         ))}
//       </DesktopGrid>
//     </div>
//   );
// }
