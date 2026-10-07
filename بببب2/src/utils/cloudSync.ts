import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  Firestore
} from 'firebase/firestore';
import { auth } from './firebaseAuth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  BacSubject, 
  MonthData, 
  ScheduleItem, 
  PomodoroStats, 
  AppSettings, 
  UserProfile, 
  WorkspaceItem, 
  TodoItem 
} from '../types';
import { storage } from './storage';

// Initialize Firestore with specific database ID if provided
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(auth.app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(auth.app);

export interface CloudStudyData {
  subjects?: BacSubject[];
  months?: MonthData[];
  schedule?: ScheduleItem[];
  pomodoroStats?: PomodoroStats;
  workspaceItems?: WorkspaceItem[];
  todos?: TodoItem[];
  settings?: AppSettings;
  userProfile?: UserProfile;
  updatedAt?: string;
  subjectsJson?: string;
  monthsJson?: string;
  scheduleJson?: string;
  pomodoroStatsJson?: string;
  workspaceItemsJson?: string;
  todosJson?: string;
  settingsJson?: string;
  userProfileJson?: string;
}

// Deep sanitize helper: removes any undefined properties recursively to prevent Firestore errors
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  return JSON.parse(JSON.stringify(obj, (_, value) => {
    return value === undefined ? null : value;
  }));
}

// Debounce timer for cloud auto-save
let saveTimeout: any = null;

/**
 * Save user study records to Firestore cloud document
 * Uses both direct sanitized fields AND JSON strings for 100% cross-device fidelity
 */
export async function saveUserDataToCloud(
  uid?: string, 
  partialData?: Partial<CloudStudyData>
): Promise<boolean> {
  const currentUser = auth.currentUser;
  const targetUid = uid || currentUser?.uid;

  if (!targetUid) {
    // User is not signed in to Firebase Auth. Data is safely persisted in localStorage.
    return false;
  }

  try {
    const rawSubjects = partialData?.subjects ?? storage.getSubjects();
    const rawMonths = partialData?.months ?? storage.getMonths();
    const rawSchedule = partialData?.schedule ?? storage.getSchedule();
    const rawPomodoro = partialData?.pomodoroStats ?? storage.getPomodoroStats();
    const rawWorkspace = partialData?.workspaceItems ?? storage.getWorkspaceItems();
    const rawTodos = partialData?.todos ?? storage.getTodos();
    const rawSettings = partialData?.settings ?? storage.getSettings();
    const rawProfile = partialData?.userProfile ?? storage.getUserProfile();
    const nowIso = new Date().toISOString();

    // Sanitize every payload piece to eliminate any undefined values
    const cleanSubjects = sanitizeForFirestore(rawSubjects) || [];
    const cleanMonths = sanitizeForFirestore(rawMonths) || [];
    const cleanSchedule = sanitizeForFirestore(rawSchedule) || [];
    const cleanPomodoro = sanitizeForFirestore(rawPomodoro) || {};
    const cleanWorkspace = sanitizeForFirestore(rawWorkspace) || [];
    const cleanTodos = sanitizeForFirestore(rawTodos) || [];
    const cleanSettings = sanitizeForFirestore(rawSettings) || {};
    const cleanProfile = sanitizeForFirestore(rawProfile) || {};

    const payload = {
      userId: targetUid,
      email: cleanProfile.email || currentUser?.email || '',
      name: cleanProfile.name || currentUser?.displayName || 'طالب البكالوريا',
      avatar: cleanProfile.avatar || currentUser?.photoURL || '',
      stream: cleanProfile.stream || '',
      updatedAt: nowIso,

      // Serialized JSON strings - guarantees 100% preservation without Firestore schema conflicts
      subjectsJson: JSON.stringify(cleanSubjects),
      monthsJson: JSON.stringify(cleanMonths),
      scheduleJson: JSON.stringify(cleanSchedule),
      pomodoroStatsJson: JSON.stringify(cleanPomodoro),
      workspaceItemsJson: JSON.stringify(cleanWorkspace),
      todosJson: JSON.stringify(cleanTodos),
      settingsJson: JSON.stringify(cleanSettings),
      userProfileJson: JSON.stringify(cleanProfile),

      // Structured objects for Firestore console visibility
      subjects: cleanSubjects,
      months: cleanMonths,
      schedule: cleanSchedule,
      pomodoroStats: cleanPomodoro,
      workspaceItems: cleanWorkspace,
      todos: cleanTodos,
      settings: cleanSettings,
      userProfile: cleanProfile,
    };

    // 1. Write to main user document /users/{targetUid}
    const userDocRef = doc(db, 'users', targetUid);
    await setDoc(userDocRef, payload, { merge: true });

    // 2. Also write to /users/{targetUid}/data/bac_data for subcollection compatibility
    const dataDocRef = doc(db, 'users', targetUid, 'data', 'bac_data');
    await setDoc(dataDocRef, payload, { merge: true });

    console.log('⚡ Study records synced to Firebase Cloud for UID:', targetUid);
    return true;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      console.warn('Firestore write permission notice: ensure user is authenticated.');
    } else {
      console.warn('Firestore cloud save notice:', error?.message || error);
    }
    return false;
  }
}

