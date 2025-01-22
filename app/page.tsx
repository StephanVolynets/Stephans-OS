"use client";

import Desktop from "@/components/Desktop";
import Taskbar from "@/components/Taskbar";
import { WindowsProvider } from "@/contexts/WindowsContext";
import { ThemeProvider } from "next-themes";

export default function Home() {
  return (
    <ThemeProvider attribute="class">
      <WindowsProvider>
        <div className="h-screen w-screen overflow-visible flex flex-col">
          <div className="animated-gradient" aria-hidden="true" />
          <Desktop />
          <Taskbar />
        </div>
      </WindowsProvider>
    </ThemeProvider>
  );
}