import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { 
  auth, 
  signInWithGoogle, 
  signInWithEmail, 
  createAccountWithEmail, 
  logOut, 
  getIdToken,
  subscribeToAuthChanges,
  handleRedirectResult,
  type FirebaseUser 
} from "@/lib/firebase";
import { apiRequest, setAuthToken } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create user in database
  const syncUserWithDatabase = async (fbUser: FirebaseUser) => {
    try {
      const token = await fbUser.getIdToken();
      setAuthToken(token);
      
      // Try to get existing user
      const response = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 404) {
        // User doesn't exist, will need to complete registration
        setUser(null);
      } else if (response.status === 401) {
        // Unauthorized - token issue, but still keep Firebase user logged in
        console.error("Token rejected by server, user needs to register");
        setUser(null);
      }
    } catch (error) {
      console.error("Error syncing user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Handle redirect result on mount
    handleRedirectResult().then((user) => {
      if (user) {
        syncUserWithDatabase(user);
      }
    });

    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncUserWithDatabase(fbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      await syncUserWithDatabase(fbUser);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const fbUser = await signInWithEmail(email, password);
      await syncUserWithDatabase(fbUser);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      const fbUser = await createAccountWithEmail(email, password);
      const token = await fbUser.getIdToken();
      
      // Create user in database
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          firebaseUid: fbUser.uid,
          email: fbUser.email,
          username,
          displayName: fbUser.displayName || username,
        }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logOut();
    setAuthToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await syncUserWithDatabase(firebaseUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        loading,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        signOut: handleSignOut,
        getToken: getIdToken,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