/**
 * Trigger immediate debounced cloud save when user edits local data
 * Ultra-fast 250ms debounce ensures instant delivery to other devices
 */
export function queueCloudSave(uid?: string, partialData?: Partial<CloudStudyData>) {
  const currentUid = uid || auth.currentUser?.uid;
  if (!currentUid) return;

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveUserDataToCloud(currentUid, partialData);
  }, 250);
}

/**
 * Load user study records from Firestore cloud document (e.g. on tablet or second device)
 */
export async function loadUserDataFromCloud(uid?: string): Promise<CloudStudyData | null> {
  const targetUid = uid || auth.currentUser?.uid;
  if (!targetUid) {
    return null;
  }

  try {
    // Try primary doc /users/{targetUid} first
    const userDocRef = doc(db, 'users', targetUid);
    let docSnap = await getDoc(userDocRef);

    // If not found, fallback to /users/{targetUid}/data/bac_data
    if (!docSnap.exists()) {
      const dataDocRef = doc(db, 'users', targetUid, 'data', 'bac_data');
      docSnap = await getDoc(dataDocRef);
    }

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('☁️ Retrieved study records from Firebase Cloud for UID:', targetUid);

      let subjects = data.subjects;
      let months = data.months;
      let schedule = data.schedule;
      let pomodoroStats = data.pomodoroStats;
      let workspaceItems = data.workspaceItems;
      let todos = data.todos;
      let settings = data.settings;
      let userProfile = data.userProfile;

      // Unpack JSON strings if present (provides 100% accurate typed objects)
      if (data.subjectsJson) {
        try { subjects = JSON.parse(data.subjectsJson); } catch (e) { console.warn(e); }
      }
      if (data.monthsJson) {
        try { months = JSON.parse(data.monthsJson); } catch (e) { console.warn(e); }
      }
      if (data.scheduleJson) {
        try { schedule = JSON.parse(data.scheduleJson); } catch (e) { console.warn(e); }
      }
      if (data.pomodoroStatsJson) {
        try { pomodoroStats = JSON.parse(data.pomodoroStatsJson); } catch (e) { console.warn(e); }
      }
      if (data.workspaceItemsJson) {
        try { workspaceItems = JSON.parse(data.workspaceItemsJson); } catch (e) { console.warn(e); }
      }
      if (data.todosJson) {
        try { todos = JSON.parse(data.todosJson); } catch (e) { console.warn(e); }
      }
      if (data.settingsJson) {
        try { settings = JSON.parse(data.settingsJson); } catch (e) { console.warn(e); }
      }
      if (data.userProfileJson) {
        try { userProfile = JSON.parse(data.userProfileJson); } catch (e) { console.warn(e); }
      }

      // Hydrate local storage with cloud data
      if (subjects && Array.isArray(subjects) && subjects.length > 0) {
        storage.saveSubjects(subjects);
      }
      if (months && Array.isArray(months) && months.length > 0) {
        storage.saveMonths(months);
      }
      if (schedule && Array.isArray(schedule)) {
        storage.saveSchedule(schedule);
      }
      if (pomodoroStats) {
        storage.savePomodoroStats(pomodoroStats);
      }
      if (workspaceItems && Array.isArray(workspaceItems)) {
        storage.saveWorkspaceItems(workspaceItems);
      }
      if (todos && Array.isArray(todos)) {
        storage.saveTodos(todos);
      }
      if (settings) {
        storage.saveSettings(settings);
      }
      if (userProfile) {
        storage.saveUserProfile(userProfile);
      }

      return {
        subjects,
        months,
        schedule,
        pomodoroStats,
        workspaceItems,
        todos,
        settings,
        userProfile,
        updatedAt: data.updatedAt,
      };
    } else {
      console.log('ℹ️ No existing cloud study records found for UID:', targetUid, '- pushing current state to cloud');
      await saveUserDataToCloud(targetUid);
      return null;
    }
  } catch (error) {
    console.error('Failed to load study data from Firebase Cloud:', error);
    return null;
  }
}

