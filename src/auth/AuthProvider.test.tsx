import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AuthProvider } from "./AuthProvider";
import { SignInButton } from "./SignInButton";

describe("AuthProvider and SignInButton without Firebase configuration", () => {
  it("renders cleanly to markup without throwing during module load or render", () => {
    const markup = renderToStaticMarkup(
      <AuthProvider>
        <div data-testid="child-content">App Content Ready</div>
        <SignInButton />
      </AuthProvider>
    );

    expect(markup).toContain("App Content Ready");
    expect(markup).toContain("Sign in with Google");
  });
});
