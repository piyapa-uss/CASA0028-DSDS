// src/theme.js

// ==============================
// Contours of Conflict — Theme
// ==============================

export const THEME = {
  // ---- Brand / core neutrals
  core: "#3B3F42",         // darkest neutral (titles, strong lines)
  ink: "#6F6A64",          // mid neutral (body text / secondary)
  neutral: "#D8C07A",      // warm neutral (events)
  accent: "#D6C16A",       // warm accent (UI highlight)
  accentSoft: "#E9D48D",   // soft warm (fills / choropleth mid)

  // ---- Surfaces
  surface: {
    bg: "#FFFFFF",
    bgAlt: "#F7F6F2",
    panel: "#FBF7ED",
    border: "rgba(59,63,66,0.14)",
    shadow: "0 8px 24px rgba(0,0,0,0.08)",
  },

  // ---- Semantic categories (Type of violence)
  // Use these everywhere for consistency (map / sankey / stacked / legends)
  category: {
    state: "#3B3F42",
    nonstate: "rgba(164, 167, 172, 0.55)",
    onesided: "#E9D48D",
  },

  // ---- Shared series (charts that compare metrics)
  series: {
    events: "#D8C07A",
    deaths: "#3B3F42",
    fatality: "#6F6A64",
  },

  // ---- UI accents
  ui: {
    slider: "#C9A85C",
    tooltipBg: "rgba(251,247,237,0.96)",
  },

  // ---- Chart styling tokens (axes, cursors, reference lines)
  chart: {
    axis: "rgba(59,63,66,0.14)",
    tick: "#6B7280",

    // hover cursor (Recharts Tooltip cursor)
    cursor: "rgba(255,255,255,0.75)",

    // reference line (year marker)
    refLine: "rgba(59,63,66,0.55)",

    // Optional: stroke colors (if you ever want visible boundaries)
    stroke: {
      state: "rgba(17,24,39,0.85)",
      nonstate: "rgba(55,65,81,0.85)",
      onesided: "rgba(161,98,7,0.9)",
    },
  },
}

// ==============================
// Choropleth Stops
// ==============================

export const STOPS = {
  events_count: [
    0, "#FBF7ED",
    10, "#F6EFD7",
    50, "#F0E2B6",
    200, "#E9D48D",
    1000, "#D8C07A",
    5000, "#C9A85C",
    20000, "#B3873A",
  ],

  fatality_rate: [
    0, "#F7F6F2",
    1, "#EEECE6",
    2, "#DEDAD1",
    5, "#C6C1B7",
    10, "#A9A399",
    20, "#7F7A72",
    30, "#3B3F42",
  ],
}