/**
 * Real-time live listener for instant multi-device automatic sync (e.g. tablet <-> PC)
 * Any edit made on Device A reflects automatically on Device B in real-time
 */
export function subscribeToCloudUserData(
  uid: string, 
  onUpdate: (data: CloudStudyData) => void
) {
  const targetUid = uid || auth.currentUser?.uid;
  if (!targetUid || !onUpdate) return () => {};

  const userDocRef = doc(db, 'users', targetUid);
  return onSnapshot(userDocRef, (docSnap) => {
    // Ignore writes in flight on the same device so user typing/clicking doesn't stutter
    if (docSnap.metadata.hasPendingWrites) {
      return;
    }

    if (docSnap.exists()) {
      const data = docSnap.data();
      let subjects = data.subjects;
      let months = data.months;
      let schedule = data.schedule;
      let pomodoroStats = data.pomodoroStats;
      let workspaceItems = data.workspaceItems;
      let todos = data.todos;
      let settings = data.settings;
      let userProfile = data.userProfile;

      if (data.subjectsJson) {
        try { subjects = JSON.parse(data.subjectsJson); } catch (e) {}
      }
      if (data.monthsJson) {
        try { months = JSON.parse(data.monthsJson); } catch (e) {}
      }
      if (data.scheduleJson) {
        try { schedule = JSON.parse(data.scheduleJson); } catch (e) {}
      }
      if (data.pomodoroStatsJson) {
        try { pomodoroStats = JSON.parse(data.pomodoroStatsJson); } catch (e) {}
      }
      if (data.workspaceItemsJson) {
        try { workspaceItems = JSON.parse(data.workspaceItemsJson); } catch (e) {}
      }
      if (data.todosJson) {
        try { todos = JSON.parse(data.todosJson); } catch (e) {}
      }
      if (data.settingsJson) {
        try { settings = JSON.parse(data.settingsJson); } catch (e) {}
      }
      if (data.userProfileJson) {
        try { userProfile = JSON.parse(data.userProfileJson); } catch (e) {}
      }

      console.log('🔄 Automatic cross-device sync received from another device!');

      // Update local storage so cache is immediately in sync
      if (subjects && Array.isArray(subjects) && subjects.length > 0) {
        storage.saveSubjects(subjects);
      }
      if (months && Array.isArray(months) && months.length > 0) {
        storage.saveMonths(months);
      }
      if (schedule && Array.isArray(schedule)) {
        storage.saveSchedule(schedule);
      }
      if (pomodoroStats) {
        storage.savePomodoroStats(pomodoroStats);
      }
      if (workspaceItems && Array.isArray(workspaceItems)) {
        storage.saveWorkspaceItems(workspaceItems);
        try { window.dispatchEvent(new Event('bac_workspace_updated')); } catch {}
      }
      if (todos && Array.isArray(todos)) {
        storage.saveTodos(todos);
      }
      if (settings) {
        storage.saveSettings(settings);
      }
      if (userProfile) {
        storage.saveUserProfile(userProfile);
      }

      onUpdate({
        subjects,
        months,
        schedule,
        pomodoroStats,
        workspaceItems,
        todos,
        settings,
        userProfile,
        updatedAt: data.updatedAt,
      });
    }
  }, (err) => {
    console.warn('Firestore real-time subscription notice:', err.message);
  });
}
