import { sceneTokens } from "./scenes/sceneTokens";

export function StatePanel({
  state,
}: {
  state:
    | Record<string, string | number | boolean>
    | undefined;
}) {
  if (!state) {
    return null;
  }

  const entries = Object.entries(state);
  if (entries.length === 0) {
    return null;
  }

  const priorityOrder = ["i", "j", "k", "swapped", "left", "right", "mid", "low", "high", "min_idx", "key", "temp", "sum", "n", "ans"];
  const sortedEntries = [...entries].sort(([a], [b]) => {
    const idxA = priorityOrder.indexOf(a);
    const idxB = priorityOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div
      style={{
        width: "100%",
        background: sceneTokens.surfaces.panel,
        border: `1px solid ${sceneTokens.borders.subtle}`,
        borderRadius: sceneTokens.radii.lg,
        padding: sceneTokens.spacing[3],
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: sceneTokens.spacing[2],
          paddingBottom: sceneTokens.spacing[2],
          borderBottom: `1px solid ${sceneTokens.borders.subtle}`,
        }}
      >
        <span
          style={{
            fontSize: sceneTokens.typography.eyebrow.fontSize,
            fontWeight: sceneTokens.typography.eyebrow.fontWeight,
            letterSpacing: sceneTokens.typography.eyebrow.letterSpacing,
            textTransform: "uppercase",
            color: sceneTokens.text.secondary,
          }}
        >
          Variable State
        </span>
        <span
          style={{
            fontSize: sceneTokens.typography.caption.fontSize,
            color: sceneTokens.text.muted,
          }}
        >
          {entries.length} tracked
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
          gap: sceneTokens.spacing[2],
        }}
      >
        {sortedEntries.map(([key, value], idx) => {
          const isBool = typeof value === "boolean";
          const valColor = isBool
            ? value
              ? sceneTokens.status.success.glow
              : sceneTokens.text.muted
            : key === "i"
            ? "#38bdf8"
            : key === "j"
            ? sceneTokens.status.mutated.glow
            : sceneTokens.status.active.glow;

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: `${sceneTokens.spacing[1]}px ${sceneTokens.spacing[2]}px`,
                background: sceneTokens.surfaces.card,
                borderRadius: sceneTokens.radii.sm,
                border: `1px solid ${sceneTokens.borders.subtle}`,
              }}
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono", "SF Mono", monospace',
                  fontSize: sceneTokens.typography.caption.fontSize,
                  color: sceneTokens.text.secondary,
                  fontWeight: 500,
                }}
              >
                {key}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", "SF Mono", monospace',
                  fontSize: sceneTokens.typography.code.fontSize,
                  color: valColor,
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                {String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}