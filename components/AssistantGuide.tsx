"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tips = [
  "Hi! I'm Steph, your friendly assistant! 👋",
  "This project is currently a work in progress, but feel free to explore! 🚧",
  "Double click icons to open applications!",
  "Right click on the desktop for more options",
  "Try dragging icons to rearrange them",
  "Click the start menu to explore more apps",
  "You can resize windows by dragging their edges",
];

export function AssistantGuide() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentTip, setCurrentTip] = useState(0);
  const [showTip, setShowTip] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const centerAssistant = () => {
      setPosition({
        x: (window.innerWidth / 2) - 100,
        y: (window.innerHeight / 2) - 50
      });
    };

    centerAssistant();
    window.addEventListener('resize', centerAssistant);

    return () => window.removeEventListener('resize', centerAssistant);
  }, []);

  useEffect(() => {
    if (isDismissed) return;

    // Random movement within a confined area around the center
    const moveInterval = setInterval(() => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const radius = 100; // Maximum distance from center
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      
      setPosition({
        x: centerX + Math.cos(angle) * distance - 100,
        y: centerY + Math.sin(angle) * distance - 50
      });
    }, 3000);

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
      setShowTip(true);
    }, 5000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(tipInterval);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  return (
    <motion.div
      className="fixed z-[90] select-none pointer-events-none"
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 50,
        duration: 2,
      }}
    >
      <div className="relative flex flex-col items-center gap-2">
        <AnimatePresence>
          {showTip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="relative bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border pointer-events-auto"
              style={{ 
                maxWidth: "250px",
                minWidth: "250px",
                transform: "translateX(50px)"
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background/80"
                onClick={() => setIsDismissed(true)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 mt-1 shrink-0" />
                <p className="text-sm font-medium">{tips[currentTip]}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            y: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            },
            rotate: {
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
            }
          }}
          className="relative"
        >
          <Bot className="w-8 h-8 text-primary pointer-events-auto" />
        </motion.div>
      </div>
    </motion.div>
  );
}
