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
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: sceneTokens.spacing[2],
        }}
      >
        {entries.map(([key, value], idx) => (
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
                color: sceneTokens.status.active.glow,
                fontWeight: 700,
                marginTop: 2,
              }}
            >
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}