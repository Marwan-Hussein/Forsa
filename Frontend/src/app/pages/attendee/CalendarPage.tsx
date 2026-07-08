import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
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
import { motion, AnimatePresence } from "motion/react";
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  color: string;
  time: string;
  location: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mock events
  const events: CalendarEvent[] = [
    { id: "1", title: "Tech Conference 2026", date: "2026-03-25", color: "bg-blue-500", time: "09:00 AM", location: "SF Center" },
    { id: "2", title: "Summer Music Festival", date: "2026-04-15", color: "bg-rose-500", time: "14:00 PM", location: "Central Park" },
    { id: "4", title: "Startup Networking", date: "2026-03-18", color: "bg-blue-500", time: "18:00 PM", location: "Austin Tech" },
    { id: "3", title: "Design Workshop", date: "2026-03-20", color: "bg-fuchsia-500", time: "10:00 AM", location: "Design Hub" },
    { id: "6", title: "Food & Wine Tasting", date: "2026-03-22", color: "bg-amber-500", time: "19:00 PM", location: "Grand Hotel" },
    { id: "8", title: "Jazz Night", date: "2026-03-27", color: "bg-violet-500", time: "20:00 PM", location: "Blue Note" },
    { id: "5", title: "Marathon Training", date: "2026-04-01", color: "bg-emerald-500", time: "06:00 AM", location: "City Park" },
    { id: "7", title: "Marketing Masterclass", date: "2026-04-10", color: "bg-amber-500", time: "13:00 PM", location: "Business Ctr" },
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
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 mb-4 text-slate-500 hover:text-blue-600 transition-colors font-['Inter:Medium',sans-serif] text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="font-['Inter:Bold',sans-serif] text-4xl text-slate-800 mb-3 tracking-tight flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-blue-500" />
              Your Calendar
            </h1>
            <p className="font-['Inter:Medium',sans-serif] text-slate-500 text-lg">
              Manage your schedule and never miss an event
            </p>
          </div>
          
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(new Date());
            }}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2"
          >
            Go to Today
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendar Grid Container */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8"
            >
              {/* Calendar Header Controls */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors text-slate-600 border border-slate-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors text-slate-600 border border-slate-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center font-['Inter:Bold',sans-serif] text-xs text-slate-400 uppercase tracking-wider"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[90px] p-2 rounded-2xl border transition-all relative flex flex-col ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10"
                          : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50"
                      } ${!isCurrentMonth ? "opacity-30" : ""}`}
                    >
                      <span
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-['Inter:Bold',sans-serif] mb-2 ${
                          isToday
                            ? "bg-blue-600 text-white shadow-sm"
                            : isSelected ? "text-blue-700" : "text-slate-700"
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      
                      <div className="flex-1 w-full flex flex-col gap-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`w-full h-1.5 rounded-full ${event.color} opacity-80`}
                            title={event.title}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] font-['Inter:Bold',sans-serif] text-slate-400 mt-1 pl-1">
                            +{dayEvents.length - 3}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 items-center px-4">
              <span className="font-['Inter:Bold',sans-serif] text-sm text-slate-500 mr-2">Legend:</span>
              {[
                { name: "Technology", color: "bg-blue-500" },
                { name: "Music & Arts", color: "bg-violet-500" },
                { name: "Business", color: "bg-amber-500" },
                { name: "Health", color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="font-['Inter:Medium',sans-serif] text-xs text-slate-600">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Selected Date Details */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sticky top-24 flex flex-col h-[calc(100vh-8rem)] min-h-[500px]"
            >
              <div className="pb-6 mb-6 border-b border-slate-100">
                <h3 className="font-['Inter:Bold',sans-serif] text-xl text-slate-800 mb-1">
                  {selectedDate ? format(selectedDate, "EEEE") : "Select a day"}
                </h3>
                <p className="font-['Inter:Medium',sans-serif] text-slate-500">
                  {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "to view scheduled events"}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                <AnimatePresence mode="wait">
                  {selectedDate ? (
                    selectedDateEvents.length > 0 ? (
                      <motion.div 
                        key={selectedDate.toISOString()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {selectedDateEvents.map((event, i) => (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={event.id}
                            className="group block p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all relative overflow-hidden"
                          >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${event.color} opacity-80 group-hover:opacity-100`} />
                            <Link to={`/events/${event.id}`}>
                              <h4 className="font-['Inter:Bold',sans-serif] text-slate-800 text-base mb-3 group-hover:text-blue-600 transition-colors">
                                {event.title}
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-['Inter:Medium',sans-serif] text-slate-500">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  {event.time}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-['Inter:Medium',sans-serif] text-slate-500">
                                  <MapPin className="w-4 h-4 text-slate-400" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center text-center py-10"
                      >
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <CalendarIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-['Inter:Bold',sans-serif] text-slate-700 mb-1">Schedule Clear</p>
                        <p className="font-['Inter:Medium',sans-serif] text-sm text-slate-500">No events on this day</p>
                      </motion.div>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-50">
                      <CalendarIcon className="w-16 h-16 text-slate-300 mb-4" />
                      <p className="font-['Inter:Medium',sans-serif] text-sm text-slate-500">Pick a date from the calendar</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-6 mt-auto border-t border-slate-100">
                <Link
                  to="/events"
                  className="w-full bg-slate-50 text-blue-600 py-3.5 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-slate-100 hover:text-blue-700 transition-colors text-center flex items-center justify-center gap-2"
                >
                  {/* Discover More Events <ArrowRight className="w-4 h-4" /> */}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
