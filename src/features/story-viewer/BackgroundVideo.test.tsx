import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BackgroundVideo } from "./BackgroundVideo";

describe("BackgroundVideo ambient layer", () => {
  it("renders the video element with ambient properties and scrim overlay", () => {
    const markup = renderToStaticMarkup(
      <BackgroundVideo src="/background.mp4" overlayOpacity={0.35} />
    );

    expect(markup).toContain('data-testid="ambient-background-video"');
    expect(markup).toContain('src="/background.mp4"');
    expect(markup).toContain("loop");
    expect(markup).toContain("muted");
    expect(markup.toLowerCase()).toContain("playsinline");
    expect(markup).toContain("pointer-events:none");
    expect(markup).toContain("opacity:0.35");
  });
});
