import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AssetLoader } from "./AssetLoader";

describe("AssetLoader", () => {
  it("renders children alongside the minimal loader overlay", () => {
    const markup = renderToStaticMarkup(
      <AssetLoader>
        <div data-testid="test-app-content">Main App Content</div>
      </AssetLoader>
    );

    expect(markup).toContain("Main App Content");
    expect(markup).toContain("Loading assets...");
    expect(markup).toContain('data-testid="asset-loader-overlay"');
  });
});
