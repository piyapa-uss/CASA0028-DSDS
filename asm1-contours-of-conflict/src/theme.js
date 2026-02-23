export const THEME = {
  // core
  core: "#3B3F42",
  ink: "#6F6A64",
  neutral: "#D8C07A",
  accent: "#D6C16A",
  accentSoft: "#E9D48D",

  // surfaces
  bg: "#FFFFFF",
  bgAlt: "#F7F6F2",
  panel: "#FBF7ED",
  border: "rgba(59,63,66,0.14)",

  // categories (type of violence)
  state: "#3B3F42",
  nonstate: "#6F6A64",
  onesided: "#BFA259",

  // shared series (for sankey, stackedarea, paired bars)
  series: {
    events: "#D8C07A",
    deaths: "#3B3F42",
    fatality: "#6F6A64",
  },

  // UI accents
  slider: "#C9A85C",
  tooltipBg: "rgba(251,247,237,0.96)",
  shadow: "0 8px 24px rgba(0,0,0,0.08)",
}

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

  fatality_rate: [
    0,   "#F7F6F2",
    1,   "#EEECE6",
    2,   "#DEDAD1",
    5,   "#C6C1B7",
    10,  "#A9A399",
    20,  "#7F7A72",
    30,  "#3B3F42",
  ],
}