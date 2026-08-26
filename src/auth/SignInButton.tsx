import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function SignInButton() {
  const { user, idToken, signInWithGoogle, signOutUser } = useAuth();

  useEffect(() => {
    if (user && idToken) {
      const body = document.body;
      const existing = document.getElementById("google-signin-button");
      if (existing) existing.remove();
    }
  }, [user, idToken]);

  if (!user) {
    return (
      <Button onClick={signInWithGoogle} className="mr-2">
        Sign in with Google
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={signOutUser}
      >
        Sign out
      </Button>
      <span>
        {user.displayName || user.email}
      </span>
    </div>
  );
}