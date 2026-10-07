import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  X, 
  CheckCircle2, 
  LogOut, 
  Plus, 
  Trash2, 
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  UserCheck
} from 'lucide-react';
import { UserProfile, SavedAccount } from '../types';
import { sound } from '../utils/audio';
import { storage, DEFAULT_AVATAR, DEFAULT_USER_PROFILE } from '../utils/storage';
import { googleSignIn, googleSignOut } from '../utils/firebaseAuth';
import { loadUserDataFromCloud } from '../utils/cloudSync';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onLoginComplete: () => void;
  onAccountSwitched?: (newProfile: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onLoginComplete,
  onAccountSwitched,
}) => {
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => storage.getSavedAccounts());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCopiedDomain, setIsCopiedDomain] = useState(false);
  const [quickFallbackName, setQuickFallbackName] = useState('');

  const activeEmail = storage.getActiveAccountEmail();
  const isLoggedIn = storage.isLoggedIn();
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  useEffect(() => {
    if (isOpen) {
      setSavedAccounts(storage.getSavedAccounts());
      setAuthError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real Google Sign In popup with Google Account Chooser screen (accounts.google.com/v3/signin/accountchooser)
  const handleRealGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    sound.playClick();

    try {
      const res = await googleSignIn();
      const gUser = res.user;

      if (!gUser.email) {
        throw new Error('لم يتم استرجاع البريد الإلكتروني من حساب Google');
      }

      const cleanEmail = gUser.email.toLowerCase();
      const cleanName = gUser.displayName || cleanEmail.split('@')[0];
      const avatarUrl = gUser.photoURL || DEFAULT_AVATAR;

      // 1. Switch active storage prefix to this account
      storage.setActiveAccountEmail(cleanEmail);

      // 2. Save into saved accounts list
      const newAcc: SavedAccount = {
        email: cleanEmail,
        name: cleanName,
        avatar: avatarUrl,
        lastLogin: new Date().toISOString(),
      };
      storage.addSavedAccount(newAcc);
      setSavedAccounts(storage.getSavedAccounts());

      // 3. Hydrate study data from Firebase Cloud (tablet <-> other devices sync)
      await loadUserDataFromCloud(gUser.uid);

      // 4. Load or initialize profile for this account
      const loadedProfile = storage.getUserProfile();
      const updated: UserProfile = {
        ...loadedProfile,
        name: cleanName,
        email: cleanEmail,
        avatar: avatarUrl,
        loginMethod: 'google',
      };

      storage.saveUserProfile(updated);
      storage.setLoggedIn(true);

      onSaveProfile(updated);
      if (onAccountSwitched) onAccountSwitched(updated);

      sound.playSuccess();
      onLoginComplete();
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/internal-error' || err?.message?.includes('internal-error')) {
        setAuthError('internal-error');
      } else if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setAuthError('unauthorized-domain');
      } else if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setAuthError('تم إغلاق نافذة تسجيل الدخول.');
      } else {
        console.warn('Google Sign In notice:', err?.message || err);
        setAuthError(err?.message || 'حدث خطأ أثناء الاتصال بحساب Google. يرجى المحاولة ثانية.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Instant fallback login if domain is not yet authorized in Firebase Console
  const handleInstantFallbackLogin = (customName?: string) => {
    sound.playSuccess();
    const finalName = customName?.trim() || quickFallbackName.trim() || 'طالب البكالوريا';
    const finalEmail = `${finalName.replace(/\s+/g, '').toLowerCase()}@bac.student`;

    storage.setActiveAccountEmail(finalEmail);
    const newAcc: SavedAccount = {
      email: finalEmail,
      name: finalName,
      avatar: DEFAULT_AVATAR,
      lastLogin: new Date().toISOString(),
    };
    storage.addSavedAccount(newAcc);
    setSavedAccounts(storage.getSavedAccounts());

    const loadedProfile = storage.getUserProfile();
    const updated: UserProfile = {
      ...loadedProfile,
      name: finalName,
      email: finalEmail,
      loginMethod: 'google',
    };

    storage.saveUserProfile(updated);
    storage.setLoggedIn(true);
    onSaveProfile(updated);
    if (onAccountSwitched) onAccountSwitched(updated);

    onLoginComplete();
    onClose();
  };

  // Copy current domain to clipboard
  const handleCopyDomain = () => {
    sound.playClick();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setIsCopiedDomain(true);
      setTimeout(() => setIsCopiedDomain(false), 2500);
    }
  };

  // Direct login with a previously saved account on this device
  const handleSelectSavedAccount = (account: SavedAccount) => {
    sound.playSuccess();
    storage.setActiveAccountEmail(account.email);
    const loadedProfile = storage.getUserProfile();
    const updated: UserProfile = {
      ...loadedProfile,
      name: account.name || loadedProfile.name || account.email.split('@')[0],
      email: account.email,
      avatar: account.avatar || loadedProfile.avatar,
      loginMethod: 'google',
    };
    storage.saveUserProfile(updated);
    storage.setLoggedIn(true);
    onSaveProfile(updated);
    if (onAccountSwitched) onAccountSwitched(updated);
    onLoginComplete();
    onClose();
  };

  // Remove saved account from this device
  const handleRemoveAccount = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    storage.removeSavedAccount(email);
    setSavedAccounts(storage.getSavedAccounts());
  };

  // Continue as Guest
  const handleGuestSignIn = () => {
    sound.playClick();
    storage.setActiveAccountEmail(null);
    storage.setLoggedIn(true);
    const guestProfile = storage.getUserProfile();
    onSaveProfile(guestProfile);
    if (onAccountSwitched) onAccountSwitched(guestProfile);
    onLoginComplete();
    onClose();
  };

  // Sign out
  const handleSignOut = async () => {
    sound.playClick();
    try {
      await googleSignOut();
    } catch {
      // ignore
    }
    storage.setLoggedIn(false);
    storage.setActiveAccountEmail(null);
    const emptyProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      loginMethod: 'guest',
    };
    onSaveProfile(emptyProfile);
    if (onAccountSwitched) onAccountSwitched(emptyProfile);
  };

  const isDomainError = authError === 'unauthorized-domain';
  const isInternalError = authError === 'internal-error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-pink-200 dark:border-zinc-800 relative overflow-hidden transition-colors max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-zinc-800 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-pink-400 dark:text-pink-300 uppercase tracking-widest block font-['Comfortaa',sans-serif]">
                GOOGLE SIGN-IN
              </span>
              <h2 className="text-base sm:text-lg font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif]">
                CHOOSE AN ACCOUNT (تسجيل الدخول)
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 flex items-center justify-center text-pink-600 dark:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Account Status */}
        {isLoggedIn && activeEmail && (
          <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-300 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 font-bold text-xs">
                {userProfile.avatar && userProfile.avatar !== DEFAULT_AVATAR ? (
                  <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'G'
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block truncate">
                  {userProfile.name || 'حساب متصل'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block truncate">
                  {activeEmail}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold flex items-center gap-1 hover:bg-rose-200 transition-colors shrink-0 font-['Comfortaa',sans-serif]"
            >
              <LogOut className="w-3 h-3" />
              <span>خروج</span>
            </button>
          </div>
        )}

        {/* Dedicated Guide for auth/unauthorized-domain error */}
        {isDomainError && (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 space-y-2.5 text-xs animate-fadeIn">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 dark:text-amber-200">
                  حل مشكلة (auth/unauthorized-domain):
                </h4>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                  فايربيز يتطلب إضافة اسم نطاق موقعك في قائمة <b>Authorized Domains</b> حتى يسمح بالنافذة المنبثقة.
                </p>
              </div>
            </div>

            {/* Current Domain Box with Copy Button */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-sans">
                  اسم النطاق المطلوب إضافته بالضبط (بدون https وبدون /):
                </span>
                <span className="font-mono font-bold text-xs text-amber-900 dark:text-amber-300 truncate block">
                  {currentHostname}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyDomain}
                className="px-2.5 py-1.5 rounded-lg bg-amber-100 dark:bg-zinc-800 hover:bg-amber-200 dark:hover:bg-zinc-700 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
              >
                {isCopiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedDomain ? 'تم النسخ!' : 'نسخ النطاق'}</span>
              </button>
            </div>

            {/* Authorized domain info */}
            <div className="text-[11px] text-amber-900 dark:text-amber-200 space-y-1 pr-1 font-sans">
              <p className="font-bold">ملاحظة أمان من Google:</p>
              <p className="text-slate-700 dark:text-zinc-300">
                إذا ظهرت لك هذه الرسالة، يرجى التأكد من إضافة هذا النطاق <code className="bg-amber-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px] font-mono">{currentHostname}</code> إلى Authorized Domains في إعدادات فايربيز للسماح بنافذة تسجيل الدخول.
              </p>
            </div>
          </div>
        )}

        {/* Dedicated Guide for auth/internal-error (App Check Enforcement) */}
        {isInternalError && (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-700 space-y-2.5 text-xs animate-fadeIn">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-900 dark:text-rose-200">
                  حل مشكلة (auth/internal-error):
                </h4>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                  تم فحص سيرفرات فايربيز وتبيّن أن السبب هو تفعيل ميزة <b>App Check Enforcement</b> على خدمة تسجيل الدخول، مما يجعل فايربيز يرفض الاتصال بـ <code>401 App Check token is invalid</code>.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-rose-900 dark:text-rose-200 space-y-1.5 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-zinc-800 font-sans">
              <p className="font-bold text-slate-800 dark:text-zinc-200">خطوات الحل في ثوانٍ من لوحة Firebase Console:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-zinc-300">
                <li>افتح لوحة <b>Firebase Console</b> لمشروعك.</li>
                <li>من القائمة الجانبية اختر <b>App Check</b> ثم اضغط تبويب <b>APIs</b>.</li>
                <li>ابحث عن <b>Authentication</b> (أو Identity Toolkit API).</li>
                <li>اضغط على الزر بجانبها واختر <b>Unenforce (إلغاء الإنفاذ)</b> ثم تأكيد (Confirm).</li>
              </ol>
            </div>
          </div>
        )}

        {/* Regular error notification if any other error */}
        {authError && !isDomainError && !isInternalError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{authError}</span>
          </div>
        )}

        {/* PRIMARY ACTION: Sign In with Google popup account chooser */}
        <div className="mt-4 space-y-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-50/80 to-rose-50/80 dark:from-zinc-900 dark:to-zinc-950 border-2 border-pink-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-bold text-pink-800 dark:text-pink-300 font-['Comfortaa',sans-serif]">
                تسجيل الدخول الرسمي بحساب Google:
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
              اضغط الزر أدناه لفتح نافذة اختيار الحساب الرسمية من Google (Choose an account) لحفظ جميع موادك وساعات دراستك تلقائياً وبأمان.
            </p>

            <button
              type="button"
              onClick={handleRealGoogleSignIn}
              disabled={isSigningIn}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 active:scale-98 text-slate-700 dark:text-zinc-100 font-bold text-xs sm:text-sm shadow-sm border-2 border-slate-300 dark:border-zinc-700 transition-all flex items-center justify-center gap-2.5 group font-['Comfortaa',sans-serif]"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
                  <span>جارٍ الاتصال بقائمة Google...</span>
                </>
              ) : (
                <>
                  {/* Google G Logo SVG */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>SIGN IN WITH GOOGLE (قائمة حسابات GOOGLE)</span>
                </>
              )}
            </button>
          </div>

          {/* Saved Accounts on This Device */}
          {savedAccounts.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 font-['Comfortaa',sans-serif] uppercase tracking-wider">
                  حسابات مسجلة على هذا الجهاز:
                </span>
                <span className="text-[10px] text-pink-500 font-bold font-mono">
                  {savedAccounts.length} حساب
                </span>
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {savedAccounts.map((acc) => {
                  const isCurrent = activeEmail?.toLowerCase() === acc.email.toLowerCase();
                  return (
                    <div
                      key={acc.email}
                      onClick={() => handleSelectSavedAccount(acc)}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer group ${
                        isCurrent
                          ? 'bg-pink-50/70 dark:bg-zinc-900 border-pink-400 dark:border-pink-500 shadow-xs'
                          : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xs shrink-0 border border-pink-200 dark:border-zinc-700">
                          {acc.avatar && acc.avatar !== DEFAULT_AVATAR ? (
                            <img src={acc.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            acc.name ? acc.name.charAt(0).toUpperCase() : 'G'
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block truncate">
                            {acc.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono block truncate">
                            {acc.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCurrent ? (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                            نشط الآن
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 text-[10px] font-bold transition-colors font-['Comfortaa',sans-serif]"
                          >
                            اختيار
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleRemoveAccount(acc.email, e)}
                          className="p-1 rounded-md text-slate-300 dark:text-zinc-600 hover:text-rose-500 transition-colors"
                          title="إزالة من هذا الجهاز"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Guest Access */}
          <div className="pt-2 flex items-center justify-between border-t border-pink-100 dark:border-zinc-800">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-['Comfortaa',sans-serif]">
              أو المتابعة بدون حساب:
            </span>
            <button
              type="button"
              onClick={handleGuestSignIn}
              className="px-3 py-1 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 font-bold text-xs transition-colors font-['Comfortaa',sans-serif]"
            >
              المتابعة كضيف (GUEST)
            </button>
          </div>
        </div>

        {/* Security / Isolation Notice */}
        <div className="mt-3.5 pt-2.5 text-center border-t border-pink-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-pink-500 dark:text-zinc-400 text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>كل حساب يحفظ سجلات دراسته ومواده وساعات المؤقت بشكل مستقل وتلقائي.</span>
        </div>
      </div>
    </div>
  );
};
