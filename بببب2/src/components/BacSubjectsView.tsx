import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Calendar, 
  Plus, 
  ChevronDown, 
  ChevronLeft, 
  FolderPlus, 
  Settings2,
  X,
  FilePlus,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BacSubject, LessonItem, MonthData, MonthlyGoal, UnitItem } from '../types';
import { sound } from '../utils/audio';
import { getCurrentMonthIndex } from '../utils/helpers';

interface BacSubjectsViewProps {
  subjects: BacSubject[];
  months: MonthData[];
  onUpdateSubjects: (updated: BacSubject[]) => void;
  onUpdateMonths: (updatedMonths: MonthData[]) => void;
}

export const BacSubjectsView: React.FC<BacSubjectsViewProps> = ({
  subjects,
  months,
  onUpdateSubjects,
  onUpdateMonths,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || 'arabic');
  const [activeMonthIndex, setActiveMonthIndex] = useState(getCurrentMonthIndex());
  const [newGoalText, setNewGoalText] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesContent, setNotesContent] = useState('');

  // Accordion state: by default, all units are CLOSED to keep space calm and stress-free
  const [expandedUnitIds, setExpandedUnitIds] = useState<Record<string, boolean>>({});

  // Curriculum modification modal states
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectCoeff, setNewSubjectCoeff] = useState<number>(3);

  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectCode, setEditSubjectCode] = useState('');
  const [editSubjectCoeff, setEditSubjectCoeff] = useState<number>(3);

  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');

  const [editingUnit, setEditingUnit] = useState<{ id: string; title: string } | null>(null);

  const [addingLessonToUnitId, setAddingLessonToUnitId] = useState<string | null>(null);
  const [newLessonName, setNewLessonName] = useState('');

  const [editingLesson, setEditingLesson] = useState<{ unitId: string; lessonId: string; name: string } | null>(null);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || {
    id: 'custom',
    name: 'المادة',
    nameEn: 'Subject',
    code: 'SUB',
    coefficient: 2,
    units: [],
    notes: '',
  };
  const currentMonth = months[activeMonthIndex] || months[0];

  // Subject goals for the selected month
  const currentSubjectGoals: MonthlyGoal[] = currentMonth.subjectGoals?.[currentSubject.id] || [];

  // Calculate subject lessons progress percentage
  const totalLessons = currentSubject.units.reduce((acc, u) => acc + u.lessons.length, 0);
  const masteredLessons = currentSubject.units.reduce(
    (acc, u) => acc + u.lessons.filter((l) => l.status === 'mastered').length,
    0
  );
  const progressPercent = totalLessons > 0 ? Math.round((masteredLessons / totalLessons) * 100) : 0;

  // Toggle all units expansion
  const allExpanded = currentSubject.units.length > 0 && currentSubject.units.every((u) => !!expandedUnitIds[u.id]);
  const toggleAllUnits = () => {
    sound.playClick();
    if (allExpanded) {
      setExpandedUnitIds({});
    } else {
      const next: Record<string, boolean> = {};
      currentSubject.units.forEach((u) => { next[u.id] = true; });
      setExpandedUnitIds(next);
    }
  };

  // Toggle unit expansion (Accordion)
  const toggleUnit = (unitId: string) => {
    sound.playClick();
    setExpandedUnitIds((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  // Toggle goal completion for this subject in this month
  const handleToggleGoal = (goalId: string) => {
    sound.playClick();
    const updatedMonths = months.map((m) => {
      if (m.index !== activeMonthIndex) return m;
      const subGoals = m.subjectGoals[currentSubject.id] || [];
      return {
        ...m,
        subjectGoals: {
          ...m.subjectGoals,
          [currentSubject.id]: subGoals.map((g) => {
            if (g.id !== goalId) return g;
            const next = !g.isCompleted;
            if (next) sound.playSuccess();
            return { ...g, isCompleted: next };
          }),
        },
      };
    });
    onUpdateMonths(updatedMonths);
  };

  // Add new goal for this subject in this month
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    sound.playClick();

    const newGoal: MonthlyGoal = {
      id: 'subg_' + Date.now(),
      text: newGoalText.trim(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    const updatedMonths = months.map((m) => {
      if (m.index !== activeMonthIndex) return m;
      const subGoals = m.subjectGoals[currentSubject.id] || [];
      return {
        ...m,
        subjectGoals: {
          ...m.subjectGoals,
          [currentSubject.id]: [...subGoals, newGoal],
        },
      };
    });

    onUpdateMonths(updatedMonths);
    setNewGoalText('');
  };

  // Delete goal
  const handleDeleteGoal = (goalId: string) => {
    sound.playClick();
    const updatedMonths = months.map((m) => {
      if (m.index !== activeMonthIndex) return m;
      const subGoals = m.subjectGoals[currentSubject.id] || [];
      return {
        ...m,
        subjectGoals: {
          ...m.subjectGoals,
          [currentSubject.id]: subGoals.filter((g) => g.id !== goalId),
        },
      };
    });
    onUpdateMonths(updatedMonths);
  };

  // Change lesson status
  const handleCycleLessonStatus = (unitId: string, lessonId: string) => {
    sound.playClick();
    const statusCycle: LessonItem['status'][] = ['not_started', 'studying', 'summarized', 'mastered'];

    const updated = subjects.map((sub) => {
      if (sub.id !== currentSubject.id) return sub;
      return {
        ...sub,
        units: sub.units.map((unit) => {
          if (unit.id !== unitId) return unit;
          return {
            ...unit,
            lessons: unit.lessons.map((lesson) => {
              if (lesson.id !== lessonId) return lesson;
              const currentIndex = statusCycle.indexOf(lesson.status);
              const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
              if (nextStatus === 'mastered') {
                sound.playSuccess();
                try {
                  confetti({ particleCount: 25, spread: 45, colors: ['#F472B6', '#FBCFE8'] });
                } catch {}
              }
              return { ...lesson, status: nextStatus };
            }),
          };
        }),
      };
    });
    onUpdateSubjects(updated);
  };

  // Save subject notes
  const handleSaveNotes = () => {
    sound.playClick();
    const updated = subjects.map((sub) => {
      if (sub.id !== currentSubject.id) return sub;
      return { ...sub, notes: notesContent };
    });
    onUpdateSubjects(updated);
    setEditingNotes(false);
  };

  // -------------------------------------------------------------
  // Curriculum Editing Actions (Subjects, Units, Lessons)
  // -------------------------------------------------------------

  // Add Subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    sound.playSuccess();

    const newSub: BacSubject = {
      id: 'sub_' + Date.now(),
      name: newSubjectName.trim(),
      nameEn: newSubjectName.trim(),
      code: newSubjectCode.trim().toUpperCase() || newSubjectName.trim().slice(0, 3).toUpperCase(),
      coefficient: Number(newSubjectCoeff) || 2,
      units: [],
      notes: '',
    };

    const updated = [...subjects, newSub];
    onUpdateSubjects(updated);
    setSelectedSubjectId(newSub.id);
    setNewSubjectName('');
    setNewSubjectCode('');
    setIsAddSubjectOpen(false);
  };

  // Edit Current Subject
  const handleSaveEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubjectName.trim()) return;
    sound.playSuccess();

    const updated = subjects.map((sub) => {
      if (sub.id !== currentSubject.id) return sub;
      return {
        ...sub,
        name: editSubjectName.trim(),
        code: editSubjectCode.trim().toUpperCase() || sub.code,
        coefficient: Number(editSubjectCoeff) || sub.coefficient,
      };
    });

    onUpdateSubjects(updated);
    setIsEditSubjectOpen(false);
  };

  // Delete Current Subject
  const handleDeleteCurrentSubject = () => {
    if (subjects.length <= 1) return;
    sound.playClick();
    const updated = subjects.filter((s) => s.id !== currentSubject.id);
    onUpdateSubjects(updated);
    setSelectedSubjectId(updated[0]?.id || '');
    setIsEditSubjectOpen(false);
  };

  // Add Unit
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;
    sound.playSuccess();

    const newUnit: UnitItem = {
      id: 'unit_' + Date.now(),
      title: newUnitTitle.trim(),
      lessons: [],
    };

    const updated = subjects.map((sub) => {
      if (sub.id !== currentSubject.id) return sub;
      return {
        ...sub,
        units: [...sub.units, newUnit],
      };
    });

    onUpdateSubjects(updated);
    // Expand the newly added unit
    setExpandedUnitIds((prev) => ({ ...prev, [newUnit.id]: true }));
    setNewUnitTitle('');
    setIsAddUnitOpen(false);
  };

  // Save Edit Unit
  const handleSaveEditUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit || !editingUnit.title.trim()) return;
    sound.playClick();

    const updated = subjects.map((sub) => {
      if (sub.id !== currentSubject.id) return sub;
      return {
        ...sub,
        units: sub.units.map((u) => (u.id === editingUnit.id ? { ...u, title: editingUnit.title.trim() } : u)),
      };
    });

    onUpdateSubjects(updated);
    setEditingUnit(null);
  };

  // Delete Unit
  const handleDeleteUnit = (unitId: string) => {
    sound.playClick();
    const updated = subjects.map((sub) => {
      if (sub.id !== currentSubject.id) return sub;
      return {
        ...sub,
        units: sub.units.filter((u) => u.id !== unitId),
      };
    });
    onUpdateSubjects(updated);
    setEditingUnit(null);
  };

  // Add Lesson to Unit
  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingLessonToUnitId || !newLessonName.trim()) return;
    sound.playSuccess();

    const newLesson: LessonItem = {
      id: 'les_' + Date.now(),
      name: newLessonName.trim(),
      status: 'not_started',
    };

    const updated = subjects.map((sub) => {
      if (sub.id !== currentSubject.id) return sub;
      return {
        ...sub,
        units: sub.units.map((u) => {
          if (u.id !== addingLessonToUnitId) return u;
          return {
            ...u,
            lessons: [...u.lessons, newLesson],
          };
        }),
      };
    });

    onUpdateSubjects(updated);
    setNewLessonName('');
    setAddingLessonToUnitId(null);
  };

  // Save Edit Lesson
  const handleSaveEditLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !editingLesson.name.trim()) return;
    sound.playClick();

    const updated = subjects.map((sub) => {
      if (sub.id !== currentSubject.id) return sub;
      return {
        ...sub,
        units: sub.units.map((u) => {
          if (u.id !== editingLesson.unitId) return u;
          return {
            ...u,
            lessons: u.lessons.map((l) => (l.id === editingLesson.lessonId ? { ...l, name: editingLesson.name.trim() } : l)),
          };
        }),
      };
    });

    onUpdateSubjects(updated);
    setEditingLesson(null);
  };

  // Delete Lesson
  const handleDeleteLesson = (unitId: string, lessonId: string) => {
    sound.playClick();
    const updated = subjects.map((sub) => {
      if (sub.id !== currentSubject.id) return sub;
      return {
        ...sub,
        units: sub.units.map((u) => {
          if (u.id !== unitId) return u;
          return {
            ...u,
            lessons: u.lessons.filter((l) => l.id !== lessonId),
          };
        }),
      };
    });

    onUpdateSubjects(updated);
    setEditingLesson(null);
  };

  const getStatusBadge = (status: LessonItem['status']) => {
    switch (status) {
      case 'mastered':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-['Comfortaa',sans-serif]">Mastered</span>;
      case 'summarized':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">Summarized</span>;
      case 'studying':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-['Comfortaa',sans-serif]">In Progress</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-['Comfortaa',sans-serif]">Not Started</span>;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Title Header */}
      <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-pink-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-zinc-800 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif]">
              BAC SUBJECTS & CURRICULUM (المنهج والمواد)
            </h2>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
              قابل للتعديل والإضافة حسب التغييرات الرسمية
            </span>
          </div>
        </div>

        {/* Action Buttons: Add Subject & Active Month Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setIsAddSubjectOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 font-['Comfortaa',sans-serif]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مادة</span>
          </button>

          <div className="flex items-center gap-1.5 bg-pink-50/80 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-800">
            <Calendar className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
            <span className="text-xs font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">الشهر:</span>
            <select
              value={activeMonthIndex}
              onChange={(e) => setActiveMonthIndex(Number(e.target.value))}
              className="text-xs font-bold text-pink-600 dark:text-pink-400 bg-white dark:bg-zinc-800 border border-pink-200 dark:border-zinc-700 rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
            >
              {months.map((m) => (
                <option key={m.index} value={m.index} className="dark:bg-zinc-900">
                  {m.nameAr} ({m.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Horizontal Subject Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        {subjects.map((sub) => {
          const isSelected = sub.id === currentSubject.id;
          const monthGoalCount = currentMonth.subjectGoals?.[sub.id]?.length || 0;
          return (
            <button
              key={sub.id}
              onClick={() => {
                sound.playClick();
                setSelectedSubjectId(sub.id);
                setEditingNotes(false);
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white border-pink-400 shadow-xs'
                  : 'bg-white/85 dark:bg-zinc-900/80 hover:bg-pink-50 dark:hover:bg-zinc-800 text-pink-700 dark:text-zinc-200 border-pink-200 dark:border-zinc-800'
              }`}
            >
              <span>{sub.name}</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-black/10 dark:bg-white/20 font-mono">
                ×{sub.coefficient}
              </span>
              {monthGoalCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Subject Content Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Subject Overview + Goals + Notes */}
        <div className="lg:col-span-5 space-y-4">
          {/* Subject Overview & Edit Button */}
          <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-pink-200 dark:border-zinc-800 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-pink-400 dark:text-zinc-400 font-bold block font-['Comfortaa',sans-serif] uppercase">
                  SUBJECT:
                </span>
                <h3 className="text-base font-bold text-pink-700 dark:text-pink-300">
                  {currentSubject.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400 font-mono bg-pink-50 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-pink-100 dark:border-zinc-700">
                  ×{currentSubject.coefficient}
                </span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setEditSubjectName(currentSubject.name);
                    setEditSubjectCode(currentSubject.code);
                    setEditSubjectCoeff(currentSubject.coefficient);
                    setIsEditSubjectOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 text-pink-700 dark:text-pink-300 text-xs transition-colors"
                  title="تعديل المادة"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Curriculum Progress bar */}
            <div className="pt-1">
              <div className="flex justify-between text-xs font-bold text-pink-700 dark:text-pink-400 mb-1 font-['Comfortaa',sans-serif]">
                <span>MASTERY ({masteredLessons}/{totalLessons} lessons):</span>
                <span className="font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-pink-100 dark:bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Subject Goals for Current Month */}
          <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-pink-200 dark:border-zinc-800 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">
                أهداف {currentMonth.nameAr} الخاصة بـ {currentSubject.name}:
              </h3>
              <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-zinc-900 px-2 py-0.5 rounded-lg border border-pink-100 dark:border-zinc-800">
                {currentSubjectGoals.filter((g) => g.isCompleted).length} / {currentSubjectGoals.length}
              </span>
            </div>

            {/* Add Goal Input */}
            <form onSubmit={handleAddGoal} className="flex gap-1.5">
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder={`أضف هدفاً لـ ${currentMonth.nameAr}...`}
                className="flex-1 px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 focus:border-pink-400 focus:outline-none bg-pink-50/50 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs font-['Comfortaa',sans-serif]"
              >
                ADD
              </button>
            </form>

            {/* Goals List */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {currentSubjectGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-2 rounded-xl bg-pink-50/40 dark:bg-zinc-900 border border-pink-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs group"
                >
                  <button
                    onClick={() => handleToggleGoal(goal.id)}
                    className="flex items-center gap-2 text-right flex-1 min-w-0"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        goal.isCompleted ? 'text-emerald-500 fill-emerald-100 dark:fill-emerald-950' : 'text-slate-300 dark:text-zinc-600'
                      }`}
                    />
                    <span className={`truncate ${goal.isCompleted ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-800 dark:text-zinc-200 font-medium'}`}>
                      {goal.text}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 rounded-md text-slate-300 dark:text-zinc-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="حذف الهدف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {currentSubjectGoals.length === 0 && (
                <div className="py-3 text-center text-slate-400 dark:text-zinc-500 text-xs">
                  لا توجد أهداف مسجلة لهذا الشهر.
                </div>
              )}
            </div>
          </div>

          {/* Notes & Summaries Box */}
          <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-pink-200 dark:border-zinc-800 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
                <Edit3 className="w-3.5 h-3.5 text-pink-500" />
                ملخصات وملاحظات المادة
              </h3>
              {!editingNotes ? (
                <button
                  onClick={() => {
                    sound.playClick();
                    setNotesContent(currentSubject.notes || '');
                    setEditingNotes(true);
                  }}
                  className="text-xs text-pink-500 dark:text-pink-400 hover:underline font-bold font-['Comfortaa',sans-serif]"
                >
                  تعديل
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-['Comfortaa',sans-serif]"
                >
                  حفظ
                </button>
              )}
            </div>

            {editingNotes ? (
              <textarea
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-pink-200 dark:border-zinc-700 focus:border-pink-400 focus:outline-none bg-pink-50/40 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 font-sans resize-none"
                placeholder="اكتب ملاحظاتك وتلخيصاتك حول المادة..."
              />
            ) : (
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed bg-pink-50/50 dark:bg-zinc-900 p-2.5 rounded-xl border border-pink-100 dark:border-zinc-800 min-h-12 whitespace-pre-wrap">
                {currentSubject.notes || 'لا توجد ملاحظات مسجلة بعد. اضغط تعديل للكتابة.'}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Units & Lessons Curriculum Tracker (COLLAPSIBLE ACCORDION) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-pink-200 dark:border-zinc-800 shadow-xs space-y-3 transition-colors">
            {/* Header with Add Unit Button */}
            <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span>محاور ودروس: {currentSubject.name}</span>
                </h3>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-['Comfortaa',sans-serif]">
                  (اضغط على المحور لفتحه أو إغلاقه)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {currentSubject.units.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllUnits}
                    className="px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-zinc-800 hover:bg-pink-100 dark:hover:bg-zinc-700 text-pink-600 dark:text-pink-300 text-xs font-bold transition-all border border-pink-200 dark:border-zinc-700 font-['Comfortaa',sans-serif]"
                    title={allExpanded ? 'إغلاق جميع المحاور' : 'فتح جميع المحاور'}
                  >
                    {allExpanded ? 'إغلاق الكل' : 'فتح الكل'}
                  </button>
                )}

                <button
                  onClick={() => {
                    sound.playClick();
                    setIsAddUnitOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 text-xs font-bold transition-all flex items-center gap-1 font-['Comfortaa',sans-serif]"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ إضافة محور</span>
                </button>
              </div>
            </div>

            {/* Units List (Collapsible Accordion: closed by default) */}
            <div className="space-y-2.5">
              {currentSubject.units.map((unit) => {
                const isExpanded = !!expandedUnitIds[unit.id];
                const unitTotal = unit.lessons.length;
                const unitMastered = unit.lessons.filter((l) => l.status === 'mastered').length;

                return (
                  <div 
                    key={unit.id} 
                    className="rounded-2xl border border-pink-200/80 dark:border-zinc-800 overflow-hidden bg-white/70 dark:bg-zinc-950 transition-all shadow-xs"
                  >
                    {/* Unit Accordion Header: Clicking expands/collapses */}
                    <div 
                      onClick={() => toggleUnit(unit.id)}
                      className="p-3 bg-pink-50/70 dark:bg-zinc-900/90 hover:bg-pink-100/70 dark:hover:bg-zinc-850 cursor-pointer flex items-center justify-between gap-2 select-none transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-pink-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-pink-800 dark:text-pink-200 truncate">
                          {unit.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Unit progress badge */}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-300 font-mono font-bold border border-pink-200 dark:border-zinc-700">
                          {unitMastered} / {unitTotal}
                        </span>

                        {/* Edit unit trigger */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick();
                            setEditingUnit({ id: unit.id, title: unit.title });
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-white/80 dark:hover:bg-zinc-800 transition-colors"
                          title="تعديل أو حذف المحور"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Lessons Body */}
                    {isExpanded && (
                      <div className="p-3 space-y-2 bg-white/40 dark:bg-zinc-950 border-t border-pink-100 dark:border-zinc-850 animate-fadeIn">
                        {/* Add Lesson Button */}
                        <div className="flex justify-end pb-1">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setAddingLessonToUnitId(unit.id);
                            }}
                            className="px-2.5 py-0.5 rounded-md bg-pink-50 dark:bg-zinc-900 hover:bg-pink-100 dark:hover:bg-zinc-800 text-pink-600 dark:text-pink-400 text-[11px] font-bold transition-all flex items-center gap-1 border border-pink-200 dark:border-zinc-700 font-['Comfortaa',sans-serif]"
                          >
                            <FilePlus className="w-3 h-3" />
                            <span>+ إضافة درس</span>
                          </button>
                        </div>

                        {/* Lessons List */}
                        <div className="space-y-1.5">
                          {unit.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-pink-100 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-2 shadow-xs group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
                                <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate">
                                  {lesson.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Edit Lesson */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    sound.playClick();
                                    setEditingLesson({ unitId: unit.id, lessonId: lesson.id, name: lesson.name });
                                  }}
                                  className="p-1 rounded-md text-slate-300 dark:text-zinc-600 hover:text-pink-600 dark:hover:text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="تعديل اسم الدرس أو حذفه"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>

                                {/* Status Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleCycleLessonStatus(unit.id, lesson.id)}
                                  className="cursor-pointer active:scale-95 transition-transform"
                                  title="انقر لتغيير حالة الدرس"
                                >
                                  {getStatusBadge(lesson.status)}
                                </button>
                              </div>
                            </div>
                          ))}

                          {unit.lessons.length === 0 && (
                            <div className="py-3 text-center text-xs text-slate-400 dark:text-zinc-500">
                              لا توجد دروس مضافة في هذا المحور بعد. اضغط "+ إضافة درس" أعلاه.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {currentSubject.units.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500 border-2 border-dashed border-pink-200 dark:border-zinc-800 rounded-2xl">
                  لا توجد محاور مضافة لهذه المادة بعد. اضغط "+ إضافة محور" بالأعلى لإضافة المحاور حسب برنامجك.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Add New Subject */}
      {/* ------------------------------------------------------------------ */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl p-5 shadow-2xl border border-pink-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">
                إضافة مادة جديدة
              </h3>
              <button onClick={() => setIsAddSubjectOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubject} className="mt-3 space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">اسم المادة:</label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="مثال: هندسة الطرائق / الاقتصاد"
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">الرمز (Code):</label>
                  <input
                    type="text"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    placeholder="ECO"
                    className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs font-mono text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">المعامل (Coeff):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSubjectCoeff}
                    onChange={(e) => setNewSubjectCoeff(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs font-mono text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs font-['Comfortaa',sans-serif]"
              >
                تأكيد وإضافة المادة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Edit Subject */}
      {/* ------------------------------------------------------------------ */}
      {isEditSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl p-5 shadow-2xl border border-pink-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">
                تعديل المادة: {currentSubject.name}
              </h3>
              <button onClick={() => setIsEditSubjectOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditSubject} className="mt-3 space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">اسم المادة:</label>
                <input
                  type="text"
                  value={editSubjectName}
                  onChange={(e) => setEditSubjectName(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">الرمز:</label>
                  <input
                    type="text"
                    value={editSubjectCode}
                    onChange={(e) => setEditSubjectCode(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs font-mono text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">المعامل:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editSubjectCoeff}
                    onChange={(e) => setEditSubjectCoeff(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs font-mono text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs font-['Comfortaa',sans-serif]"
                >
                  حفظ التعديلات
                </button>
                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentSubject}
                    className="px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors"
                    title="حذف المادة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Add New Unit */}
      {/* ------------------------------------------------------------------ */}
      {isAddUnitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl p-5 shadow-2xl border border-pink-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">
                إضافة محور جديد لـ {currentSubject.name}
              </h3>
              <button onClick={() => setIsAddUnitOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddUnit} className="mt-3 space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">عنوان المحور / المجال:</label>
                <input
                  type="text"
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                  placeholder="مثال: المحور الثالث: الأعداد والحساب"
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs font-['Comfortaa',sans-serif]"
              >
                تأكيد وإضافة المحور
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Edit Unit */}
      {/* ------------------------------------------------------------------ */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl p-5 shadow-2xl border border-pink-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">
                تعديل عنوان المحور
              </h3>
              <button onClick={() => setEditingUnit(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditUnit} className="mt-3 space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">عنوان المحور:</label>
                <input
                  type="text"
                  value={editingUnit.title}
                  onChange={(e) => setEditingUnit({ ...editingUnit, title: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs font-['Comfortaa',sans-serif]"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteUnit(editingUnit.id)}
                  className="px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors"
                  title="حذف المحور بالكامل"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Add Lesson to Unit */}
      {/* ------------------------------------------------------------------ */}
      {addingLessonToUnitId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl p-5 shadow-2xl border border-pink-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">
                إضافة درس جديد للمحور
              </h3>
              <button onClick={() => setAddingLessonToUnitId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddLesson} className="mt-3 space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">اسم الدرس:</label>
                <input
                  type="text"
                  value={newLessonName}
                  onChange={(e) => setNewLessonName(e.target.value)}
                  placeholder="مثال: الاستنساخ والترجمة وتنشيط الأحماض"
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs font-['Comfortaa',sans-serif]"
              >
                تأكيد وإضافة الدرس
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Edit Lesson */}
      {/* ------------------------------------------------------------------ */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl p-5 shadow-2xl border border-pink-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">
                تعديل اسم الدرس
              </h3>
              <button onClick={() => setEditingLesson(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditLesson} className="mt-3 space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">اسم الدرس:</label>
                <input
                  type="text"
                  value={editingLesson.name}
                  onChange={(e) => setEditingLesson({ ...editingLesson, name: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs font-['Comfortaa',sans-serif]"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLesson(editingLesson.unitId, editingLesson.lessonId)}
                  className="px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors"
                  title="حذف هذا الدرس"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
