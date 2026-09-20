import { useEffect, useState, type ReactNode } from "react";

export interface AssetLoaderProps {
  children?: ReactNode;
}

export function AssetLoader({ children }: AssetLoaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAssetsLoaded = async () => {
      // 1. Wait for window load event if document hasn't completed loading yet
      if (typeof document !== "undefined" && document.readyState !== "complete") {
        await new Promise<void>((resolve) => {
          const onWindowLoad = () => {
            window.removeEventListener("load", onWindowLoad);
            resolve();
          };
          window.addEventListener("load", onWindowLoad);
        });
      }

      // 2. Wait for document fonts to finish loading
      if (typeof document !== "undefined" && document.fonts && typeof document.fonts.ready?.then === "function") {
        try {
          await document.fonts.ready;
        } catch {
          // Ignore font loading errors gracefully
        }
      }

      if (isMounted) {
        setLoaded(true);
      }
    };

    // Safety fallback timeout (max 1500ms so the loader never hangs indefinitely)
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setLoaded(true);
      }
    }, 1500);

    checkAssetsLoaded();

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
      }, 400);
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
          aria-label="Loading assets"
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
            transition: "opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Minimal glowing spinner */}
            <div style={{ position: "relative", width: "38px", height: "38px" }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: "2px solid rgba(237, 238, 240, 0.08)",
                  borderTopColor: "#00F0FF",
                  animation: "asset-loader-spin 0.75s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "8px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0, 240, 255, 0.08)",
                  animation: "asset-loader-pulse 1.5s ease-in-out infinite alternate",
                }}
              />
            </div>

            {/* Minimal text label */}
            <div
              style={{
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                fontSize: "11px",
                letterSpacing: "0.12em",
                color: "#8C93A1",
                textTransform: "uppercase",
              }}
            >
              Loading assets...
            </div>
          </div>

          <style>{`
            @keyframes asset-loader-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes asset-loader-pulse {
              0% { transform: scale(0.85); opacity: 0.4; }
              100% { transform: scale(1.15); opacity: 0.9; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
