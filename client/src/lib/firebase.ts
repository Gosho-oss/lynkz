// Firebase configuration and authentication - using firebase_barebones_javascript blueprint
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithRedirect, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

// Sign in with Google using popup (more reliable than redirect)
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Create account with email and password
export async function createAccountWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Sign out
export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Get current user's ID token for API authentication
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

// Handle redirect result (call on app load)
export async function handleRedirectResult(): Promise<FirebaseUser | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Redirect result error:", error);
    return null;
  }
}

// Subscribe to auth state changes
export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export type { FirebaseUser };
