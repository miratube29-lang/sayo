import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Award, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Target,
  Star,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MonthData, MonthlyGoal, MonthlyAchievement, BacSubject } from '../types';
import { sound } from '../utils/audio';

interface MonthlyGoalsViewProps {
  months: MonthData[];
  subjects: BacSubject[];
  onUpdateMonths: (updated: MonthData[]) => void;
}

const BADGE_TAGS = ['Milestone', 'Focus', 'Calculus', 'Memorization', 'Review', 'Exam'];

export const MonthlyGoalsView: React.FC<MonthlyGoalsViewProps> = ({
  months,
  subjects,
  onUpdateMonths,
}) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [goalsTab, setGoalsTab] = useState<'subjects' | 'general'>('subjects');
  
  // Accordion state
  const [openSubjectId, setOpenSubjectId] = useState<string | null>(null);
  
  // Inputs
  const [newGeneralGoalText, setNewGeneralGoalText] = useState('');
  const [newSubGoalTexts, setNewSubGoalTexts] = useState<{ [subId: string]: string }>({});

  // Achievement form state
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [achTitle, setAchTitle] = useState('');
  const [achDesc, setAchDesc] = useState('');
  const [achTag, setAchTag] = useState('Milestone');

  const currentMonth = months[selectedMonthIndex] || months[0];

  // Calculate total goals across general + all subjects in this month
  const generalGoals = currentMonth.generalGoals || [];
  const subjectGoalsObj = currentMonth.subjectGoals || {};
  
  const allSubjectGoals = Object.values(subjectGoalsObj).flat();
  const allGoals = [...generalGoals, ...allSubjectGoals];
  const completedGoalsCount = allGoals.filter((g) => g.isCompleted).length;
  const totalGoalsCount = allGoals.length;
  const progressPercent = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  // Toggle general goal
  const handleToggleGeneralGoal = (goalId: string) => {
    sound.playClick();
    const updated = months.map((m) => {
      if (m.index !== currentMonth.index) return m;
      return {
        ...m,
        generalGoals: m.generalGoals.map((g) => {
          if (g.id !== goalId) return g;
          const next = !g.isCompleted;
          if (next) sound.playSuccess();
          return { ...g, isCompleted: next };
        }),
      };
    });
    onUpdateMonths(updated);
  };

  // Add general goal
  const handleAddGeneralGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGeneralGoalText.trim()) return;
    sound.playClick();

    const newGoal: MonthlyGoal = {
      id: 'geng_' + Date.now(),
      text: newGeneralGoalText.trim(),
      isCompleted: false,
    };

    const updated = months.map((m) => {
      if (m.index !== currentMonth.index) return m;
      return {
        ...m,
        generalGoals: [...m.generalGoals, newGoal],
      };
    });

    onUpdateMonths(updated);
    setNewGeneralGoalText('');
  };

  // Delete general goal
  const handleDeleteGeneralGoal = (goalId: string) => {
    sound.playClick();
    const updated = months.map((m) => {
      if (m.index !== currentMonth.index) return m;
      return {
        ...m,
        generalGoals: m.generalGoals.filter((g) => g.id !== goalId),
      };
    });
    onUpdateMonths(updated);
  };

  // Toggle subject goal inside month
  const handleToggleSubjectGoal = (subId: string, goalId: string) => {
    sound.playClick();
    const updated = months.map((m) => {
      if (m.index !== currentMonth.index) return m;
      const subGoals = m.subjectGoals[subId] || [];
      return {
        ...m,
        subjectGoals: {
          ...m.subjectGoals,
          [subId]: subGoals.map((g) => {
            if (g.id !== goalId) return g;
            const next = !g.isCompleted;
            if (next) sound.playSuccess();
            return { ...g, isCompleted: next };
          }),
        },
      };
    });
    onUpdateMonths(updated);
  };

  // Add goal for specific subject inside month
  const handleAddSubjectGoal = (subId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = newSubGoalTexts[subId]?.trim();
    if (!text) return;
    sound.playClick();

    const newGoal: MonthlyGoal = {
      id: 'subg_' + Date.now(),
      text,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    const updated = months.map((m) => {
      if (m.index !== currentMonth.index) return m;
      const subGoals = m.subjectGoals[subId] || [];
      return {
        ...m,
        subjectGoals: {
          ...m.subjectGoals,
          [subId]: [...subGoals, newGoal],
        },
      };
    });

    onUpdateMonths(updated);
    setNewSubGoalTexts({ ...newSubGoalTexts, [subId]: '' });
  };

  // Delete subject goal inside month
  const handleDeleteSubjectGoal = (subId: string, goalId: string) => {
    sound.playClick();
    const updated = months.map((m) => {
      if (m.index !== currentMonth.index) return m;
      const subGoals = m.subjectGoals[subId] || [];
      return {
        ...m,
        subjectGoals: {
          ...m.subjectGoals,
          [subId]: subGoals.filter((g) => g.id !== goalId),
        },
      };
    });
    onUpdateMonths(updated);
  };

  // Add achievement
  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle.trim()) return;
    sound.playSuccess();

    try {
      confetti({ particleCount: 35, spread: 50, colors: ['#F472B6', '#FBCFE8', '#FDE047'] });
    } catch {}

    const newAch: MonthlyAchievement = {
      id: 'ach_' + Date.now(),
      title: achTitle.trim(),
      description: achDesc.trim(),
      date: new Date().toISOString().split('T')[0],
      category: achTag,
      sticker: '',
    };

    const updated = months.map((m) => {
      if (m.index !== currentMonth.index) return m;
      return {
        ...m,
        achievements: [...m.achievements, newAch],
      };
    });

    onUpdateMonths(updated);
    setAchTitle('');
    setAchDesc('');
    setShowAddAchievement(false);
  };

  // Delete achievement
  const handleDeleteAchievement = (achId: string) => {
    sound.playClick();
    const updated = months.map((m) => {
      if (m.index !== currentMonth.index) return m;
      return {
        ...m,
        achievements: m.achievements.filter((a) => a.id !== achId),
      };
    });
    onUpdateMonths(updated);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-pink-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-pink-600 flex items-center gap-2 font-['Comfortaa',sans-serif]">
            <CalendarCheck className="w-4 h-4 text-pink-500" />
            MONTHLY GOALS & ACHIEVEMENTS
          </h2>
        </div>

        {/* Quick Month Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              setSelectedMonthIndex((prev) => (prev > 0 ? prev - 1 : months.length - 1));
            }}
            className="p-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-pink-700 px-3 py-1 bg-pink-50 rounded-lg border border-pink-200 min-w-28 text-center font-['Comfortaa',sans-serif]">
            {currentMonth.nameAr} · {currentMonth.nameEn}
          </span>
          <button
            onClick={() => {
              sound.playClick();
              setSelectedMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : 0));
            }}
            className="p-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 12 Months Horizontal Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        {months.map((m) => {
          const isSelected = m.index === currentMonth.index;
          const monthGoalCount = (m.generalGoals?.length || 0) + Object.values(m.subjectGoals || {}).flat().length;
          return (
            <button
              key={m.index}
              onClick={() => {
                sound.playClick();
                setSelectedMonthIndex(m.index);
                setShowAddAchievement(false);
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white border-pink-400 shadow-xs'
                  : 'bg-white/85 hover:bg-pink-50 text-pink-700 border-pink-200'
              }`}
            >
              <span>{m.nameAr}</span>
              {monthGoalCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Month Quote Banner (Arabic quote without emojis) */}
      <div className="bg-gradient-to-r from-pink-100/90 via-pink-50/90 to-rose-100/90 rounded-2xl p-3 border border-pink-200 text-center shadow-xs">
        <p className="text-xs font-bold text-pink-800 italic">
          "{currentMonth.quote}"
        </p>
      </div>

      {/* Main Grid: Goals (Left) & Achievements (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Monthly Goals Section */}
        <div className="lg:col-span-7 bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-pink-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-pink-100">
            <h3 className="text-sm font-bold text-pink-700 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
              <CalendarCheck className="w-4 h-4 text-pink-500" />
              <span>GOALS: {currentMonth.nameAr}</span>
            </h3>
            
            <span className="text-xs text-pink-600 font-mono font-bold bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">
              {completedGoalsCount} / {totalGoalsCount} ({progressPercent}% Completed)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-pink-100 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Goals Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-pink-50/80 rounded-xl border border-pink-200">
            <button
              onClick={() => {
                sound.playClick();
                setGoalsTab('subjects');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 font-['Comfortaa',sans-serif] ${
                goalsTab === 'subjects'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-pink-400 hover:text-pink-600'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>SUBJECT GOALS</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setGoalsTab('general');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 font-['Comfortaa',sans-serif] ${
                goalsTab === 'general'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-pink-400 hover:text-pink-600'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>GENERAL GOALS</span>
            </button>
          </div>

          {/* TAB 1: 9 Small Collapsible Subject Cards */}
          {goalsTab === 'subjects' && (
            <div className="space-y-1.5 pt-0.5">
              {subjects.map((sub) => {
                const isOpen = openSubjectId === sub.id;
                const subGoals = currentMonth.subjectGoals?.[sub.id] || [];
                const subCompleted = subGoals.filter((g) => g.isCompleted).length;

                return (
                  <div 
                    key={sub.id} 
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isOpen 
                        ? 'border-pink-300 bg-pink-50/40 shadow-xs' 
                        : 'border-pink-100 bg-white hover:border-pink-200'
                    }`}
                  >
                    {/* Compact Collapsed Header */}
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setOpenSubjectId(isOpen ? null : sub.id);
                      }}
                      className="w-full p-2.5 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 font-bold text-[10px] flex items-center justify-center font-mono">
                          {sub.code}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {sub.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-['Comfortaa',sans-serif] ${
                          subGoals.length > 0 
                            ? 'bg-pink-100 text-pink-700' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {subGoals.length > 0 ? `${subCompleted}/${subGoals.length}` : '0'}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5 text-pink-500" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-pink-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isOpen && (
                      <div className="px-3 pb-3 pt-1 border-t border-pink-100 space-y-2 animate-fadeIn">
                        <form onSubmit={(e) => handleAddSubjectGoal(sub.id, e)} className="flex gap-1.5">
                          <input
                            type="text"
                            value={newSubGoalTexts[sub.id] || ''}
                            onChange={(e) => setNewSubGoalTexts({ ...newSubGoalTexts, [sub.id]: e.target.value })}
                            placeholder={`Goal for ${sub.name}...`}
                            className="flex-1 px-2.5 py-1 rounded-lg border border-pink-200 text-xs bg-white focus:outline-none focus:border-pink-400"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs font-['Comfortaa',sans-serif]"
                          >
                            ADD
                          </button>
                        </form>

                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {subGoals.map((goal) => (
                            <div
                              key={goal.id}
                              className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                                goal.isCompleted
                                  ? 'bg-pink-50/50 border-pink-200 line-through text-slate-400'
                                  : 'bg-white border-pink-100 text-slate-700'
                              }`}
                            >
                              <div 
                                onClick={() => handleToggleSubjectGoal(sub.id, goal.id)}
                                className="flex items-center gap-2 flex-1 cursor-pointer"
                              >
                                {goal.isCompleted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                                )}
                                <span>{goal.text}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteSubjectGoal(sub.id, goal.id)}
                                className="text-pink-300 hover:text-rose-500 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          {subGoals.length === 0 && (
                            <div className="text-center py-2 text-pink-300 text-[11px] font-['Comfortaa',sans-serif]">
                              No goals recorded yet.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: General Monthly Goals */}
          {goalsTab === 'general' && (
            <div className="space-y-2 pt-0.5">
              <form onSubmit={handleAddGeneralGoal} className="flex gap-1.5">
                <input
                  type="text"
                  value={newGeneralGoalText}
                  onChange={(e) => setNewGeneralGoalText(e.target.value)}
                  placeholder={`General goal for ${currentMonth.nameAr}...`}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-pink-200 focus:border-pink-400 focus:outline-none bg-pink-50/50 text-xs text-slate-800"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-pink-400 hover:bg-pink-500 text-white font-bold text-xs shadow-xs font-['Comfortaa',sans-serif]"
                >
                  ADD
                </button>
              </form>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {generalGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 text-xs ${
                      goal.isCompleted
                        ? 'bg-pink-50/60 border-pink-200 line-through text-slate-400'
                        : 'bg-white border-pink-100 text-slate-700 shadow-xs hover:border-pink-300'
                    }`}
                  >
                    <div 
                      onClick={() => handleToggleGeneralGoal(goal.id)}
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                      {goal.isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                      )}
                      <span>{goal.text}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteGeneralGoal(goal.id)}
                      className="text-pink-300 hover:text-rose-500 transition-colors p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {generalGoals.length === 0 && (
                  <div className="text-center py-4 text-pink-300 text-xs font-['Comfortaa',sans-serif]">
                    No general goals recorded for this month.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Monthly Achievements */}
        <div className="lg:col-span-5 bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-pink-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-pink-100">
            <h3 className="text-sm font-bold text-pink-700 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
              <Award className="w-4 h-4 text-pink-500" />
              <span>MILESTONES: {currentMonth.nameAr}</span>
            </h3>
            <button
              onClick={() => {
                sound.playClick();
                setShowAddAchievement(!showAddAchievement);
              }}
              className="px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold transition-all flex items-center gap-1 font-['Comfortaa',sans-serif]"
            >
              <Plus className="w-3 h-3" />
              <span>ADD</span>
            </button>
          </div>

          {/* Add Achievement Box */}
          {showAddAchievement && (
            <form onSubmit={handleAddAchievement} className="p-3 rounded-xl bg-pink-50/80 border border-pink-200 space-y-2 animate-fadeIn">
              <input
                type="text"
                value={achTitle}
                onChange={(e) => setAchTitle(e.target.value)}
                placeholder="Milestone title..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-pink-200 text-xs focus:outline-none focus:border-pink-400 bg-white"
                required
              />
              <textarea
                value={achDesc}
                onChange={(e) => setAchDesc(e.target.value)}
                placeholder="Details or reflection..."
                rows={2}
                className="w-full px-2.5 py-1.5 rounded-lg border border-pink-200 text-xs focus:outline-none focus:border-pink-400 bg-white"
              />

              {/* Tag Choice */}
              <div>
                <span className="text-[10px] font-bold text-pink-600 block mb-1 font-['Comfortaa',sans-serif]">
                  TAG:
                </span>
                <div className="flex flex-wrap gap-1">
                  {BADGE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setAchTag(tag)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                        achTag === tag ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-slate-700 border-pink-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddAchievement(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold font-['Comfortaa',sans-serif]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs font-['Comfortaa',sans-serif]"
                >
                  SAVE
                </button>
              </div>
            </form>
          )}

          {/* Achievements Cards List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {currentMonth.achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-2.5 rounded-xl bg-white border border-pink-200 shadow-xs flex items-start gap-2.5 relative group"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 shrink-0 border border-pink-200">
                  <Award className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-pink-800">{ach.title}</h4>
                    <span className="text-[9px] text-pink-400 font-mono">{ach.date}</span>
                  </div>
                  {ach.description && (
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{ach.description}</p>
                  )}
                  {ach.category && (
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] bg-pink-50 text-pink-600 border border-pink-100 font-mono">
                      {ach.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteAchievement(ach.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-pink-300 hover:text-rose-500 p-0.5"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {currentMonth.achievements.length === 0 && !showAddAchievement && (
              <div className="text-center py-6 text-pink-300 text-xs font-['Comfortaa',sans-serif]">
                No milestones recorded for this month yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
