import { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryWarning } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BatteryWidget() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if Battery API is supported
    if ('getBattery' in navigator) {
      const getBatteryInfo = async () => {
        try {
          // Using the Battery Status API
          const battery = await (navigator as any).getBattery();
          
          // Update initial battery status
          setBatteryLevel(battery.level * 100);
          setIsCharging(battery.charging);
          
          // Add event listeners for battery status changes
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(battery.level * 100);
          });
          
          battery.addEventListener('chargingchange', () => {
            setIsCharging(battery.charging);
          });
        } catch (error) {
          console.error('Battery API error:', error);
          setBatteryLevel(null);
        }
      };
      
      getBatteryInfo();
    } else {
      console.log('Battery Status API not supported');
      setBatteryLevel(null);
    }
  }, []);

  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  // Get battery level display
  const getBatteryDisplay = () => {
    if (batteryLevel === null) return "N/A";
    return `${Math.round(batteryLevel)}%`;
  };

  // Get battery display styles
  const getBatteryColor = () => {
    if (batteryLevel === null) return 'text-gray-400';
    if (isCharging) return 'text-green-400';
    if (batteryLevel <= 20) return 'text-red-400';
    if (batteryLevel <= 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex items-center justify-center px-3 h-12 bg-black/20 hover:bg-black/30 transition-colors"
      >
        <div className="h-5 w-11 border border-white flex items-center px-0.5">
          <div 
            className={cn(
              "h-3 transition-all",
              isCharging ? "bg-green-500" : batteryLevel && batteryLevel <= 20 ? "bg-red-500" : "bg-white"
            )}
            style={{ width: batteryLevel ? `${batteryLevel}%` : "0%" }}
          />
        </div>
      </button>

      {showDetails && (
        <div className="absolute bottom-[calc(100%+0.5rem)] right-0 z-50 w-64 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Battery Status</h3>
          {batteryLevel !== null ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Battery Level:</span>
                <span className={cn("font-mono text-sm", getBatteryColor())}>
                  {Math.round(batteryLevel)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="font-mono text-sm">
                  {isCharging ? 'Charging' : 'Discharging'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className={cn(
                    "h-2.5 rounded-full", 
                    isCharging ? 'bg-green-400' : 
                    batteryLevel <= 20 ? 'bg-red-400' : 
                    batteryLevel <= 50 ? 'bg-yellow-400' : 
                    'bg-green-400'
                  )}
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Battery information is not available. Your device may not support the Battery Status API, 
              or you may need to enable it in your browser settings.
            </p>
          )}
        </div>
      )}
    </div>
  );
} 