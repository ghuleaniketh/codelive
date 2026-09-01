import { cn } from "@/lib/utils";

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
        maxWidth: 560,
        marginTop: 8,
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <p
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "rgba(255, 255, 255, 0.5)",
          marginBottom: 8,
        }}
      >
        Variable state
      </p>
      <div>
        {entries.map(([key, value], idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 4,
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 60,
                fontFamily: "ui-monospace, monospace",
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              {key}
            </span>
            <span>{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}