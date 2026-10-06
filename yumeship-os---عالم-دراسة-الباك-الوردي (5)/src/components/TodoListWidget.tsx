import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  ListTodo, 
  CheckCircle2, 
  Sparkles,
  Tag
} from 'lucide-react';
import { TodoItem } from '../types';
import { sound } from '../utils/audio';
import { storage } from '../utils/storage';

const BAC_CATEGORIES = [
  'عام (General)',
  'الرياضيات (Math)',
  'العلوم الفيزيائية (Physics)',
  'علوم الطبيعة والحياة (Science)',
  'اللغة العربية (Arabic)',
  'التاريخ والجغرافيا (Hist/Geo)',
  'الفلسفة (Philosophy)',
  'العلوم الإسلامية (Islamic)',
  'اللغة الإنجليزية (English)',
  'اللغة الفرنسية (French)',
];

export const TodoListWidget: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>(() => storage.getTodos());
  const [newText, setNewText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(BAC_CATEGORIES[0]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const updateTodos = (updated: TodoItem[]) => {
    setTodos(updated);
    storage.saveTodos(updated);
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    sound.playClick();
    const cleanCategory = selectedCategory.split(' ')[0]; // E.g. 'عام' or 'الرياضيات'
    const newTodo: TodoItem = {
      id: 'todo_' + Date.now(),
      text: newText.trim(),
      isCompleted: false,
      category: cleanCategory,
      createdAt: new Date().toISOString(),
    };

    updateTodos([newTodo, ...todos]);
    setNewText('');
  };

  const handleToggleTodo = (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;

    if (!target.isCompleted) {
      sound.playSuccess();
    } else {
      sound.playClick();
    }

    const updated = todos.map((t) => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    updateTodos(updated);
  };

  const handleDeleteTodo = (id: string) => {
    sound.playClick();
    const updated = todos.filter((t) => t.id !== id);
    updateTodos(updated);
  };

  const handleClearCompleted = () => {
    sound.playClick();
    const updated = todos.filter((t) => !t.isCompleted);
    updateTodos(updated);
  };

  const completedCount = todos.filter((t) => t.isCompleted).length;
  const totalCount = todos.length;
  const percentDone = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  return (
    <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-pink-200 dark:border-zinc-800 shadow-xs flex flex-col gap-3 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-zinc-800 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif] uppercase tracking-wider flex items-center gap-1.5">
              <span>TO-DO LIST (قائمة المهام)</span>
              <Sparkles className="w-3 h-3 text-pink-400" />
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
              {completedCount} / {totalCount} Completed ({percentDone}%)
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-pink-50 dark:bg-zinc-900 p-0.5 rounded-lg border border-pink-100 dark:border-zinc-800 text-[10px] font-['Comfortaa',sans-serif]">
          <button
            onClick={() => {
              sound.playClick();
              setFilter('all');
            }}
            className={`px-2 py-0.5 rounded-md transition-all ${
              filter === 'all' 
                ? 'bg-pink-500 text-white font-bold shadow-xs' 
                : 'text-slate-600 dark:text-zinc-400 hover:text-pink-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setFilter('active');
            }}
            className={`px-2 py-0.5 rounded-md transition-all ${
              filter === 'active' 
                ? 'bg-pink-500 text-white font-bold shadow-xs' 
                : 'text-slate-600 dark:text-zinc-400 hover:text-pink-600'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setFilter('completed');
            }}
            className={`px-2 py-0.5 rounded-md transition-all ${
              filter === 'completed' 
                ? 'bg-pink-500 text-white font-bold shadow-xs' 
                : 'text-slate-600 dark:text-zinc-400 hover:text-pink-600'
            }`}
          >
            Done
          </button>
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full bg-pink-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-pink-400 to-rose-400 h-full rounded-full transition-all duration-300"
          style={{ width: `${percentDone}%` }}
        />
      </div>

      {/* Add Task Input Form */}
      <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a new task (e.g. حل تمارين المتتاليات)..."
          className="flex-1 px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-800 bg-pink-50/40 dark:bg-zinc-900 focus:border-pink-400 focus:outline-none text-xs text-slate-800 dark:text-zinc-100"
        />
        <div className="flex items-center gap-1.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-800 bg-pink-50/40 dark:bg-zinc-900 focus:border-pink-400 focus:outline-none text-[11px] text-slate-700 dark:text-zinc-200 max-w-[130px] truncate"
          >
            {BAC_CATEGORIES.map((c) => (
              <option key={c} value={c} className="dark:bg-zinc-900">{c}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 font-['Comfortaa',sans-serif] shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD</span>
          </button>
        </div>
      </form>

      {/* Tasks List */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {filteredTodos.length === 0 ? (
          <div className="py-6 text-center text-slate-400 dark:text-zinc-500 text-xs font-['Comfortaa',sans-serif]">
            {filter === 'completed' 
              ? 'No completed tasks yet.' 
              : filter === 'active' 
              ? 'No active tasks! You are all caught up.' 
              : 'No tasks yet! Add your study tasks above.'}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2.5 group ${
                todo.isCompleted
                  ? 'bg-pink-50/30 dark:bg-zinc-900/40 border-pink-100 dark:border-zinc-800/80 opacity-70'
                  : 'bg-white/80 dark:bg-zinc-900/80 border-pink-200/80 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-zinc-700'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleTodo(todo.id)}
                className="flex items-center gap-2.5 text-left flex-1 min-w-0"
              >
                {todo.isCompleted ? (
                  <CheckSquare className="w-4 h-4 text-pink-500 dark:text-pink-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-pink-300 dark:text-zinc-500 shrink-0 group-hover:text-pink-500" />
                )}
                <span
                  className={`text-xs break-words transition-all ${
                    todo.isCompleted
                      ? 'line-through text-slate-400 dark:text-zinc-500'
                      : 'text-slate-800 dark:text-zinc-200 font-medium'
                  }`}
                >
                  {todo.text}
                </span>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                {todo.category && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-pink-100 dark:bg-zinc-800 text-pink-700 dark:text-pink-300 font-medium">
                    {todo.category}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="p-1 rounded-md text-slate-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      {completedCount > 0 && (
        <div className="pt-1.5 border-t border-pink-100 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={handleClearCompleted}
            className="text-[10px] text-pink-500 hover:text-rose-600 dark:text-pink-400 font-bold font-['Comfortaa',sans-serif] transition-colors"
          >
            Clear Completed ({completedCount})
          </button>
        </div>
      )}
    </div>
  );
};
