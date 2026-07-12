import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DateTimePicker({ date, setDate, disabled = false }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date && !isNaN(date.getTime()) ? date : undefined
  );
  const [timeValue, setTimeValue] = React.useState<string>(
    date && !isNaN(date.getTime()) ? format(date, "HH:mm") : "12:00"
  );

  React.useEffect(() => {
    if (date && !isNaN(date.getTime())) {
      setSelectedDate(date);
      setTimeValue(format(date, "HH:mm"));
    } else {
      setSelectedDate(undefined);
    }
  }, [date]);

  const handleDateSelect = (d: Date | undefined) => {
    if (!d) return;
    const parts = (timeValue || "12:00").split(":");
    const hours = Number(parts[0]) || 0;
    const minutes = Number(parts[1]) || 0;
    const newDate = new Date(d);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setSelectedDate(newDate);
    setDate(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setTimeValue(time);
    
    if (!time) return; // Skip updating the Date state if the time input is cleared/invalid
    
    const parts = time.split(":");
    if (parts.length < 2) return;
    
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    if (isNaN(hours) || isNaN(minutes)) return;
    
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      const newDate = new Date(selectedDate);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      setSelectedDate(newDate);
      setDate(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all flex items-center justify-between",
            (!selectedDate || isNaN(selectedDate.getTime())) && "text-slate-400",
            disabled && "opacity-60 cursor-not-allowed select-none bg-slate-100"
          )}
        >
          {selectedDate && !isNaN(selectedDate.getTime()) ? format(selectedDate, "PPP 'at' p") : <span>Pick a date & time</span>}
          <CalendarIcon className="w-4 h-4 text-indigo-500 opacity-80" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white rounded-2xl shadow-xl border-slate-200 overflow-hidden">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }}
          initialFocus
          className="p-3"
        />
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-['Inter:Medium',sans-serif] text-slate-700 flex-1">Time</span>
          <input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-['Inter:Medium',sans-serif] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
