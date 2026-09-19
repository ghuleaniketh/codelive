import { useEffect, useRef, useState, useCallback } from "react";

export interface UseStepAudioOptions {
  audioUrl?: string; // Pre-generated audio URL from story generation
  narrationText?: string;
  language?: string;
  playbackSpeed?: number;
  isPlaying?: boolean; // Autoplay active
  isCompleted?: boolean;
  currentStepIndex: number;
  stepIntervalMs?: number;
  onAdvance?: () => void;
  enabled?: boolean;
}

export interface UseStepAudioResult {
  audioUrl?: string;
  isLoading: boolean;
  isAudioPlaying: boolean;
  isAudioReady: boolean;
  isMuted: boolean;
  isAutoplayBlocked: boolean;
  isUsingSpeechFallback: boolean;
  error: unknown;
  toggleMute: () => void;
  unblockAudio: () => void;
  replay: () => void;
}

export function resolveAudioUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }
  const apiBase = (import.meta.env.VITE_API_URL || "/api/trpc").replace(/\/trpc\/?$/, "");
  if (apiBase.startsWith("http")) {
    return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
  }
  return url;
}

export function useStepAudio({
  audioUrl: directAudioUrl,
  narrationText,
  language = "en-IN",
  playbackSpeed = 1,
  isPlaying = false,
  isCompleted = false,
  currentStepIndex,
  stepIntervalMs = 1200,
  onAdvance,
  enabled = true,
}: UseStepAudioOptions): UseStepAudioResult {
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const [isUsingSpeechFallback, setIsUsingSpeechFallback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Track the step and URL of the audio currently loaded
  const lastLoadedStepRef = useRef<number | null>(null);
  const lastLoadedUrlRef = useRef<string | null>(null);

  // Keep latest values in refs for event handlers to avoid stale closures
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const isCompletedRef = useRef(isCompleted);
  isCompletedRef.current = isCompleted;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const speedRef = useRef(playbackSpeed);
  speedRef.current = playbackSpeed;

  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  const trimmedNarration = (narrationText || "").trim();
  // Read pre-generated audioUrl directly from the step data — NO lazy tRPC audio generation query
  const audioUrl = resolveAudioUrl(directAudioUrl);

  // Cancel any active Web Speech synthesis
  const cancelSpeechSynthesis = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn("[useStepAudio] SpeechSynthesis cancel error:", err);
      }
    }
  }, []);

  // Clear all pending transition timers
  const clearAllTimers = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  // Stop any active audio and speech synthesis immediately
  const stopAudio = useCallback(() => {
    clearAllTimers();
    cancelSpeechSynthesis();
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
    setIsAudioPlaying(false);
  }, [clearAllTimers, cancelSpeechSynthesis]);

  // Fallback speech synthesis player (only used if step has no audioUrl or offline error)
  const speakWithSpeechSynthesis = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !trimmedNarration ||
      isMutedRef.current
    ) {
      return;
    }

    cancelSpeechSynthesis();

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(trimmedNarration);
      utterance.rate = Math.max(0.7, Math.min(1.8, speedRef.current));

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langPrefix = (language || "en").split("-")[0].toLowerCase();
        const matchedVoice =
          voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
          voices.find((v) => v.lang.toLowerCase().startsWith("en")) ||
          voices[0];
        if (matchedVoice) {
          utterance.voice = matchedVoice;
          utterance.lang = matchedVoice.lang;
        } else {
          utterance.lang = language || "en-IN";
        }
      } else {
        utterance.lang = language || "en-IN";
      }

      utterance.onstart = () => {
        setIsAudioPlaying(true);
        setIsAutoplayBlocked(false);
        setIsUsingSpeechFallback(true);
      };

      utterance.onend = () => {
        setIsAudioPlaying(false);
        if (isPlayingRef.current) {
          const pauseDelay = Math.max(250, 400 / speedRef.current);
          advanceTimerRef.current = setTimeout(() => {
            if (isPlayingRef.current) {
              onAdvanceRef.current?.();
            }
          }, pauseDelay);
        }
      };

      utterance.onerror = (e) => {
        console.warn("[useStepAudio] SpeechSynthesis error:", e);
        setIsAudioPlaying(false);
        if (isPlayingRef.current && !isCompletedRef.current) {
          fallbackTimerRef.current = setTimeout(() => {
            if (isPlayingRef.current) {
              onAdvanceRef.current?.();
            }
          }, stepIntervalMs);
        }
      };

      window.speechSynthesis.speak(utterance);
      setIsAudioReady(true);
      setIsUsingSpeechFallback(true);
    } catch (err) {
      console.warn("[useStepAudio] SpeechSynthesis speak failed:", err);
    }
  }, [trimmedNarration, language, cancelSpeechSynthesis, stepIntervalMs]);

  // Main Audio setup and synchronization effect
  useEffect(() => {
    const currentUrlKey = audioUrl || null;
    const isSameStepAndUrl =
      lastLoadedStepRef.current === currentStepIndex &&
      lastLoadedUrlRef.current === currentUrlKey;

    if (isSameStepAndUrl) {
      return;
    }

    // New step or new audio URL arrived: stop previous audio/speech and update refs
    stopAudio();
    setIsAudioReady(false);
    setIsUsingSpeechFallback(false);
    lastLoadedStepRef.current = currentStepIndex;
    lastLoadedUrlRef.current = currentUrlKey;

    if (!enabled || isMuted) {
      if (isPlayingRef.current && !isCompletedRef.current) {
        fallbackTimerRef.current = setTimeout(() => {
          if (isPlayingRef.current) {
            onAdvanceRef.current?.();
          }
        }, stepIntervalMs);
      }
      return () => {
        clearAllTimers();
      };
    }

    // Case 1: Pre-generated Audio URL is available (from Sarvam AI backend upfront)
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.playbackRate = speedRef.current;

      const handleCanPlay = () => {
        setIsAudioReady(true);
      };

      const handlePlay = () => {
        setIsAudioPlaying(true);
        setIsAutoplayBlocked(false);
        setIsUsingSpeechFallback(false);
      };

      const handlePause = () => {
        setIsAudioPlaying(false);
      };

      const handleEnded = () => {
        setIsAudioPlaying(false);
        if (isPlayingRef.current) {
          const pauseDelay = Math.max(250, 400 / speedRef.current);
          advanceTimerRef.current = setTimeout(() => {
            if (isPlayingRef.current) {
              onAdvanceRef.current?.();
            }
          }, pauseDelay);
        }
      };

      const handleError = (e: Event) => {
        console.warn("[useStepAudio] Pre-generated audio playback error, falling back to SpeechSynthesis:", e);
        setIsAudioPlaying(false);
        if (isPlayingRef.current) {
          speakWithSpeechSynthesis();
        }
      };

      audio.addEventListener("canplaythrough", handleCanPlay);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      // Play only if active or explicitly running
      if (isPlayingRef.current && !isMutedRef.current) {
        const promise = audio.play();
        if (promise !== undefined) {
          playPromiseRef.current = promise;
          promise
            .then(() => {
              playPromiseRef.current = null;
            })
            .catch((err) => {
              playPromiseRef.current = null;
              if (err.name === "AbortError") {
                return; // Normal cancellation during step switch
              }
              console.warn("[useStepAudio] audio.play() blocked or failed:", err.name, err.message);
              if (err.name === "NotAllowedError") {
                setIsAutoplayBlocked(true);
                if (isPlayingRef.current && !isCompletedRef.current) {
                  fallbackTimerRef.current = setTimeout(() => {
                    if (isPlayingRef.current) {
                      onAdvanceRef.current?.();
                    }
                  }, stepIntervalMs);
                }
              } else {
                speakWithSpeechSynthesis();
              }
            });
        }
      } else {
        // Pre-load metadata so audio duration is ready when user clicks Play
        audio.load();
      }

      return () => {
        audio.removeEventListener("canplaythrough", handleCanPlay);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              try {
                audio.pause();
              } catch {}
            })
            .catch(() => {});
        } else {
          try {
            audio.pause();
          } catch {}
        }
        clearAllTimers();
        cancelSpeechSynthesis();
      };
    }

    // Case 2: No Audio URL (offline/fallback) -> Fall back to Web Speech API
    if (trimmedNarration.length > 0 && isPlayingRef.current && !isMutedRef.current) {
      speakWithSpeechSynthesis();
    } else if (isPlayingRef.current && !isCompletedRef.current) {
      fallbackTimerRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          onAdvanceRef.current?.();
        }
      }, stepIntervalMs);
    }

    return () => {
      clearAllTimers();
      cancelSpeechSynthesis();
    };
  }, [
    audioUrl,
    currentStepIndex,
    enabled,
    isMuted,
    trimmedNarration,
    stepIntervalMs,
    stopAudio,
    speakWithSpeechSynthesis,
    clearAllTimers,
    cancelSpeechSynthesis,
  ]);

  // Handle Play / Pause state toggles while on the same step
  useEffect(() => {
    if (isMuted) {
      stopAudio();
      return;
    }

    if (isPlaying) {
      setIsAutoplayBlocked(false);
      const audio = audioRef.current;
      if (audio && audioUrl) {
        if (audio.ended || (audio.duration && audio.currentTime >= audio.duration)) {
          audio.currentTime = 0;
        }
        audio.playbackRate = speedRef.current;
        const promise = audio.play();
        if (promise !== undefined) {
          playPromiseRef.current = promise;
          promise
            .then(() => {
              playPromiseRef.current = null;
            })
            .catch((err) => {
              playPromiseRef.current = null;
              if (err.name === "AbortError") return;
              console.warn("[useStepAudio] Play failed:", err.name, err.message);
              if (err.name === "NotAllowedError") {
                setIsAutoplayBlocked(true);
              } else {
                speakWithSpeechSynthesis();
              }
            });
        }
      } else if (trimmedNarration) {
        speakWithSpeechSynthesis();
      }
    } else {
      clearAllTimers();
      if (audioRef.current) {
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              try {
                audioRef.current?.pause();
              } catch {}
            })
            .catch(() => {});
        } else {
          try {
            audioRef.current.pause();
          } catch {}
        }
      }
      cancelSpeechSynthesis();
      setIsAudioPlaying(false);
    }
  }, [
    isPlaying,
    isMuted,
    audioUrl,
    trimmedNarration,
    speakWithSpeechSynthesis,
    stopAudio,
    clearAllTimers,
    cancelSpeechSynthesis,
  ]);

  // Update playback speed dynamically
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const unblockAudio = useCallback(() => {
    setIsAutoplayBlocked(false);
    if (audioRef.current && audioUrl && !isMutedRef.current) {
      const audio = audioRef.current;
      if (audio.ended || (audio.duration && audio.currentTime >= audio.duration)) {
        audio.currentTime = 0;
      }
      audio.playbackRate = speedRef.current;
      audio.play().catch(() => {
        speakWithSpeechSynthesis();
      });
    } else if (trimmedNarration && !isMutedRef.current) {
      speakWithSpeechSynthesis();
    }
  }, [audioUrl, trimmedNarration, speakWithSpeechSynthesis]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (nextMuted) {
        if (audioRef.current) {
          try {
            audioRef.current.pause();
          } catch {}
        }
        cancelSpeechSynthesis();
        setIsAudioPlaying(false);
      } else {
        if (audioRef.current && audioUrl) {
          audioRef.current.play().catch(() => {
            speakWithSpeechSynthesis();
          });
        } else if (trimmedNarration) {
          speakWithSpeechSynthesis();
        }
      }
      return nextMuted;
    });
  }, [audioUrl, trimmedNarration, speakWithSpeechSynthesis, cancelSpeechSynthesis]);

  const replay = useCallback(() => {
    clearAllTimers();
    setIsAutoplayBlocked(false);
    if (audioRef.current && audioUrl && !isMutedRef.current) {
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.playbackRate = speedRef.current;
      audio.play().catch(() => {
        speakWithSpeechSynthesis();
      });
    } else if (trimmedNarration && !isMutedRef.current) {
      speakWithSpeechSynthesis();
    }
  }, [audioUrl, trimmedNarration, speakWithSpeechSynthesis, clearAllTimers]);

  return {
    audioUrl,
    isLoading: false, // Pre-generated upfront, never loads per step
    isAudioPlaying,
    isAudioReady,
    isMuted,
    isAutoplayBlocked,
    isUsingSpeechFallback,
    error: null,
    toggleMute,
    unblockAudio,
    replay,
  };
}
