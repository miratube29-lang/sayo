import React, { useState } from 'react';
import { 
  TableProperties, 
  ListChecks, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Square, 
  Copy, 
  Check, 
  Sparkles,
  Rows,
  Columns
} from 'lucide-react';
import { WorkspaceItem } from '../types';
import { sound } from '../utils/audio';
import { storage } from '../utils/storage';

export const StudyWorkspaceView: React.FC = () => {
  const [items, setItems] = useState<WorkspaceItem[]>(() => storage.getWorkspaceItems());
  const [filterType, setFilterType] = useState<'all' | 'table' | 'checklist' | 'note'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Item Creator Modal / Dialog
  const [isCreating, setIsCreating] = useState<'table' | 'checklist' | 'note' | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const saveItems = (updated: WorkspaceItem[]) => {
    setItems(updated);
    storage.saveWorkspaceItems(updated);
  };

  // -------------------------------------------------------------
  // Creation handlers
  // -------------------------------------------------------------
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !isCreating) return;
    sound.playSuccess();

    let created: WorkspaceItem;

    if (isCreating === 'table') {
      created = {
        id: 'ws_' + Date.now(),
        title: newTitle.trim(),
        type: 'table',
        category: newCategory.trim() || 'جداول',
        tableData: {
          headers: ['العمود 1', 'العمود 2', 'العمود 3'],
          rows: [
            ['بيانات 1', 'بيانات 2', 'بيانات 3'],
            ['بيانات 4', 'بيانات 5', 'بيانات 6'],
          ],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (isCreating === 'checklist') {
      created = {
        id: 'ws_' + Date.now(),
        title: newTitle.trim(),
        type: 'checklist',
        category: newCategory.trim() || 'قوائم',
        checklistData: [
          { id: 'c_' + Date.now() + '_1', text: 'العنصر الأول في القائمة', isDone: false },
          { id: 'c_' + Date.now() + '_2', text: 'العنصر الثاني في القائمة', isDone: false },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      created = {
        id: 'ws_' + Date.now(),
        title: newTitle.trim(),
        type: 'note',
        category: newCategory.trim() || 'ملاحظات',
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    saveItems([created, ...items]);
    setNewTitle('');
    setNewCategory('');
    setIsCreating(null);
  };

  const handleDeleteItem = (id: string) => {
    sound.playClick();
    saveItems(items.filter((item) => item.id !== id));
  };

  // -------------------------------------------------------------
  // Table modification methods
  // -------------------------------------------------------------
  const handleUpdateTableCell = (itemId: string, rowIndex: number, colIndex: number, value: string) => {
    const updated = items.map((item) => {
      if (item.id !== itemId || !item.tableData) return item;
      const newRows = item.tableData.rows.map((row, rIdx) => {
        if (rIdx !== rowIndex) return row;
        const newRow = [...row];
        newRow[colIndex] = value;
        return newRow;
      });
      return {
        ...item,
        tableData: {
          ...item.tableData,
          rows: newRows,
        },
        updatedAt: new Date().toISOString(),
      };
    });
    saveItems(updated);
  };

  const handleUpdateTableHeader = (itemId: string, colIndex: number, value: string) => {
    const updated = items.map((item) => {
      if (item.id !== itemId || !item.tableData) return item;
      const newHeaders = [...item.tableData.headers];
      newHeaders[colIndex] = value;
      return {
        ...item,
        tableData: {
          ...item.tableData,
          headers: newHeaders,
        },
        updatedAt: new Date().toISOString(),
      };
    });
    saveItems(updated);
  };

  const handleAddTableRow = (itemId: string) => {
    sound.playClick();
    const updated = items.map((item) => {
      if (item.id !== itemId || !item.tableData) return item;
      const emptyRow = item.tableData.headers.map(() => '');
      return {
        ...item,
        tableData: {
          ...item.tableData,
          rows: [...item.tableData.rows, emptyRow],
        },
        updatedAt: new Date().toISOString(),
      };
    });
    saveItems(updated);
  };

  const handleDeleteTableRow = (itemId: string, rowIndex: number) => {
    sound.playClick();
    const updated = items.map((item) => {
      if (item.id !== itemId || !item.tableData) return item;
      if (item.tableData.rows.length <= 1) return item;
      return {
        ...item,
        tableData: {
          ...item.tableData,
          rows: item.tableData.rows.filter((_, idx) => idx !== rowIndex),
        },
        updatedAt: new Date().toISOString(),
      };
    });
    saveItems(updated);
  };

  const handleAddTableColumn = (itemId: string) => {
    sound.playClick();
    const updated = items.map((item) => {
      if (item.id !== itemId || !item.tableData) return item;
      const newColNum = item.tableData.headers.length + 1;
      return {
        ...item,
        tableData: {
          headers: [...item.tableData.headers, `عمود ${newColNum}`],
          rows: item.tableData.rows.map((row) => [...row, '']),
        },
        updatedAt: new Date().toISOString(),
      };
    });
    saveItems(updated);
  };

  // -------------------------------------------------------------
  // Checklist modification methods
  // -------------------------------------------------------------
  const handleToggleChecklistItem = (itemId: string, checkId: string) => {
    const updated = items.map((item) => {
      if (item.id !== itemId || !item.checklistData) return item;
      const nextList = item.checklistData.map((c) => {
        if (c.id === checkId) {
          const nextVal = !c.isDone;
          if (nextVal) sound.playSuccess();
          else sound.playClick();
          return { ...c, isDone: nextVal };
        }
        return c;
      });
      return {
        ...item,
        checklistData: nextList,
        updatedAt: new Date().toISOString(),
      };
    });
    saveItems(updated);
  };

  const handleAddChecklistItem = (itemId: string, text: string) => {
    if (!text.trim()) return;
    sound.playClick();
    const updated = items.map((item) => {
      if (item.id !== itemId || !item.checklistData) return item;
      return {
        ...item,
        checklistData: [
          ...item.checklistData,
          { id: 'c_' + Date.now(), text: text.trim(), isDone: false },
        ],
        updatedAt: new Date().toISOString(),
      };
    });
    saveItems(updated);
  };

  const handleDeleteChecklistItem = (itemId: string, checkId: string) => {
    sound.playClick();
    const updated = items.map((item) => {
      if (item.id !== itemId || !item.checklistData) return item;
      return {
        ...item,
        checklistData: item.checklistData.filter((c) => c.id !== checkId),
        updatedAt: new Date().toISOString(),
      };
    });
    saveItems(updated);
  };

  // -------------------------------------------------------------
  // Free Notes text modification
  // -------------------------------------------------------------
  const handleUpdateNoteContent = (itemId: string, content: string) => {
    const updated = items.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        content,
        updatedAt: new Date().toISOString(),
      };
    });
    saveItems(updated);
  };

  // Copy plain text representation to clipboard
  const handleCopyItem = (item: WorkspaceItem) => {
    sound.playClick();
    let textToCopy = `${item.title}\n\n`;

    if (item.type === 'table' && item.tableData) {
      textToCopy += item.tableData.headers.join(' | ') + '\n';
      textToCopy += item.tableData.headers.map(() => '---').join(' | ') + '\n';
      item.tableData.rows.forEach((r) => {
        textToCopy += r.join(' | ') + '\n';
      });
    } else if (item.type === 'checklist' && item.checklistData) {
      item.checklistData.forEach((c) => {
        textToCopy += `[${c.isDone ? 'X' : ' '}] ${c.text}\n`;
      });
    } else {
      textToCopy += item.content || '';
    }

    navigator.clipboard.writeText(textToCopy).catch(() => {});
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredItems = items.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4" style={{ direction: 'rtl' }}>
      {/* Header Banner */}
      <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-pink-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-zinc-800 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <TableProperties className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif]">
              FREE WORKSPACE & NOTEBOOK (مساحة الملاحظات والجداول الحرة)
            </h2>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
              مكان حر لكتابة الملاحظات، إنشاء جداول المقارنة، وقوائم المراجعة
            </span>
          </div>
        </div>

        {/* Action Buttons to Create Table, Checklist, or Note */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              sound.playClick();
              setIsCreating('table');
            }}
            className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 font-['Comfortaa',sans-serif]"
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>+ إنشاء جدول</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsCreating('checklist');
            }}
            className="px-3 py-1.5 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 font-bold text-xs transition-all flex items-center gap-1 font-['Comfortaa',sans-serif]"
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>+ إنشاء قائمة</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsCreating('note');
            }}
            className="px-3 py-1.5 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 font-bold text-xs transition-all flex items-center gap-1 font-['Comfortaa',sans-serif]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ كتابة حرة</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-white/70 dark:bg-zinc-900/60 p-1 rounded-xl border border-pink-100 dark:border-zinc-800 text-xs font-['Comfortaa',sans-serif]">
        <button
          onClick={() => {
            sound.playClick();
            setFilterType('all');
          }}
          className={`px-3 py-1 rounded-lg transition-all ${
            filterType === 'all'
              ? 'bg-pink-500 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-pink-600'
          }`}
        >
          الكل ({items.length})
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setFilterType('table');
          }}
          className={`px-3 py-1 rounded-lg transition-all ${
            filterType === 'table'
              ? 'bg-pink-500 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-pink-600'
          }`}
        >
          جداول ({items.filter((i) => i.type === 'table').length})
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setFilterType('checklist');
          }}
          className={`px-3 py-1 rounded-lg transition-all ${
            filterType === 'checklist'
              ? 'bg-pink-500 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-pink-600'
          }`}
        >
          قوائم ({items.filter((i) => i.type === 'checklist').length})
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setFilterType('note');
          }}
          className={`px-3 py-1 rounded-lg transition-all ${
            filterType === 'note'
              ? 'bg-pink-500 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-pink-600'
          }`}
        >
          كتابة حرة ({items.filter((i) => i.type === 'note').length})
        </button>
      </div>

      {/* Items Container */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-pink-200 dark:border-zinc-800 shadow-xs space-y-3 transition-colors"
          >
            {/* Item Card Header */}
            <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-pink-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400">
                  {item.type === 'table' && <TableProperties className="w-3.5 h-3.5" />}
                  {item.type === 'checklist' && <ListChecks className="w-3.5 h-3.5" />}
                  {item.type === 'note' && <FileText className="w-3.5 h-3.5" />}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-pink-700 dark:text-pink-300">
                    {item.title}
                  </h3>
                  {item.category && (
                    <span className="text-[10px] text-pink-400 dark:text-zinc-400 font-mono">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyItem(item)}
                  className="p-1.5 rounded-lg bg-pink-50 dark:bg-zinc-800 hover:bg-pink-100 text-pink-600 dark:text-zinc-300 text-xs transition-colors"
                  title="نسخ المحتوى"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* TYPE 1: INTERACTIVE TABLE (إنشاء وتعديل الجداول) */}
            {/* ----------------------------------------------------------- */}
            {item.type === 'table' && item.tableData && (
              <div className="space-y-2">
                <div className="overflow-x-auto pb-1">
                  <table className="w-full text-xs text-right border-collapse rounded-xl overflow-hidden border border-pink-200 dark:border-zinc-800">
                    <thead>
                      <tr className="bg-pink-100/80 dark:bg-zinc-800 text-pink-800 dark:text-pink-200">
                        {item.tableData.headers.map((header, colIdx) => (
                          <th key={colIdx} className="p-2 border-b border-pink-200 dark:border-zinc-700 font-bold min-w-[120px]">
                            <input
                              type="text"
                              value={header}
                              onChange={(e) => handleUpdateTableHeader(item.id, colIdx, e.target.value)}
                              className="w-full bg-transparent focus:outline-none focus:bg-white/80 dark:focus:bg-zinc-900 rounded px-1 font-bold"
                            />
                          </th>
                        ))}
                        <th className="p-2 w-10 text-center border-b border-pink-200 dark:border-zinc-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.tableData.rows.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className="hover:bg-pink-50/50 dark:hover:bg-zinc-850 border-b border-pink-100 dark:border-zinc-800"
                        >
                          {row.map((cell, colIdx) => (
                            <td key={colIdx} className="p-1.5 border-l border-pink-100 dark:border-zinc-800">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => handleUpdateTableCell(item.id, rowIdx, colIdx, e.target.value)}
                                className="w-full px-2 py-1 rounded-lg bg-pink-50/30 dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-pink-300 text-slate-800 dark:text-zinc-100"
                              />
                            </td>
                          ))}
                          <td className="p-1.5 text-center">
                            <button
                              onClick={() => handleDeleteTableRow(item.id, rowIdx)}
                              className="p-1 text-slate-300 dark:text-zinc-600 hover:text-rose-500 transition-colors"
                              title="حذف هذا الصف"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Control Buttons: Add Row / Add Column */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAddTableRow(item.id)}
                    className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 text-[11px] font-bold transition-all flex items-center gap-1 font-['Comfortaa',sans-serif]"
                  >
                    <Rows className="w-3 h-3" />
                    <span>+ إضافة صف</span>
                  </button>

                  <button
                    onClick={() => handleAddTableColumn(item.id)}
                    className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 text-[11px] font-bold transition-all flex items-center gap-1 font-['Comfortaa',sans-serif]"
                  >
                    <Columns className="w-3 h-3" />
                    <span>+ إضافة عمود</span>
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------- */}
            {/* TYPE 2: CHECKLIST (إنشاء وتعديل القوائم) */}
            {/* ----------------------------------------------------------- */}
            {item.type === 'checklist' && item.checklistData && (
              <div className="space-y-2">
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {item.checklistData.map((chk) => (
                    <div
                      key={chk.id}
                      className="p-2 rounded-xl bg-pink-50/40 dark:bg-zinc-900 border border-pink-100 dark:border-zinc-800 flex items-center justify-between gap-2 group text-xs"
                    >
                      <button
                        onClick={() => handleToggleChecklistItem(item.id, chk.id)}
                        className="flex items-center gap-2 text-right flex-1 min-w-0"
                      >
                        {chk.isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-zinc-600 shrink-0" />
                        )}
                        <span className={`truncate ${chk.isDone ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-800 dark:text-zinc-200 font-medium'}`}>
                          {chk.text}
                        </span>
                      </button>

                      <button
                        onClick={() => handleDeleteChecklistItem(item.id, chk.id)}
                        className="p-1 rounded-md text-slate-300 dark:text-zinc-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new item to checklist */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="أضف عنصراً جديداً إلى هذه القائمة..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddChecklistItem(item.id, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/30 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                  />
                  <span className="text-[10px] text-slate-400 self-center">
                    (اضغط Enter للإضافة)
                  </span>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------- */}
            {/* TYPE 3: FREE TEXT / NOTES (كتابة حرة وملاحظات) */}
            {/* ----------------------------------------------------------- */}
            {item.type === 'note' && (
              <div className="space-y-1.5">
                <textarea
                  rows={4}
                  value={item.content || ''}
                  onChange={(e) => handleUpdateNoteContent(item.id, e.target.value)}
                  placeholder="اكتب ملاحظاتك، خواطرك، استنتاجاتك، القوانين والصيغ هنا بحرية..."
                  className="w-full p-3 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/30 dark:bg-zinc-900 text-xs sm:text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400 font-sans leading-relaxed resize-y min-h-[90px]"
                />
              </div>
            )}
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-pink-200 dark:border-zinc-800 rounded-2xl space-y-2">
            <Sparkles className="w-6 h-6 text-pink-400 mx-auto" />
            <h4 className="text-sm font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif]">
              لا توجد عناصر مضافة بعد
            </h4>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">
              اضغط على أحد الأزرار بالأعلى لإنشاء جدول مقارنة، أو قائمة مراجعة، أو كتابة صفحة ملاحظات جديدة.
            </p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Creation Dialog Modal */}
      {/* ------------------------------------------------------------------ */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl p-5 shadow-2xl border border-pink-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">
                {isCreating === 'table' && 'إنشاء جدول جديد'}
                {isCreating === 'checklist' && 'إنشاء قائمة مراجعة جديدة'}
                {isCreating === 'note' && 'إنشاء صفحة كتابة حرة'}
              </h3>
              <button onClick={() => setIsCreating(null)} className="text-slate-400 hover:text-slate-600">
                <Trash2 className="hidden" />
                <span>✕</span>
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="mt-3 space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">
                  العنوان:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    isCreating === 'table'
                      ? 'مثال: جدول مقارنة القوى والحركات'
                      : isCreating === 'checklist'
                      ? 'مثال: قائمة مراجعة عطلة الشتاء'
                      : 'مثال: ملخص قوانين الأكسدة'
                  }
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">
                  التصنيف / المادة (اختياري):
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="مثال: رياضيات / فيزياء / عام"
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50/50 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs font-['Comfortaa',sans-serif]"
              >
                تأكيد وإنشاء
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
