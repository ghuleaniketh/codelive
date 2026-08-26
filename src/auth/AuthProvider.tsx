import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { signInWithPopup, signOut, GoogleAuthProvider, onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setCurrentIdToken, getCurrentIdToken } from "@/auth/tokenStore";

export type AuthContextType = {
  user: import("firebase/auth").User | null;
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
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
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
    });

    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const token = await result.user.getIdToken();
    setUser(result.user);
    setIdToken(token);
    setCurrentIdToken(token);
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
    setIdToken(null);
    setCurrentIdToken(null);
  };

  if (loading) return <div>Loading auth...</div>;

  return (
    <AuthContext.Provider value={{ user, idToken, loading: false, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};