export const base = import.meta.env.BASE_URL

export function withBase(path) {
  // path: "data/file.csv" or "bg_white.png"
  return `${base}${path}`
}