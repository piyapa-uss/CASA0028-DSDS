// src/theme.js
export const THEME = {
  // core
  core: "#3B3F42",
  ink: "#6F6A64",
  neutral: "#D8C07A",
  accent: "#F2E9CF",

  // surfaces
  bg: "#FFFFFF",
  bgAlt: "#F7F6F2",      // Light Grey Section 
  panel: "#FBF7ED",      // Warm pastel
  border: "rgba(59,63,66,0.14)",

  // categories (type of violence)
  state: "#3B3F42",
  nonstate: "#6F6A64",
  onesided: "#C9A85C",

  // UI accents
  slider: "#C9A85C",
  tooltipBg: "rgba(251,247,237,0.96)",
  shadow: "0 8px 24px rgba(0,0,0,0.08)",
}

// Choropleth stops 
export const STOPS = {
  events_count: [
    0,   "#FBF7ED",
    10,  "#F6EFD7",
    50,  "#F0E2B6",
    200, "#E9D48D",
    1000,"#D8C07A",
    5000,"#C9A85C",
    20000,"#B3873A",
  ],

  // fatality_rate
  fatality_rate: [
    0,   "#F2F2F2",
    1,   "#D9D9D9",
    2,   "#BFBFBF",
    5,   "#9E9E9E",
    10,  "#7A7A7A",
    20,  "#5A5A5A",
    30,  "#3B3F42",
  ],
}