import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { CodePanel } from "./CodePanel";

describe("CodePanel", () => {
  it("renders code text without passing React nodes to a syntax highlighter", () => {
    const markup = renderToStaticMarkup(
      <CodePanel code={"const answer = 42;\nconsole.log(answer);"} language="javascript" highlightedLines={[1]} />
    );

    expect(markup).toContain("const");
    expect(markup).toContain("answer");
    expect(markup).toContain("42");
    expect(markup).toContain("console");
    expect(markup).toContain("log");
  });
});
