import React, { useState } from 'react';
import { 
  LogIn, 
  X, 
  CheckCircle2, 
  User, 
  LogOut, 
  Plus, 
  Trash2, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, SavedAccount } from '../types';
import { sound } from '../utils/audio';
import { storage, DEFAULT_AVATAR, DEFAULT_USER_PROFILE } from '../utils/storage';

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
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const activeEmail = storage.getActiveAccountEmail();
  const isLoggedIn = storage.isLoggedIn();

  React.useEffect(() => {
    if (isOpen) {
      setSavedAccounts(storage.getSavedAccounts());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Direct login with a selected saved account from this device
  const handleSelectAccount = (account: SavedAccount) => {
    sound.playSuccess();
    storage.setActiveAccountEmail(account.email);
    const loadedProfile = storage.getUserProfile();
    const updated: UserProfile = {
      ...loadedProfile,
      name: account.name || loadedProfile.name || account.email.split('@')[0],
      email: account.email,
      loginMethod: 'google',
    };
    storage.saveUserProfile(updated);
    onSaveProfile(updated);
    if (onAccountSwitched) onAccountSwitched(updated);
    onLoginComplete();
    onClose();
  };

  // Add and sign in with a new Google Account
  const handleAddNewGoogleAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    sound.playSuccess();
    setIsSigningIn(true);

    const cleanName = newName.trim() || cleanEmail.split('@')[0];
    const newAcc: SavedAccount = {
      email: cleanEmail,
      name: cleanName,
      avatar: DEFAULT_AVATAR,
      lastLogin: new Date().toISOString(),
    };

    storage.addSavedAccount(newAcc);
    storage.setActiveAccountEmail(cleanEmail);

    const loadedProfile = storage.getUserProfile();
    const updated: UserProfile = {
      ...loadedProfile,
      name: cleanName,
      email: cleanEmail,
      loginMethod: 'google',
    };

    storage.saveUserProfile(updated);
    onSaveProfile(updated);
    if (onAccountSwitched) onAccountSwitched(updated);

    setTimeout(() => {
      setIsSigningIn(false);
      onLoginComplete();
      onClose();
    }, 350);
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
  const handleSignOut = () => {
    sound.playClick();
    storage.setLoggedIn(false);
    storage.setActiveAccountEmail(null);
    const emptyProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      loginMethod: 'guest',
    };
    onSaveProfile(emptyProfile);
    if (onAccountSwitched) onAccountSwitched(emptyProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-pink-200 dark:border-zinc-800 relative overflow-hidden transition-colors max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-zinc-800 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-pink-400 dark:text-pink-300 uppercase tracking-widest block font-['Comfortaa',sans-serif]">
                GOOGLE ACCOUNT CHOOSER
              </span>
              <h2 className="text-base sm:text-lg font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif]">
                SIGN IN (تسجيل الدخول)
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
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 font-bold text-xs">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'G'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block truncate">
                  {userProfile.name || 'Active Account'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block truncate">
                  {activeEmail}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold flex items-center gap-1 hover:bg-rose-200 transition-colors shrink-0"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Saved Accounts on This Device */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 font-['Comfortaa',sans-serif] uppercase tracking-wider flex items-center gap-1.5">
              {/* Google G Icon */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>ACCOUNTS ON THIS DEVICE (الحسابات):</span>
            </span>

            {savedAccounts.length > 0 && !showAddAccount && (
              <button
                type="button"
                onClick={() => setShowAddAccount(true)}
                className="text-[10px] text-pink-600 dark:text-pink-400 font-bold hover:underline flex items-center gap-0.5 font-['Comfortaa',sans-serif]"
              >
                <Plus className="w-3 h-3" />
                <span>Add Account</span>
              </button>
            )}
          </div>

          {/* Account List */}
          {savedAccounts.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {savedAccounts.map((acc) => {
                const isCurrent = activeEmail?.toLowerCase() === acc.email.toLowerCase();
                return (
                  <div
                    key={acc.email}
                    onClick={() => handleSelectAccount(acc)}
                    className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer group ${
                      isCurrent
                        ? 'bg-pink-50/70 dark:bg-zinc-900 border-pink-400 dark:border-pink-500 shadow-xs'
                        : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xs shrink-0 border border-pink-200 dark:border-zinc-700">
                        {acc.name.charAt(0).toUpperCase()}
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
                          ACTIVE
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-2 py-1 rounded-lg bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 text-[10px] font-bold transition-colors font-['Comfortaa',sans-serif]"
                        >
                          Select
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleRemoveAccount(acc.email, e)}
                        className="p-1 rounded-md text-slate-300 dark:text-zinc-600 hover:text-rose-500 transition-colors"
                        title="Remove from device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !showAddAccount && (
              <div className="py-4 px-3 text-center rounded-2xl bg-pink-50/50 dark:bg-zinc-900/40 border border-pink-100 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400">
                No accounts saved on this device yet. Add your Google account below to start.
              </div>
            )
          )}

          {/* Add / Choose Another Google Account Form */}
          {(showAddAccount || savedAccounts.length === 0) && (
            <form onSubmit={handleAddNewGoogleAccount} className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-zinc-900 border border-pink-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-pink-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif] uppercase tracking-wider">
                  ENTER GOOGLE ACCOUNT DETAILS:
                </span>
                {savedAccounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddAccount(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400 block mb-0.5">
                  Google Email (البريد الإلكتروني):
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="your-name@gmail.com"
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400 block mb-0.5">
                  Student Name (اسمك / اختياري):
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Student"
                  className="w-full px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-100 font-bold text-xs shadow-sm border border-slate-300 dark:border-zinc-600 transition-all flex items-center justify-center gap-2 active:scale-95 font-['Comfortaa',sans-serif]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isSigningIn ? 'SAVING ACCOUNT...' : 'SIGN IN & SAVE RECORDS'}</span>
              </button>
            </form>
          )}

          {/* Quick Guest Access */}
          <div className="pt-2 flex items-center justify-between border-t border-pink-100 dark:border-zinc-800">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-['Comfortaa',sans-serif]">
              Or continue without saving an account:
            </span>
            <button
              type="button"
              onClick={handleGuestSignIn}
              className="px-3 py-1 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 font-bold text-xs transition-colors font-['Comfortaa',sans-serif]"
            >
              CONTINUE AS GUEST
            </button>
          </div>
        </div>

        {/* Security / Isolation Notice */}
        <div className="mt-3.5 pt-2.5 text-center border-t border-pink-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-pink-500 dark:text-zinc-400 text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Each account saves its own independent curriculum, goals, and timer records.</span>
        </div>
      </div>
    </div>
  );
};
