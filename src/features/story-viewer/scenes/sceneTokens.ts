/**
 * Code Story Studio — Design System Tokens
 *
 * Encodes the Obsidian Studio System:
 * - Obsidian dark surfaces and high-contrast borders
 * - Unified status color matrix (active, success, mutated, eliminated, backtrack, traversal, exhausted)
 * - Typography scale
 * - 4px spacing scale
 * - SVG geometry tokens (stroke widths, node radii, box sizes)
 * - Motion timing tokens
 */

export const sceneTokens = {
  // Surface colors (Obsidian dark studio canvas)
  surfaces: {
    canvas: "#090d16",
    panel: "#0f172a",
    card: "#162238",
    subtle: "rgba(255, 255, 255, 0.04)",
    overlay: "rgba(15, 23, 42, 0.85)",
  },

  // Border colors
  borders: {
    subtle: "#1e293b",
    contrast: "#334155",
    active: "#38bdf8",
  },

  // Text hierarchy
  text: {
    primary: "#f8fafc",
    secondary: "#94a3b8",
    muted: "#64748b",
  },

  // Backward compatibility convenience mappings for existing panels
  colors: {
    background: "#090d16",
    surface: "#0f172a",
    card: "#162238",
    boxFill: "#162238",
    boxStroke: "#334155",
    text: "#f8fafc",
    muted: "#64748b",
    connector: "#475569",
    highlight: "#f59e0b",
  },

  // Unified Status Color Matrix (fill + stroke + glow per state)
  status: {
    active: {
      fill: "rgba(245, 158, 11, 0.20)",
      stroke: "#f59e0b",
      glow: "#fbbf24",
    },
    success: {
      fill: "rgba(16, 185, 129, 0.20)",
      stroke: "#10b981",
      glow: "#34d399",
    },
    mutated: {
      fill: "rgba(56, 189, 248, 0.20)",
      stroke: "#38bdf8",
      glow: "#7dd3fc",
    },
    eliminated: {
      fill: "rgba(30, 41, 59, 0.50)",
      stroke: "#334155",
      glow: "#64748b",
    },
    // Supplementary semantic states
    backtrack: {
      fill: "rgba(249, 115, 22, 0.20)",
      stroke: "#f97316",
      glow: "#fb923c",
    },
    traversal: {
      fill: "rgba(139, 92, 246, 0.20)",
      stroke: "#8b5cf6",
      glow: "#a78bfa",
    },
    exhausted: {
      fill: "rgba(239, 68, 68, 0.20)",
      stroke: "#ef4444",
      glow: "#f87171",
    },
    error: {
      fill: "rgba(239, 68, 68, 0.20)",
      stroke: "#ef4444",
      glow: "#f87171",
    },
  },

  // Typography scale
  typography: {
    display: { fontSize: 22, lineHeight: 28, fontWeight: 800, letterSpacing: "-0.02em" },
    title: { fontSize: 17, lineHeight: 24, fontWeight: 700, letterSpacing: "-0.01em" },
    narrative: { fontSize: 15, lineHeight: 24, fontWeight: 600, letterSpacing: "0em" },
    body: { fontSize: 14, lineHeight: 22, fontWeight: 400, letterSpacing: "0em" },
    code: { fontSize: 13, lineHeight: 20, fontWeight: 500, letterSpacing: "0em" },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: 500, letterSpacing: "+0.01em" },
    eyebrow: { fontSize: 12, lineHeight: 14, fontWeight: 700, letterSpacing: "+0.12em" },
  },

  fontSizes: {
    small: 12,
    medium: 14,
    large: 16,
    code: 13,
    eyebrow: 11,
  },

  // 4px spacing scale
  spacing: {
    1: 4,
    2: 8,
    3: 14,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    padding: 16,
    gap: 16,
    boxWidth: 68,
    boxHeight: 48,
  },

  // SVG Geometry Tokens
  geometry: {
    stroke: {
      subtle: 1,
      default: 1.5,
      emphasis: 2.5,
      traversal: 4,
    },
    nodeRadius: 18,
    box: {
      width: 68,
      height: 42,
    },
  },

  strokeWidths: {
    box: 1.5,
    connector: 1.5,
    node: 2,
    edge: 1.5,
    subtle: 1,
    default: 1.5,
    emphasis: 2.5,
    traversal: 4,
  },

  // Motion timing tokens
  motion: {
    micro: 0.15, // 150ms for framer-motion transition
    step: 0.3,   // 300ms
    path: 0.45,  // 450ms so animations finish before the 500ms step interval at 2x speed
    microMs: 150,
    stepMs: 300,
    pathMs: 450,
  },

  animationDuration: 300,

  // Border radii
  radii: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
    card: 14,
  },
};