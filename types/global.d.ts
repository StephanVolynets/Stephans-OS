import type { LucideIcon } from 'lucide-react';

// Window and icon types
export interface AppIcon {
  id: string;
  title: string;
  icon: LucideIcon;
  x: number;
  y: number;
  color: string;
  type: 'app' | 'file' | 'folder';
  isSystemApp?: boolean;
}

export type WindowContent = 
  | { type: 'text-editor'; id: string }
  | { 
      type: 'file-explorer'; 
      icons?: AppIcon[]; 
      aboutMeContent?: React.ReactNode;
      folderId?: string;
    }
  | { type: 'about'; content: React.ReactNode }
  | { type: 'default'; content: React.ReactNode };

export interface Window {
  id: string;
  title: string;
  content: WindowContent;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  focused: boolean;
  minimized: boolean;
  zIndex: number;
  prevPosition?: WindowPosition;
}

export interface WindowPosition {
  x: number;
  y: number;
  width: number | string;
  height: number | string;
}

// Grid types
export interface GridPosition {
  x: number;
  y: number;
}

export interface GridItem {
  id: string;
  position: GridPosition;
}

export interface GridDimensions {
  cellWidth: number;
  cellHeight: number;
  gap: number;
  columns: number;
  rows: number;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Editor types
export interface EditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
}