import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ProgrammingLanguageSelector,
  SarvamVoiceLanguageSelector,
} from "./LanguageSelectors";
import {
  PROGRAMMING_LANGUAGES,
  SARVAM_INDIC_LANGUAGES,
} from "@/lib/languageOptions";

describe("LanguageSelectors Component Suite", () => {
  it("ProgrammingLanguageSelector renders current language and badge", () => {
    const markup = renderToStaticMarkup(
      <ProgrammingLanguageSelector
        value="python"
        onChange={() => {}}
      />
    );

    expect(markup).toContain("Python");
    expect(markup).toContain("v3.11");
  });

  it("ProgrammingLanguageSelector supports all target programming languages", () => {
    for (const lang of PROGRAMMING_LANGUAGES) {
      const markup = renderToStaticMarkup(
        <ProgrammingLanguageSelector
          value={lang.id}
          onChange={() => {}}
        />
      );
      expect(markup).toContain(lang.label);
      expect(markup).toContain(lang.badge);
    }
  });

  it("SarvamVoiceLanguageSelector renders Indic native labels and English descriptors", () => {
    const markup = renderToStaticMarkup(
      <SarvamVoiceLanguageSelector
        value="hi-IN"
        onChange={() => {}}
      />
    );

    expect(markup).toContain("हिन्दी");
    expect(markup).toContain("Hindi");
  });

  it("SarvamVoiceLanguageSelector supports all 11 Indic languages", () => {
    expect(SARVAM_INDIC_LANGUAGES.length).toBe(11);
    
    // Verify required Indic languages exist
    const codes = SARVAM_INDIC_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en-IN");
    expect(codes).toContain("hi-IN"); // Hindi
    expect(codes).toContain("bn-IN"); // Bengali
    expect(codes).toContain("ta-IN"); // Tamil
    expect(codes).toContain("te-IN"); // Telugu
    expect(codes).toContain("kn-IN"); // Kannada
    expect(codes).toContain("ml-IN"); // Malayalam
    expect(codes).toContain("mr-IN"); // Marathi
    expect(codes).toContain("gu-IN"); // Gujarati
    expect(codes).toContain("pa-IN"); // Punjabi
    expect(codes).toContain("od-IN"); // Odia
  });
});
