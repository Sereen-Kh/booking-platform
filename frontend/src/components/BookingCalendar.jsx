import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfDay } from 'date-fns';

export default function BookingCalendar({ onDateSelect, minDate, maxDate, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfWeek = startOfMonth(currentMonth).getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return;

    if (minDate && isBefore(date, minDate)) return;
    if (maxDate && isBefore(maxDate, date)) return;

    onDateSelect(date);
  };

  const isDateDisabled = (date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return true;
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isBefore(maxDate, date)) return true;
    return false;
  };

  const isDateSelected = (date) => {
    return selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground font-heading">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="p-2 h-10 w-10 rounded-lg hover:bg-muted"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="p-2 h-10 w-10 rounded-lg hover:bg-muted"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {daysInMonth.map(date => {
          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);
          const isCurrentDay = isToday(date);

          return (
            <button
              key={format(date, 'yyyy-MM-dd')}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={`aspect-square rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center ${
                disabled
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-40'
                  : selected
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : isCurrentDay
                  ? 'bg-primary/10 text-primary border-2 border-primary'
                  : 'bg-muted/30 text-foreground hover:bg-primary/5 hover:border border-border'
              }`}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
