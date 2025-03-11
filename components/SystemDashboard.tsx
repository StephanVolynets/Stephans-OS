"use client";

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, MemoryStick as Memory, HardDrive, Network, Activity, Thermometer, Fan, Battery, Clock, Wifi, Download, Upload, Gauge, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Simulated system data
const generateRandomData = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateChartData = (points: number) => {
  return Array.from({ length: points }, () => generateRandomData(0, 100));
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  secondaryValue?: string;
  chart?: number[];
}

const MetricCard = ({ title, value, icon, color, secondaryValue, chart }: MetricCardProps) => {
  return (
    <Card className="p-4 relative overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("p-2 rounded-lg", color)}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {secondaryValue && (
            <p className="text-xs text-muted-foreground">{secondaryValue}</p>
          )}
        </div>
      </div>
      {chart && (
        <div className="h-20 mt-2">
          <div className="flex h-full items-end gap-1">
            {chart.map((value, index) => (
              <motion.div
                key={index}
                className={cn("w-full bg-primary/20 rounded-sm", color.replace('bg-', 'bg-opacity-20'))}
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export function SystemDashboard() {
  const [cpuUsage, setCpuUsage] = useState(generateRandomData(20, 80));
  const [memoryUsage, setMemoryUsage] = useState(generateRandomData(40, 90));
  const [networkSpeed, setNetworkSpeed] = useState({
    download: generateRandomData(1, 100),
    upload: generateRandomData(1, 50)
  });
  const [temperature, setTemperature] = useState(generateRandomData(40, 75));
  const [fanSpeed, setFanSpeed] = useState(generateRandomData(1000, 2500));
  const [storageUsage, setStorageUsage] = useState(generateRandomData(50, 85));
  const [cpuHistory] = useState(generateChartData(12));
  const [memoryHistory] = useState(generateChartData(12));
  const [networkHistory] = useState(generateChartData(12));

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(generateRandomData(20, 80));
      setMemoryUsage(generateRandomData(40, 90));
      setNetworkSpeed({
        download: generateRandomData(1, 100),
        upload: generateRandomData(1, 50)
      });
      setTemperature(generateRandomData(40, 75));
      setFanSpeed(generateRandomData(1000, 2500));
      setStorageUsage(generateRandomData(50, 85));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full p-6">
      <Tabs defaultValue="overview" className="h-full">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Storage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="h-[calc(100%-40px)]">
          <ScrollArea className="h-full pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="CPU Usage"
                value={`${cpuUsage}%`}
                icon={<Cpu className="h-5 w-5" />}
                color="bg-blue-500/20"
                secondaryValue="Intel Core i9-12900K"
                chart={cpuHistory}
              />
              <MetricCard
                title="Memory Usage"
                value={`${memoryUsage}%`}
                icon={<Memory className="h-5 w-5" />}
                color="bg-purple-500/20"
                secondaryValue="32GB DDR5-6000"
                chart={memoryHistory}
              />
              <MetricCard
                title="Storage"
                value={`${storageUsage}%`}
                icon={<HardDrive className="h-5 w-5" />}
                color="bg-emerald-500/20"
                secondaryValue="2TB NVMe SSD"
              />
              <MetricCard
                title="Network"
                value={`${networkSpeed.download} MB/s`}
                icon={<Network className="h-5 w-5" />}
                color="bg-amber-500/20"
                secondaryValue={`↑ ${networkSpeed.upload} MB/s`}
                chart={networkHistory}
              />
              <MetricCard
                title="Temperature"
                value={`${temperature}°C`}
                icon={<Thermometer className="h-5 w-5" />}
                color="bg-red-500/20"
                secondaryValue="CPU Package"
              />
              <MetricCard
                title="Fan Speed"
                value={`${fanSpeed} RPM`}
                icon={<Fan className="h-5 w-5" />}
                color="bg-cyan-500/20"
                secondaryValue="CPU Fan"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">System Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Operating System</span>
                    <span>StephOS v1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Build</span>
                    <span>2025.1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">System Uptime</span>
                    <span>3 days, 12 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Update</span>
                    <span>2 hours ago</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Network Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span>Connected - 5GHz</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-blue-500" />
                    <span>Download: {networkSpeed.download} MB/s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-purple-500" />
                    <span>Upload: {networkSpeed.upload} MB/s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>Latency: 12ms</span>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="performance" className="h-[calc(100%-40px)]">
          <ScrollArea className="h-full pr-4">
            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">CPU Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Core 1</span>
                      <span>{generateRandomData(20, 80)}%</span>
                    </div>
                    <Progress value={generateRandomData(20, 80)} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Core 2</span>
                      <span>{generateRandomData(20, 80)}%</span>
                    </div>
                    <Progress value={generateRandomData(20, 80)} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Core 3</span>
                      <span>{generateRandomData(20, 80)}%</span>
                    </div>
                    <Progress value={generateRandomData(20, 80)} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Core 4</span>
                      <span>{generateRandomData(20, 80)}%</span>
                    </div>
                    <Progress value={generateRandomData(20, 80)} />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>In Use</span>
                    <span>{generateRandomData(8, 24)} GB</span>
                  </div>
                  <Progress value={memoryUsage} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Available</p>
                      <p className="text-lg font-semibold">{32 - generateRandomData(8, 24)} GB</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cached</p>
                      <p className="text-lg font-semibold">{generateRandomData(2, 8)} GB</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="storage" className="h-[calc(100%-40px)]">
          <ScrollArea className="h-full pr-4">
            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Storage Devices</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">System Drive (C:)</span>
                      <span className="text-muted-foreground">
                        {generateRandomData(400, 800)} GB free of 1 TB
                      </span>
                    </div>
                    <Progress value={generateRandomData(40, 80)} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Data Drive (D:)</span>
                      <span className="text-muted-foreground">
                        {generateRandomData(800, 1600)} GB free of 2 TB
                      </span>
                    </div>
                    <Progress value={generateRandomData(20, 60)} />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Disk Activity</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Read Speed</span>
                    <span>{generateRandomData(100, 500)} MB/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Write Speed</span>
                    <span>{generateRandomData(50, 300)} MB/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Time</span>
                    <span>{generateRandomData(10, 90)}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}