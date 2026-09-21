import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Code2, Languages } from "lucide-react";
import {
  PROGRAMMING_LANGUAGES,
  SARVAM_INDIC_LANGUAGES,
  ProgrammingLanguage,
  getProgrammingLanguageOption,
  getSarvamLanguageOption,
} from "@/lib/languageOptions";

export interface ProgrammingLanguageSelectorProps {
  value: ProgrammingLanguage;
  onChange: (val: ProgrammingLanguage) => void;
  disabled?: boolean;
  size?: "sm" | "default";
}

export function ProgrammingLanguageSelector({
  value,
  onChange,
  disabled = false,
  size = "default",
}: ProgrammingLanguageSelectorProps) {
  const current = getProgrammingLanguageOption(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size={size === "sm" ? "sm" : "default"}
          className="group relative flex items-center justify-between gap-2.5 rounded-[6px] border border-white/10 bg-[#14171B]/80 px-3 py-1.5 text-xs font-normal text-[#EDEEF0] backdrop-blur-md transition-all duration-150 hover:bg-[#1B1F24] hover:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20"
          style={{ height: size === "sm" ? 32 : 36, minWidth: 150, boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 2px 8px rgba(0, 0, 0, 0.25)" }}
        >
          <span className="flex items-center gap-2">
            <span className="font-medium">
              {current.label}
            </span>
            <span className="font-mono text-[11px] text-[#8C93A1]">
              {current.badge}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-[#8C93A1] transition-transform duration-150 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-64 rounded-[10px] border border-white/10 bg-[#1B1F24]/95 backdrop-blur-xl p-1.5 shadow-2xl"
      >
        <DropdownMenuLabel className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-[#8C93A1]">
          <Code2 className="h-3.5 w-3.5 text-[#8C93A1]" />
          Programming language
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />

        {PROGRAMMING_LANGUAGES.map((lang) => {
          const isSelected = lang.id === value;
          return (
            <DropdownMenuItem
              key={lang.id}
              onClick={() => onChange(lang.id)}
              className={`flex cursor-pointer items-center justify-between rounded-[6px] px-2.5 py-2 text-xs transition-colors duration-100 ${
                isSelected
                  ? "bg-white/10 text-white font-medium border border-white/15"
                  : "text-[#EDEEF0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{lang.label}</span>
                  <span className="font-mono text-[11px] text-[#8C93A1]">
                    {lang.badge}
                  </span>
                </div>
                <span className="text-[11px] text-[#8C93A1]">
                  {lang.description}
                </span>
              </div>

              {isSelected && (
                <Check className="h-3.5 w-3.5 text-[#00F0FF] shrink-0 ml-2" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface SarvamVoiceLanguageSelectorProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  size?: "sm" | "default";
}

export function SarvamVoiceLanguageSelector({
  value,
  onChange,
  disabled = false,
  size = "default",
}: SarvamVoiceLanguageSelectorProps) {
  const current = getSarvamLanguageOption(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size={size === "sm" ? "sm" : "default"}
          className="group relative flex items-center justify-between gap-2.5 rounded-[6px] border border-white/10 bg-[#14171B]/80 px-3 py-1.5 text-xs font-normal text-[#EDEEF0] backdrop-blur-md transition-all duration-150 hover:bg-[#1B1F24] hover:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20"
          style={{ height: size === "sm" ? 32 : 36, minWidth: 170, boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 2px 8px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-medium">
              {current.nativeLabel}
            </span>
            <span className="text-[11px] text-[#8C93A1]">
              ({current.label})
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[#8C93A1] transition-transform duration-150 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-72 max-h-80 overflow-y-auto rounded-[10px] border border-white/10 bg-[#1B1F24]/95 backdrop-blur-xl p-1.5 shadow-2xl"
      >
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#EDEEF0]">
              <Languages className="h-3.5 w-3.5 text-[#8C93A1]" />
              Sarvam AI voice narration
            </span>
            <span className="font-mono text-[11px] text-[#8C93A1]">
              11 Indic
            </span>
          </div>
          <span className="block text-[11px] text-[#8C93A1] mt-0.5">
            Neural text-to-speech powered by bulbul:v3
          </span>
        </div>
        <DropdownMenuSeparator className="bg-white/5" />

        {SARVAM_INDIC_LANGUAGES.map((lang) => {
          const isSelected = lang.code === value;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => onChange(lang.code)}
              className={`flex cursor-pointer items-center justify-between rounded-[6px] px-2.5 py-2 text-xs transition-colors duration-100 ${
                isSelected
                  ? "bg-white/10 text-white font-medium border border-white/15"
                  : "text-[#EDEEF0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">
                    {lang.nativeLabel}
                  </span>
                  <span className="text-[11px] text-[#8C93A1]">
                    • {lang.label}
                  </span>
                </div>
                <span className="text-[11px] text-[#8C93A1]">
                  {lang.region}
                </span>
              </div>

              {isSelected && (
                <Check className="h-3.5 w-3.5 text-[#00F0FF] shrink-0 ml-2" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
