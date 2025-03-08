"use client";

import { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSnow, CloudSun, Sun, Wind, Search, Loader2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import useSWR from 'swr';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
}

const API_KEY = '8d2de98e089f1c28e1a22fc19a24ef04';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.message = await res.json().then(data => data.message || 'Failed to fetch weather data');
    throw error;
  }
  return res.json();
};

const WeatherIcon = ({ condition }: { condition: string }) => {
  switch (condition.toLowerCase()) {
    case 'clear':
      return <Sun className="h-12 w-12 text-yellow-400" />;
    case 'clouds':
      return <Cloud className="h-12 w-12 text-gray-400" />;
    case 'rain':
    case 'drizzle':
      return <CloudRain className="h-12 w-12 text-blue-400" />;
    case 'snow':
      return <CloudSnow className="h-12 w-12 text-blue-200" />;
    case 'thunderstorm':
      return <CloudRain className="h-12 w-12 text-purple-400" />;
    default:
      return <CloudSun className="h-12 w-12 text-orange-400" />;
  }
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export function WeatherApp() {
  const [city, setCity] = useState('London');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const { data: weather, error, isLoading, mutate } = useSWR<WeatherData>(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    // Get user's location on component mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );
            const data = await response.json();
            if (data.name) {
              setCity(data.name);
              setSearchQuery(data.name);
              mutate();
            }
          } catch (error) {
            toast.error("Could not get weather for your location");
          } finally {
            setIsLoadingLocation(false);
          }
        },
        () => {
          toast.error("Could not get your location. Showing default city.");
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
    }
  }, [mutate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Add to search history
    setSearchHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(item => item !== searchQuery)].slice(0, 5);
      return newHistory;
    });
    
    setCity(searchQuery);
    mutate();
  };

  const handleHistoryClick = (historyItem: string) => {
    setSearchQuery(historyItem);
    setCity(historyItem);
    mutate();
  };

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Could not find that city. Please try again.');
    }
  }, [error]);

  if (isLoadingLocation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Enter city name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {searchHistory.length > 0 && (
        <ScrollArea className="w-full" style={{ maxHeight: '80px' }}>
          <div className="flex gap-2 flex-wrap">
            {searchHistory.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleHistoryClick(item)}
              >
                <History className="h-3 w-3" />
                {item}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : weather ? (
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {weather.name}, {weather.sys.country}
              </h2>
              <p className="text-muted-foreground capitalize">
                {weather.weather[0].description}
              </p>
            </div>
            <WeatherIcon condition={weather.weather[0].main} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="text-2xl font-bold">{Math.round(weather.main.temp)}°C</p>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>L: {Math.round(weather.main.temp_min)}°</span>
                <span>H: {Math.round(weather.main.temp_max)}°</span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Wind</p>
              <div className="flex items-center gap-2">
                <Wind 
                  className="h-5 w-5" 
                  style={{ 
                    transform: `rotate(${weather.wind.deg}deg)` 
                  }} 
                />
                <p className="text-2xl font-bold">{Math.round(weather.wind.speed)} m/s</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Direction: {weather.wind.deg}°
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Humidity & Pressure</p>
              <p className="text-2xl font-bold">{weather.main.humidity}%</p>
              <p className="text-sm text-muted-foreground mt-2">
                {weather.main.pressure} hPa
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Sun Times</p>
              <div className="space-y-1 mt-2">
                <p className="text-sm">
                  🌅 Rise: {formatTime(weather.sys.sunrise)}
                </p>
                <p className="text-sm">
                  🌇 Set: {formatTime(weather.sys.sunset)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <CloudRain className="h-16 w-16 text-muted-foreground" />
          <div>
            <p className="text-lg font-medium">Weather data unavailable</p>
            <p className="text-sm text-muted-foreground">
              {error.message || 'Please try searching for a different city'}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}