import { useEffect, useState, type ReactNode } from "react";

export interface AssetLoaderProps {
  children?: ReactNode;
}

// Critical assets that must be fully decoded before revealing the page
const CRITICAL_IMAGES = ["/ntlap.png"];

export function AssetLoader({ children }: AssetLoaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("Loading assets...");

  useEffect(() => {
    let isMounted = true;
    let completedTasks = 0;
    const totalTasks = 4; // 1: Fonts, 2: Critical Images, 3: Video/Media, 4: Document Ready

    const updateProgress = (completed: number, message?: string) => {
      if (!isMounted) return;
      const pct = Math.min(100, Math.round((completed / totalTasks) * 90) + 10);
      setProgress(pct);
      if (message) setStatusText(message);
    };

    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!src) {
          resolve();
          return;
        }
        const img = new Image();
        img.src = src;
        if (img.complete) {
          if ("decode" in img && typeof img.decode === "function") {
            img.decode().then(() => resolve()).catch(() => resolve());
          } else {
            resolve();
          }
          return;
        }
        img.onload = () => {
          if ("decode" in img && typeof img.decode === "function") {
            img.decode().then(() => resolve()).catch(() => resolve());
          } else {
            resolve();
          }
        };
        img.onerror = () => resolve(); // Do not block UI forever on error
      });
    };

    const preloadFonts = async () => {
      if (
        typeof document !== "undefined" &&
        document.fonts &&
        typeof document.fonts.ready?.then === "function"
      ) {
        try {
          await document.fonts.ready;
        } catch {
          // Ignore font loading errors gracefully
        }
      }
    };

    const preloadVideoOrMedia = async () => {
      if (typeof document === "undefined") return;
      const videos = Array.from(document.querySelectorAll("video"));
      if (videos.length === 0) return;

      const videoPromises = videos.map((video) => {
        return new Promise<void>((resolve) => {
          if (video.readyState >= 2) {
            resolve();
            return;
          }
          const onCanPlay = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            resolve();
          };
          const cleanup = () => {
            video.removeEventListener("loadeddata", onCanPlay);
            video.removeEventListener("canplay", onCanPlay);
            video.removeEventListener("error", onError);
          };
          video.addEventListener("loadeddata", onCanPlay);
          video.addEventListener("canplay", onCanPlay);
          video.addEventListener("error", onError);

          // Video timeout fallback (max 2.5s)
          setTimeout(() => {
            cleanup();
            resolve();
          }, 2500);
        });
      });

      await Promise.all(videoPromises);
    };

    const waitForDoc = async () => {
      if (typeof document !== "undefined" && document.readyState !== "complete") {
        await new Promise<void>((resolve) => {
          const onWindowLoad = () => {
            window.removeEventListener("load", onWindowLoad);
            resolve();
          };
          window.addEventListener("load", onWindowLoad);
        });
      }
    };

    const loadAllAssets = async () => {
      const startTime = Date.now();

      // Task 1: Preload Fonts
      await preloadFonts();
      completedTasks += 1;
      updateProgress(completedTasks, "Loading typography...");

      // Task 2: Preload Critical Images (Logo & DOM images)
      const imagePromises = CRITICAL_IMAGES.map((src) => preloadImage(src));
      if (typeof document !== "undefined") {
        const domImages = Array.from(document.images || []).map((img) =>
          preloadImage(img.src)
        );
        imagePromises.push(...domImages);
      }
      await Promise.all(imagePromises);
      completedTasks += 1;
      updateProgress(completedTasks, "Loading visuals & graphics...");

      // Task 3: Video & Ambient Media
      await preloadVideoOrMedia();
      completedTasks += 1;
      updateProgress(completedTasks, "Preparing environment...");

      // Task 4: Document Load completion
      await waitForDoc();
      completedTasks += 1;
      updateProgress(completedTasks, "Ready");

      // Ensure minimum visual presentation time (700ms) so loader is smooth and stable
      const elapsed = Date.now() - startTime;
      const minDisplayDuration = 700;
      if (elapsed < minDisplayDuration) {
        await new Promise((resolve) =>
          setTimeout(resolve, minDisplayDuration - elapsed)
        );
      }

      if (isMounted) {
        setProgress(100);
        setStatusText("Ready");
        setTimeout(() => {
          if (isMounted) {
            setLoaded(true);
          }
        }, 150);
      }
    };

    // Safety timeout (max 6s)
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setProgress(100);
        setLoaded(true);
      }
    }, 6000);

    loadAllAssets();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  // Allow smooth fade-out transition before unmounting loader overlay
  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  return (
    <>
      {children}
      {shouldRender && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading studio assets"
          data-testid="asset-loader-overlay"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0B0D10",
            opacity: loaded ? 0 : 1,
            pointerEvents: loaded ? "none" : "auto",
            transition: "opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              width: "280px",
              maxWidth: "90vw",
            }}
          >
            {/* Minimal glowing spinner */}
            <div style={{ position: "relative", width: "42px", height: "42px" }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: "2.5px solid rgba(237, 238, 240, 0.08)",
                  borderTopColor: "#00F0FF",
                  animation: "asset-loader-spin 0.8s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "9px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0, 240, 255, 0.12)",
                  animation: "asset-loader-pulse 1.4s ease-in-out infinite alternate",
                }}
              />
            </div>

            {/* Status text + progress bar */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                width: "100%",
              }}
            >
              <div
                style={{
                  fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  color: "#8C93A1",
                  textTransform: "uppercase",
                }}
              >
                {statusText}
              </div>

              {/* Minimal progress bar */}
              <div
                style={{
                  width: "100%",
                  height: "3px",
                  backgroundColor: "rgba(237, 238, 240, 0.08)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    backgroundColor: "#00F0FF",
                    boxShadow: "0 0 8px rgba(0, 240, 255, 0.6)",
                    borderRadius: "999px",
                    transition: "width 240ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </div>

              <div
                style={{
                  fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                  fontSize: "10px",
                  color: "#5A6270",
                  letterSpacing: "0.08em",
                }}
              >
                {progress}%
              </div>
            </div>
          </div>

          <style>{`
            @keyframes asset-loader-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes asset-loader-pulse {
              0% { transform: scale(0.8); opacity: 0.3; }
              100% { transform: scale(1.15); opacity: 0.9; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
