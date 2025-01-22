"use client";

import { useState, useEffect } from "react";

export function ClientTime() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  return <div className="text-sm">{time}</div>;
}