import { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FPSWidget() {
  const [fps, setFps] = useState(0);
  const [maxFps, setMaxFps] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const updateFps = () => {
      const now = performance.now();
      frameCount++;

      // Update FPS every 500ms for smoother display
      if (now >= lastTime + 500) {
        const currentFps = Math.round(frameCount * 1000 / (now - lastTime));
        frameCount = 0;
        lastTime = now;
        
        setFps(currentFps);
        
        // Update max FPS if we have a new record
        if (currentFps > maxFps) {
          setMaxFps(currentFps);
        }
      }

      animationFrameId = requestAnimationFrame(updateFps);
    };

    animationFrameId = requestAnimationFrame(updateFps);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [maxFps]);

  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  // Determine color based on FPS
  const getFpsColor = () => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex flex-col items-center justify-center px-3 h-12 bg-black/20 hover:bg-black/30 transition-colors text-white"
      >
        <div className="flex items-center">
          <span className={cn("font-mono text-sm font-bold", getFpsColor())}>{fps}</span>
          <span className="font-mono text-sm text-white ml-1">/{maxFps}</span>
        </div>
        <span className="font-mono text-[10px] text-gray-400">FPS</span>
      </button>

      {showDetails && (
        <div className="absolute bottom-[calc(100%+0.5rem)] right-0 z-50 w-64 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-2">FPS Monitor</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current FPS:</span>
              <span className={cn("font-mono text-sm", getFpsColor())}>{fps}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Maximum FPS:</span>
              <span className="font-mono text-sm">{maxFps}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Performance:</span>
              <span className="font-mono text-sm">
                {fps >= 50 ? 'Excellent' : fps >= 30 ? 'Good' : 'Poor'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 