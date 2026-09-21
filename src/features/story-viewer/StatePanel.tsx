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
        background: "#14171B",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
        borderRadius: 10,
        padding: "12px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
          paddingBottom: "8px",
          borderBottom: "1px solid rgba(0, 240, 255, 0.3)",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#EDEEF0",
          }}
        >
          Variable state
        </span>
        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 11,
            color: "#8C93A1",
          }}
        >
          {entries.length} tracked
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "6px",
        }}
      >
        {sortedEntries.map(([key, value], idx) => {
          const isBool = typeof value === "boolean";
          const valColor = isBool
            ? value
              ? "#5FBF77"
              : "#8C93A1"
            : key === "i" || key === "j" || key === "ptr"
            ? "#5FA8D3"
            : "#EDEEF0";

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "4px 8px",
                background: "#1B1F24",
                borderRadius: 6,
                border: "1px solid rgba(0, 240, 255, 0.4)",
              }}
            >
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 11,
                  color: "#8C93A1",
                  fontWeight: 400,
                }}
              >
                {key}
              </span>
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 12,
                  color: valColor,
                  fontWeight: 600,
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