import React, { useState } from 'react';
import { Download, X, Check, Laptop, ShieldCheck, Sparkles, FileCode } from 'lucide-react';
import { sound } from '../utils/audio';
import { downloadStandaloneIndexHtml } from '../utils/downloadApp';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadStandaloneIndexHtml();
    setDownloaded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border-2 border-pink-300 shadow-2xl space-y-5 text-right relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div>
              <span className="text-[10px] font-bold text-pink-400 block tracking-widest font-comfortaa">
                OFFLINE STANDALONE APP
              </span>
              <h3 className="text-lg font-black text-slate-800">
                تحميل التطبيق كملف <span className="text-pink-600 font-mono">index.html</span> كامل
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">ملف مستقل وشامل (Single-File Application)</h4>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                الملف يحتوي على النظام كاملاً: شاشة اللعبة، مؤقت بومودورو بالأصوات، مواد البكالوريا التسعة بجميع الدروس، الأهداف الشهرية، والجدول الأسبوعي.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-pink-200 text-pink-700 flex items-center justify-center shrink-0 mt-0.5">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-pink-950">تشغيل فوري بدون أي تثبيت أو إنترنت</h4>
              <p className="text-[11px] text-pink-800 mt-0.5 leading-relaxed">
                يكفي النقر المزدوج على ملف <code className="font-mono bg-white px-1.5 py-0.5 rounded text-pink-700">index.html</code> ليفتح مباشرة في المتصفح (Chrome, Edge, Safari) حتى في حال انقطاع النت.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-200 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-purple-950">حفظ تلقائي للبيانات والتقدم</h4>
              <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                أي درس تنجزه أو دقيقة تدرسها في مؤقت بومودورو تُحفظ تلقائياً في ذاكرة جهازك المحلية.
              </p>
            </div>
          </div>
        </div>

        {/* Download Action Area */}
        <div className="pt-2 space-y-2.5">
          <button
            onClick={handleDownload}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>اضغط هنا لتحميل ملف (index.html) الآن</span>
          </button>

          {downloaded && (
            <div className="p-3 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>تم تنزيل ملف index.html بنجاح! تفقّد مجلد التنزيلات (Downloads).</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-pink-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">حجم الملف: خفيف وسريع الفتح</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
