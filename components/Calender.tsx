"use client";

import { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: string;
  date: Date;
  title: string;
}

export function Calendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');

  const addEvent = () => {
    if (!newEventTitle.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    const newEvent: Event = {
      id: Math.random().toString(36).substr(2, 9),
      date: date,
      title: newEventTitle.trim()
    };

    setEvents(prev => [...prev, newEvent]);
    setNewEventTitle('');
    toast.success('Event added successfully');
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    toast.success('Event removed');
  };

  const eventsForSelectedDate = events.filter(
    event => event.date.toDateString() === date.toDateString()
  );

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            className="rounded-md border"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add event..."
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEvent()}
            />
            <Button onClick={addEvent} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1">
            <h3 className="font-medium mb-2">
              Events for {date.toLocaleDateString()}
            </h3>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {eventsForSelectedDate.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events for this date
                </p>
              ) : (
                <div className="space-y-2">
                  {eventsForSelectedDate.map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm">{event.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeEvent(event.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}