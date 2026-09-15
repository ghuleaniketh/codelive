/**
 * Code Story Studio — Terminal Design Tokens
 *
 * Grounded in "Terminal, not dashboard" direction:
 * - Quiet neutral surfaces (#0B0D10, #14171B, #1B1F24, #22262B)
 * - Single confident accent (#E8A33D) for active/running state
 * - Secondary cool accent (#5FA8D3) for visited/compare state
 * - Success state (#5FBF77) for passed/correct state
 * - Strict radius scale: 6px for controls, 10px for containers
 */

export const sceneTokens = {
  // Core Color Tokens
  colors: {
    bg: "#0B0D10",
    surface: "#14171B",
    surfaceRaised: "#1B1F24",
    border: "#22262B",
    textPrimary: "#EDEEF0",
    textSecondary: "#8C93A1",
    accent: "#E8A33D",
    accentCool: "#5FA8D3",
    success: "#5FBF77",
  },

  // Surface colors
  surfaces: {
    canvas: "#0B0D10",
    panel: "#14171B",
    card: "#14171B",
    raised: "#1B1F24",
    subtle: "#1B1F24",
    overlay: "rgba(11, 13, 16, 0.95)",
  },

  // Border colors
  borders: {
    subtle: "#22262B",
    contrast: "#22262B",
    active: "#E8A33D",
    cool: "#5FA8D3",
  },

  // Text hierarchy
  text: {
    primary: "#EDEEF0",
    secondary: "#8C93A1",
    muted: "#8C93A1",
  },

  // Status Matrix (fill + stroke + glow)
  status: {
    active: {
      fill: "rgba(232, 163, 61, 0.12)",
      stroke: "#E8A33D",
      glow: "#E8A33D",
    },
    success: {
      fill: "rgba(95, 191, 119, 0.12)",
      stroke: "#5FBF77",
      glow: "#5FBF77",
    },
    mutated: {
      fill: "rgba(95, 168, 211, 0.12)",
      stroke: "#5FA8D3",
      glow: "#5FA8D3",
    },
    eliminated: {
      fill: "#14171B",
      stroke: "#22262B",
      glow: "#8C93A1",
    },
    backtrack: {
      fill: "rgba(232, 163, 61, 0.12)",
      stroke: "#E8A33D",
      glow: "#E8A33D",
    },
    traversal: {
      fill: "rgba(95, 168, 211, 0.12)",
      stroke: "#5FA8D3",
      glow: "#5FA8D3",
    },
    exhausted: {
      fill: "rgba(232, 163, 61, 0.12)",
      stroke: "#E8A33D",
      glow: "#E8A33D",
    },
    error: {
      fill: "rgba(232, 163, 61, 0.12)",
      stroke: "#E8A33D",
      glow: "#E8A33D",
    },
  },

  // Typography scale
  typography: {
    display: { fontSize: 20, lineHeight: 26, fontWeight: 600, letterSpacing: "-0.01em" },
    title: { fontSize: 16, lineHeight: 22, fontWeight: 600, letterSpacing: "-0.01em" },
    narrative: { fontSize: 14, lineHeight: 22, fontWeight: 500, letterSpacing: "0em" },
    body: { fontSize: 13, lineHeight: 20, fontWeight: 400, letterSpacing: "0em" },
    code: { fontSize: 13, lineHeight: 20, fontWeight: 500, letterSpacing: "0em" },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: 500, letterSpacing: "0em" },
    eyebrow: { fontSize: 11, lineHeight: 14, fontWeight: 600, letterSpacing: "0.02em" },
  },

  fontSizes: {
    small: 11,
    medium: 13,
    large: 15,
    code: 13,
    eyebrow: 11,
  },

  // Spacing scale
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    padding: 16,
    gap: 12,
    boxWidth: 64,
    boxHeight: 40,
  },

  // SVG Geometry Tokens
  geometry: {
    stroke: {
      subtle: 1,
      default: 1,
      emphasis: 2,
      traversal: 2,
    },
    nodeRadius: 18,
    box: {
      width: 64,
      height: 40,
    },
  },

  strokeWidths: {
    box: 1,
    connector: 1,
    node: 1,
    edge: 1,
    subtle: 1,
    default: 1,
    emphasis: 2,
    traversal: 2,
  },

  // Motion timing tokens
  motion: {
    micro: 0.12,
    step: 0.25,
    path: 0.35,
    microMs: 120,
    stepMs: 250,
    pathMs: 350,
  },

  animationDuration: 250,

  // Strict Border radii: 6px for controls, 10px for containers
  radii: {
    sm: 6,
    md: 6,
    lg: 10,
    xl: 10,
    full: 6,
    card: 10,
    control: 6,
    container: 10,
  },
};