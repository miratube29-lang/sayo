import React, { useState } from 'react';
import { 
  Edit3, 
  FolderUp, 
  X, 
  User 
} from 'lucide-react';
import { UserProfile } from '../types';
import { sound } from '../utils/audio';
import { readFileAsDataUrl } from '../utils/helpers';

export const BAC_STREAMS = [
  'علوم تجريبية (Experimental Sciences)',
  'رياضيات (Mathematics)',
  'تقني رياضي (Mathematical Technology)',
  'تسيير واقتصاد (Management & Economics)',
  'آداب وفلسفة (Literature & Philosophy)',
  'لغات أجنبية (Foreign Languages)',
];

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(userProfile.name);
  const [editStream, setEditStream] = useState(userProfile.stream);
  const [editMotto, setEditMotto] = useState(userProfile.motto);

  // Handle PC upload for avatar
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playClick();
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onUpdateProfile({
          ...userProfile,
          avatar: dataUrl,
        });
      } catch (err) {
        console.error('Failed to read avatar', err);
      }
    }
  };

  // Handle PC upload for banner
  const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playClick();
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onUpdateProfile({
          ...userProfile,
          banner: dataUrl,
        });
      } catch (err) {
        console.error('Failed to read banner', err);
      }
    }
  };

  // Save profile edits
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();

    const updated: UserProfile = {
      ...userProfile,
      name: editName.trim(),
      stream: editStream,
      motto: editMotto.trim(),
    };

    onUpdateProfile(updated);
    setIsEditing(false);
  };

  const displayName = userProfile.name.trim();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Banner & Avatar Section */}
      <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl overflow-hidden border border-pink-200 dark:border-zinc-800 shadow-sm relative transition-colors">
        {/* Banner Image Container */}
        <div className="w-full h-44 sm:h-52 relative bg-pink-100 dark:bg-zinc-800 overflow-hidden group">
          <img 
            src={userProfile.banner} 
            alt="Profile Banner" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 via-transparent to-black/10" />
          
          {/* Change Banner Button */}
          <label className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 text-xs font-bold shadow-xs backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer font-['Comfortaa',sans-serif]">
            <FolderUp className="w-3.5 h-3.5 text-pink-500" />
            <span>CHANGE BANNER</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Profile Info Bar */}
        <div className="px-5 sm:px-8 pb-5 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="relative group w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-md bg-pink-50 dark:bg-zinc-800 ring-2 ring-pink-300 dark:ring-zinc-700 shrink-0">
              <img 
                src={userProfile.avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold cursor-pointer font-['Comfortaa',sans-serif]">
                <FolderUp className="w-4 h-4 mb-0.5 text-pink-200" />
                <span>UPLOAD</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-pink-700 dark:text-pink-300 font-['Fredoka',sans-serif]">
                {displayName || 'Student Profile'}
              </h1>
              <p className="text-xs text-pink-500 dark:text-pink-400 font-semibold font-['Comfortaa',sans-serif]">
                {userProfile.stream || 'No stream selected'}
              </p>
            </div>
          </div>

          {/* Edit Profile Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              setEditName(userProfile.name);
              setEditStream(userProfile.stream);
              setEditMotto(userProfile.motto);
              setIsEditing(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5 font-['Comfortaa',sans-serif] shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT PROFILE</span>
          </button>
        </div>
      </div>

      {/* Aesthetic Profile ID Card */}
      <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-5 border border-pink-200 dark:border-zinc-800 shadow-xs space-y-4 transition-colors">
        <div className="border-b border-pink-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif] flex items-center gap-2">
            <User className="w-4 h-4 text-pink-500" />
            STUDENT CARD
          </h2>
          <span className="text-xs text-pink-400 dark:text-zinc-400 font-mono font-['Comfortaa',sans-serif]">
            {displayName ? displayName.toUpperCase() : 'EMPTY'}
          </span>
        </div>

        {/* Profile Attributes */}
        <div className="space-y-3">
          {/* Name */}
          <div className="p-3.5 rounded-xl bg-pink-50/60 dark:bg-zinc-900 border border-pink-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif] uppercase tracking-wider">
              NAME:
            </span>
            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
              {displayName || 'Click "EDIT PROFILE" to set your name'}
            </span>
          </div>

          {/* Stream */}
          <div className="p-3.5 rounded-xl bg-pink-50/60 dark:bg-zinc-900 border border-pink-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif] uppercase tracking-wider">
              BAC STREAM (الشعبة):
            </span>
            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
              {userProfile.stream || 'Not specified'}
            </span>
          </div>

          {/* Bio / Motto */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50/50 dark:from-zinc-900 dark:to-zinc-900 border border-pink-200 dark:border-zinc-800 space-y-1.5">
            <span className="text-xs font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif] uppercase tracking-wider block">
              STUDY BIO & MOTTO (البايو والشعار):
            </span>
            <p className="text-xs sm:text-sm font-medium text-pink-900 dark:text-zinc-200 leading-relaxed">
              {userProfile.motto ? `"${userProfile.motto}"` : 'No bio entered yet. Click "EDIT PROFILE" to add your bio.'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl p-5 sm:p-6 shadow-xl border border-pink-200 dark:border-zinc-800 relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between pb-2.5 border-b border-pink-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif]">
                EDIT PROFILE
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 flex items-center justify-center text-pink-600 dark:text-zinc-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-3.5 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-pink-700 dark:text-pink-300 block mb-1 font-['Comfortaa',sans-serif] uppercase tracking-wider">
                  NAME:
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-zinc-700 focus:border-pink-400 focus:outline-none bg-pink-50/40 dark:bg-zinc-900 text-xs font-medium text-slate-800 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-pink-700 dark:text-pink-300 block mb-1 font-['Comfortaa',sans-serif] uppercase tracking-wider">
                  BAC STREAM (الشعبة):
                </label>
                <select
                  value={editStream}
                  onChange={(e) => setEditStream(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-zinc-700 focus:border-pink-400 focus:outline-none bg-pink-50/40 dark:bg-zinc-900 text-xs font-medium text-slate-800 dark:text-zinc-100"
                >
                  {BAC_STREAMS.map((s) => (
                    <option key={s} value={s} className="dark:bg-zinc-900">{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-pink-700 dark:text-pink-300 block mb-1 font-['Comfortaa',sans-serif] uppercase tracking-wider">
                  BIO & MOTTO (البايو والشعار):
                </label>
                <textarea
                  rows={2}
                  value={editMotto}
                  onChange={(e) => setEditMotto(e.target.value)}
                  placeholder="Write your study bio or motto..."
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-zinc-700 focus:border-pink-400 focus:outline-none bg-pink-50/40 dark:bg-zinc-900 text-xs font-medium text-slate-800 dark:text-zinc-100 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95 font-['Comfortaa',sans-serif]"
                >
                  SAVE PROFILE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
