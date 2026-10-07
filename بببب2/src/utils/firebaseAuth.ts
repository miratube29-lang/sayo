import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse or initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with Account Chooser prompt
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
// prompt: 'select_account' forces the official Google Account Chooser screen (accounts.google.com/v3/signin/accountchooser)
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Cache access token in memory as required by workspace-integration guidelines
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Check redirect result on app boot (for tablet/mobile browsers that redirect instead of popup)
getRedirectResult(auth)
  .then((result) => {
    if (result?.user) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      cachedAccessToken = credential?.accessToken || null;
      console.log('✅ Google redirect login successful:', result.user.email);
    }
  })
  .catch((err) => {
    if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
      console.info('Redirect check info:', err?.message || err);
    }
  });

export const googleSignIn = async (): Promise<{ user: User; accessToken?: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return {
      user: result.user,
      accessToken: cachedAccessToken || undefined,
    };
  } catch (error: any) {
    // If popups are blocked on tablet / mobile devices, fallback directly to Google redirect
    if (error?.code === 'auth/popup-blocked') {
      console.info('Tablet browser blocked popup window, redirecting directly to Google Account Chooser...');
      await signInWithRedirect(auth, googleProvider);
      return new Promise(() => {}); // Wait for redirect to proceed
    }

    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      console.info('Google Sign-In popup was closed or cancelled by the user.');
    } else {
      console.warn('Google Sign-In notice:', error?.message || error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  cachedAccessToken = null;
  await fbSignOut(auth);
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const onAuthUserChange = (
  callback: (user: User | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      callback(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      callback(null, null);
    }
  });
};
