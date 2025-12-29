import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function TimeSlotPicker({ onTimeSelect, selectedTime, duration = 60, selectedDate }) {
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        slots.push(time);
      }
    }
    return slots;
  }, []);

  const isTimeSelected = (time) => {
    return (
      selectedTime &&
      format(time, 'HH:mm') === format(selectedTime, 'HH:mm')
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-border">
      <h3 className="text-lg font-bold text-foreground font-heading mb-4">
        Select time {selectedDate && `for ${format(selectedDate, 'MMM d')}`}
      </h3>

      <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {timeSlots.map((slot) => (
          <Button
            key={format(slot, 'HH:mm')}
            variant={isTimeSelected(slot) ? 'default' : 'outline'}
            size="sm"
            className={`rounded-lg h-12 font-semibold transition-all ${
              isTimeSelected(slot)
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'border-border hover:bg-muted'
            }`}
            onClick={() => {
              const newDateTime = new Date(selectedDate);
              newDateTime.setHours(slot.getHours(), slot.getMinutes(), 0, 0);
              onTimeSelect(newDateTime);
            }}
          >
            {format(slot, 'HH:mm')}
          </Button>
        ))}
      </div>

      {selectedTime && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Selected:</span> {format(selectedTime, 'MMM d, yyyy')} at{' '}
            <span className="font-semibold">{format(selectedTime, 'HH:mm')}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Duration: {duration} minutes
          </p>
        </div>
      )}
    </div>
  );
}
