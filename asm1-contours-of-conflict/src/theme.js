// src/theme.js

export const THEME = {
  accent: "#E0B400",          // Muted Yellow
  ink: "#374151",             // Text / outlines
  paper: "#F8FAFC",           // Section background
  panel: "rgba(255,255,255,0.80)", // Floating UI panels
  line: "rgba(17,24,39,0.18)", // Soft borders
}

export const STOPS = {

  // Events — Soft Muted Yellow scale
  events_count: [
    0,    "#FFFBEB",   
    10,   "#FEF3C7",
    50,   "#FDE68A",
    200,  "#FCD34D",
    1000, "#E0B400",   // accent color
    5000, "#B88F00",    
    20000,"#7A5A00"    
  ],

  // Fatality rate — Grey scale
  fatality_rate: [
    0.0,    "#F8FAFC",
    0.1,  "#E5E7EB",
    0.5,  "#D1D5DB",
    1.0,    "#9CA3AF",
    2.0,    "#6B7280",
    5.0,    "#374151",
    10.0,   "#111827"
  ],
}