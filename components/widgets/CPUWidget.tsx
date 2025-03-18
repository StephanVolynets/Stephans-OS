import { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CPUWidget() {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [recordHighFps, setRecordHighFps] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate CPU usage based on FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let maxFps = 0;
    let animationFrameId: number;

    const updateFps = () => {
      const now = performance.now();
      frameCount++;

      // Update FPS every second
      if (now >= lastTime + 1000) {
        const fps = Math.round(frameCount * 1000 / (now - lastTime));
        frameCount = 0;
        lastTime = now;

        // Update max FPS if new record
        if (fps > maxFps) {
          maxFps = fps;
          setRecordHighFps(fps);
        }

        // If we have a record high FPS, estimate CPU usage as inverse proportion
        if (maxFps > 0) {
          // Estimate CPU usage - higher FPS usually means lower CPU usage
          // This is a simplified model, not actual CPU measurement
          const estimatedUsage = Math.min(100, Math.max(5, Math.round(100 - (fps / maxFps * 95))));
          setCpuUsage(estimatedUsage);
        }
      }

      animationFrameId = requestAnimationFrame(updateFps);
    };

    animationFrameId = requestAnimationFrame(updateFps);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex items-center px-3 h-12 text-white bg-black/20 hover:bg-black/30 transition-colors"
      >
        <Cpu className="h-4 w-4 mr-2" />
        <span className="font-mono text-xs">{cpuUsage}% CPU</span>
      </button>

      {showDetails && (
        <div className="absolute bottom-[calc(100%+0.5rem)] right-0 z-50 w-64 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-2">CPU Widget</h3>
          <p className="text-sm mb-4">The CPU load is estimated by comparing the current FPS to the record high FPS for the session.</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Usage:</span>
              <span className="font-mono text-sm">{cpuUsage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Record High FPS:</span>
              <span className="font-mono text-sm">{recordHighFps} FPS</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">There are no settings for this widget yet.</p>
        </div>
      )}
    </div>
  );
} 