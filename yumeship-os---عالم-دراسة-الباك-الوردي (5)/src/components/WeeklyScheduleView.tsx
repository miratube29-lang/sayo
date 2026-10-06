import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2,
  Calendar
} from 'lucide-react';
import { ScheduleItem } from '../types';
import { sound } from '../utils/audio';

interface WeeklyScheduleViewProps {
  schedule: ScheduleItem[];
  onUpdateSchedule: (updated: ScheduleItem[]) => void;
}

export const DAYS_AR = [
  { index: 0, name: 'الأحد', nameEn: 'Sunday' },
  { index: 1, name: 'الإثنين', nameEn: 'Monday' },
  { index: 2, name: 'الثلاثاء', nameEn: 'Tuesday' },
  { index: 3, name: 'الأربعاء', nameEn: 'Wednesday' },
  { index: 4, name: 'الخميس', nameEn: 'Thursday' },
  { index: 5, name: 'الجمعة', nameEn: 'Friday' },
  { index: 6, name: 'السبت', nameEn: 'Saturday' },
];

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  schedule,
  onUpdateSchedule,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDayForAdd, setSelectedDayForAdd] = useState(0);

  // New item form state
  const [newTime, setNewTime] = useState('17:00 - 19:00');
  const [newSubject, setNewSubject] = useState('الرياضيات');
  const [newTask, setNewTask] = useState('');

  // Toggle completed
  const handleToggleTask = (itemId: string) => {
    sound.playClick();
    const updated = schedule.map((item) => {
      if (item.id !== itemId) return item;
      const next = !item.isCompleted;
      if (next) sound.playSuccess();
      return { ...item, isCompleted: next };
    });
    onUpdateSchedule(updated);
  };

  // Add task
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    sound.playClick();

    const newItem: ScheduleItem = {
      id: 'sch_' + Date.now(),
      dayIndex: selectedDayForAdd,
      time: newTime.trim(),
      subject: newSubject,
      task: newTask.trim(),
      isCompleted: false,
      colorTag: '#F472B6',
    };

    onUpdateSchedule([...schedule, newItem]);
    setNewTask('');
    setShowAddModal(false);
  };

  // Delete task
  const handleDeleteItem = (itemId: string) => {
    sound.playClick();
    onUpdateSchedule(schedule.filter((item) => item.id !== itemId));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-pink-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-pink-600 flex items-center gap-2 font-['Comfortaa',sans-serif]">
          <Calendar className="w-4 h-4 text-pink-500" />
          WEEKLY STUDY TIMETABLE
        </h2>

        <button
          onClick={() => {
            sound.playClick();
            setShowAddModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5 font-['Comfortaa',sans-serif]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ADD SESSION</span>
        </button>
      </div>

      {/* FULL-WEEK TIMETABLE GRID (7 days side by side) */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-pink-200 shadow-xs overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Table Header: Days in Arabic */}
          <div className="grid grid-cols-7 gap-2 pb-2.5 border-b border-pink-200 text-center">
            {DAYS_AR.map((day) => {
              const dayCount = schedule.filter((s) => s.dayIndex === day.index).length;
              return (
                <div key={day.index} className="p-1.5 rounded-xl bg-pink-50 border border-pink-100 flex flex-col items-center">
                  <span className="text-xs font-bold text-pink-700">{day.name}</span>
                  <span className="text-[9px] text-pink-400 font-mono font-['Comfortaa',sans-serif]">{dayCount} sessions</span>
                </div>
              );
            })}
          </div>

          {/* Table Body */}
          <div className="grid grid-cols-7 gap-2 pt-2.5 items-start min-h-80">
            {DAYS_AR.map((day) => {
              const items = schedule
                .filter((s) => s.dayIndex === day.index)
                .sort((a, b) => a.time.localeCompare(b.time));

              return (
                <div 
                  key={day.index} 
                  className="space-y-1.5 min-h-[260px] p-1.5 rounded-xl bg-pink-50/20 border border-pink-100 flex flex-col"
                >
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 rounded-lg border text-xs flex flex-col gap-1 transition-all shadow-xs group ${
                        item.isCompleted
                          ? 'bg-pink-100/60 border-pink-200 text-slate-400'
                          : 'bg-white border-pink-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-pink-100 text-pink-700 truncate">
                          {item.subject}
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-pink-300 hover:text-rose-500 p-0.5"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-[10px] font-mono text-pink-500 font-medium" dir="ltr">
                        {item.time}
                      </span>

                      <p className={`text-[11px] font-medium leading-tight ${item.isCompleted ? 'line-through' : ''}`}>
                        {item.task}
                      </p>

                      <button
                        onClick={() => handleToggleTask(item.id)}
                        className="self-end pt-0.5 text-pink-400 hover:text-pink-600 transition-colors"
                        title="Toggle Done"
                      >
                        {item.isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-pink-300" />
                        )}
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedDayForAdd(day.index);
                      setShowAddModal(true);
                    }}
                    className="w-full mt-auto py-1 rounded-lg border border-dashed border-pink-200 hover:border-pink-400 text-pink-400 hover:text-pink-600 text-[10px] font-semibold transition-all flex items-center justify-center gap-1 bg-white/40 font-['Comfortaa',sans-serif]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ADD</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl border border-pink-200 relative">
            <h3 className="text-sm font-bold text-pink-600 mb-3 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
              <Plus className="w-4 h-4 text-pink-500" />
              <span>ADD STUDY SESSION</span>
            </h3>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-pink-700 block mb-1 font-['Comfortaa',sans-serif] uppercase tracking-wider text-[11px]">
                  DAY (اليوم):
                </label>
                <select
                  value={selectedDayForAdd}
                  onChange={(e) => setSelectedDayForAdd(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/40 text-xs focus:outline-none"
                >
                  {DAYS_AR.map((d) => (
                    <option key={d.index} value={d.index}>{d.name} ({d.nameEn})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-pink-700 block mb-1 font-['Comfortaa',sans-serif] uppercase tracking-wider text-[11px]">
                  TIME SLOT:
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 17:00 - 19:00"
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/40 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-pink-700 block mb-1 font-['Comfortaa',sans-serif] uppercase tracking-wider text-[11px]">
                  SUBJECT (المادة):
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/40 text-xs focus:outline-none"
                >
                  {['الرياضيات', 'العلوم الفيزيائية', 'علوم الطبيعة والحياة', 'اللغة العربية', 'العلوم الإسلامية', 'التاريخ والجغرافيا', 'الفلسفة', 'اللغة الإنجليزية', 'اللغة الفرنسية', 'استراحة'].map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-pink-700 block mb-1 font-['Comfortaa',sans-serif] uppercase tracking-wider text-[11px]">
                  TASK / TOPIC:
                </label>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="e.g. Exercises in Functions"
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/40 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-bold font-['Comfortaa',sans-serif]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-xs font-['Comfortaa',sans-serif]"
                >
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
