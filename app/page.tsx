"use client";

import React from 'react';
import Desktop from "@/components/Desktop";
import Taskbar from "@/components/Taskbar";
import { WindowsProvider } from "@/contexts/WindowsContext";
import { FileSystemProvider } from "@/contexts/FileSystemContext";

const Page: React.FC = () => {
  return (
    <FileSystemProvider>
      <WindowsProvider>
        <div className="h-screen w-screen overflow-visible flex flex-col">
          <div className="animated-gradient" aria-hidden="true" />
          <Desktop />
          <Taskbar />
        </div>
      </WindowsProvider>
    </FileSystemProvider>
  );
};

export default Page;