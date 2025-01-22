"use client";

import { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import "react-calendar/dist/Calendar.css";

export function TaskbarClock() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(format(now, "h:mm a"));
      setDate(format(now, "EEE, MMM d"));
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setShowCalendar((prev) => !prev)}
        className="flex flex-col items-end px-2 py-1 rounded hover:bg-white/5 transition-colors duration-200 select-none"
      >
        <span className="text-sm font-medium">{time}</span>
        <span className="text-xs text-muted-foreground">{date}</span>
      </button>

      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-[calc(100%+0.5rem)] right-0 z-50"
          >
            <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 min-w-[300px]">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">
                  {format(selectedDate, "MMMM d, yyyy")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, "EEEE")}
                </p>
              </div>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="react-calendar--dark"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
