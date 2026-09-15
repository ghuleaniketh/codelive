import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export interface UseStepAudioOptions {
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
  error: unknown;
  toggleMute: () => void;
  unblockAudio: () => void;
  replay: () => void;
}

export function resolveAudioUrl(url?: string): string | undefined {
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track the step and URL of the audio currently loaded to prevent duplicate/spam playback
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

  // Call tRPC query for audio generation
  const {
    data: audioData,
    isLoading: isGenerating,
    error,
  } = trpc.audio.generate.useQuery(
    {
      text: trimmedNarration,
      language,
    },
    {
      enabled: enabled && trimmedNarration.length > 0,
      staleTime: Infinity,
      gcTime: Infinity,
      retry: 1,
    }
  );

  const audioUrl = resolveAudioUrl(audioData?.url);

  // Clear timers helper
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

  // Stop any active audio immediately
  const stopAudio = useCallback(() => {
    clearAllTimers();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsAudioPlaying(false);
  }, [clearAllTimers]);

  // Main Audio setup and synchronization effect
  useEffect(() => {
    // If audio is actively generating, wait for network resolution without triggering timeout skips
    if (isGenerating && trimmedNarration.length > 0) {
      return;
    }

    // Check if this exact step and URL are already loaded and playing/ready
    const isSameStepAndUrl =
      lastLoadedStepRef.current === currentStepIndex &&
      lastLoadedUrlRef.current === (audioUrl || null);

    if (isSameStepAndUrl) {
      return;
    }

    // New step or new audio URL arrived: stop previous audio and update refs
    stopAudio();
    setIsAudioReady(false);
    lastLoadedStepRef.current = currentStepIndex;
    lastLoadedUrlRef.current = audioUrl || null;

    if (!enabled || isMuted || !audioUrl) {
      // If no narration or muted, and in autoplay mode, advance after stepIntervalMs
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

    // Create or reuse Audio instance
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.playbackRate = speedRef.current;

    const handleCanPlay = () => {
      setIsAudioReady(true);
    };

    const handlePlay = () => {
      setIsAudioPlaying(true);
      setIsAutoplayBlocked(false);
    };

    const handlePause = () => {
      setIsAudioPlaying(false);
    };

    const handleEnded = () => {
      setIsAudioPlaying(false);
      // If autoplay is active, advance after a small natural pause
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
      console.warn("[useStepAudio] Audio playback error:", e);
      setIsAudioPlaying(false);
      if (isPlayingRef.current) {
        fallbackTimerRef.current = setTimeout(() => {
          if (isPlayingRef.current) {
            onAdvanceRef.current?.();
          }
        }, stepIntervalMs);
      }
    };

    audio.addEventListener("canplaythrough", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Play audio immediately (both in autoplay and manual step landing unless muted)
    if (!isMutedRef.current) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("AUDIO PLAY FAILED:", err.name, err.message);
          if (err.name === "NotAllowedError") {
            setIsAutoplayBlocked(true);
          }
        });
      }
    }

    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
      clearAllTimers();
    };
  }, [
    audioUrl,
    currentStepIndex,
    enabled,
    isMuted,
    isGenerating,
    trimmedNarration.length,
    stepIntervalMs,
    stopAudio,
    clearAllTimers,
  ]);

  // Handle Play / Pause state toggles while on the same step
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl || isMuted) return;

    if (isPlaying) {
      if (audio.paused && !audio.ended && audio.currentTime < audio.duration) {
        audio.play().catch((err) => {
          console.error("AUDIO PLAY FAILED:", err.name, err.message);
          if (err.name === "NotAllowedError") {
            setIsAutoplayBlocked(true);
          }
        });
      }
    } else {
      clearAllTimers();
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [isPlaying, isMuted, audioUrl, clearAllTimers]);

  // Update playback speed dynamically on current audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const unblockAudio = useCallback(() => {
    setIsAutoplayBlocked(false);
    if (audioRef.current && audioUrl && !isMuted) {
      audioRef.current.play().catch((err) => {
        console.error("AUDIO PLAY FAILED:", err.name, err.message);
      });
    }
  }, [audioUrl, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (nextMuted) {
        audioRef.current?.pause();
      } else if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.error("AUDIO PLAY FAILED:", err.name, err.message);
          if (err.name === "NotAllowedError") {
            setIsAutoplayBlocked(true);
          }
        });
      }
      return nextMuted;
    });
  }, []);

  const replay = useCallback(() => {
    if (audioRef.current && audioUrl && !isMuted) {
      clearAllTimers();
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = speedRef.current;
      audioRef.current.play().catch((err) => {
        console.error("AUDIO PLAY FAILED:", err.name, err.message);
        if (err.name === "NotAllowedError") {
          setIsAutoplayBlocked(true);
        }
      });
    }
  }, [audioUrl, isMuted, clearAllTimers]);

  return {
    audioUrl,
    isLoading: isGenerating,
    isAudioPlaying,
    isAudioReady,
    isMuted,
    isAutoplayBlocked,
    error,
    toggleMute,
    unblockAudio,
    replay,
  };
}
