import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  color: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mock events
  const events: CalendarEvent[] = [
    { id: "1", title: "Tech Conference 2026", date: "2026-03-25", color: "#155dfc" },
    { id: "2", title: "Summer Music Festival", date: "2026-04-15", color: "#9810fa" },
    { id: "4", title: "Startup Networking", date: "2026-03-18", color: "#155dfc" },
    { id: "3", title: "Design Workshop", date: "2026-03-20", color: "#ec4899" },
    { id: "6", title: "Food & Wine Tasting", date: "2026-03-22", color: "#f97316" },
    { id: "8", title: "Jazz Night", date: "2026-03-27", color: "#9810fa" },
    { id: "5", title: "Marathon Training", date: "2026-04-01", color: "#16a34a" },
    { id: "7", title: "Marketing Masterclass", date: "2026-04-10", color: "#eab308" },
  ];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-[#eff6ff] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-4 text-[#526d82] hover:text-[#27374d] transition-colors font-['Inter:Regular',sans-serif] text-[14px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-8 h-8 text-[#EC9B3B]" />
            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-[#27374d]">
              Event Calendar
            </h1>
          </div>
          <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#526d82]">
            View all your events in a calendar format
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-[#27374d]">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="w-10 h-10 flex items-center justify-center bg-[#eff6ff] rounded-[8px] hover:bg-[#dde6ed] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#27374d]" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 h-10 bg-[#eff6ff] rounded-[8px] hover:bg-[#dde6ed] transition-colors font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d]"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="w-10 h-10 flex items-center justify-center bg-[#eff6ff] rounded-[8px] hover:bg-[#dde6ed] transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[#27374d]" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="h-10 flex items-center justify-center font-['Inter:Semi_Bold',sans-serif] font-semibold text-[12px] text-[#526d82]"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[80px] p-2 rounded-[8px] border-[0.8px] transition-all ${
                        isSelected
                          ? "border-[#27374d] bg-[#27374d]/5 hover:bg-[#27374d]/10"
                          : "border-[rgba(82,109,130,0.1)] hover:border-[#27374d]/30 hover:bg-[#eff6ff]/50"
                      } ${!isCurrentMonth ? "opacity-40" : ""}`}
                    >
                      <div className="flex flex-col items-start h-full">
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-['Inter:Medium',sans-serif] font-medium mb-1 ${
                            isToday
                              ? "bg-[#27374d] text-white"
                              : "text-[#27374d]"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                        <div className="w-full space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="w-full h-1.5 rounded-full"
                              style={{ backgroundColor: event.color }}
                              title={event.title}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] font-['Inter:Medium',sans-serif] text-[#526d82]">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-[rgba(82,109,130,0.2)]">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#155dfc]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
                      Business
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#9810fa]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
                      Music
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ec4899]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
                      Art
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#16a34a]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
                      Sports
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f97316]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
                      Food
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#eab308]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
                      Education
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Date Events */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-6 sticky top-6">
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] text-[#27374d] mb-4">
                {selectedDate
                  ? format(selectedDate, "MMMM d, yyyy")
                  : "Select a date"}
              </h3>

              {selectedDate ? (
                selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <Link
                        key={event.id}
                        to={`/events/${event.id}`}
                        className="block p-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] hover:border-[#27374d] hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                            style={{ backgroundColor: event.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] truncate">
                              {event.title}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82] text-center py-8">
                    No events on this day
                  </p>
                )
              ) : (
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82] text-center py-8">
                  Click on a date to view events
                </p>
              )}

              <div className="mt-6 pt-6 border-t border-[rgba(82,109,130,0.2)]">
                <Link
                  to="/my-events"
                  className="block w-full bg-[#27374d] text-[#dde6ed] py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936] transition-colors text-center"
                >
                  View All My Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}