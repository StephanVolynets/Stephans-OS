import { CPUWidget } from './CPUWidget';
import { FPSWidget } from './FPSWidget';
import { BatteryWidget } from './BatteryWidget';

export function WidgetsContainer() {
  return (
    <div className="flex items-center h-full">
      <CPUWidget />
      <FPSWidget />
      <BatteryWidget />
    </div>
  );
} 