import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { signInWithPopup, signOut, GoogleAuthProvider, onIdTokenChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setCurrentIdToken } from "@/auth/tokenStore";

export type AuthContextType = {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(auth));

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    try {
      const unsub = onIdTokenChanged(
        auth,
        async (user) => {
          if (user) {
            const token = await user.getIdToken();
            setUser(user);
            setIdToken(token);
            setCurrentIdToken(token);
          } else {
            setUser(null);
            setIdToken(null);
            setCurrentIdToken(null);
          }
          setLoading(false);
        },
        (error) => {
          console.warn("Auth state observer error:", error);
          setLoading(false);
        }
      );

      return () => unsub();
    } catch (err) {
      console.warn("Error setting up auth state listener:", err);
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      console.warn("Firebase not configured — sign-in unavailable");
      return;
    }
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const token = await result.user.getIdToken();
      setUser(result.user);
      setIdToken(token);
      setCurrentIdToken(token);
    } catch (err) {
      console.error("Sign-in error:", err);
    }
  };

  const signOutUser = async () => {
    if (!auth) {
      setUser(null);
      setIdToken(null);
      setCurrentIdToken(null);
      return;
    }
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign-out error:", err);
    }
    setUser(null);
    setIdToken(null);
    setCurrentIdToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, idToken, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};