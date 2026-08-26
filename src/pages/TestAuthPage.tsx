import { trpc } from "@/lib/trpc";
import { useAuth } from "@/auth/useAuth";
import { SignInButton } from "@/auth/SignInButton";

export default function TestAuthPage() {
  const { user, idToken } = useAuth();

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <SignInButton />

      {user && idToken ? (
        <div style={{ marginTop: "2rem" }}>
          <h3>Authenticated as {user.displayName || user.email}</h3>
          <pre
            style={{
              fontFamily: "monospace",
              fontSize: "12px",
              background: "#f3f4f6",
              padding: "1rem",
              borderRadius: "4px",
            }}
          >
            <code>User ID:</code> {user.uid}
            <br />
            <code>Email:</code> {user.email}
            <br />
            <code>Display Name:</code> {user.displayName}
          </pre>
        </div>
      ) : (
        <p style={{ marginTop: "2rem" }}>Sign in with Google to see user data.</p>
      )}
    </div>
  );
}