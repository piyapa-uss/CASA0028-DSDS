import { useMemo, useState, useEffect } from "react"
import * as d3 from "d3"
import { sankey as d3Sankey, sankeyLinkHorizontal } from "d3-sankey"
import { THEME } from "../theme"

export default function SankeyChart({ year, width = 900, height = 420 }) {
  const [hoverKey, setHoverKey] = useState(null)
  const [summary, setSummary] = useState([])
  const [localYear, setLocalYear] = useState(Number(year) || 2024)

  // keep localYear in sync when parent year changes (but still standalone)
  useEffect(() => {
    if (Number.isFinite(+year)) setLocalYear(Number(year))
  }, [year])

  useEffect(() => {
    let cancelled = false
    d3.csv("/data/sankey_summary.csv").then((data) => {
      if (cancelled) return
      setSummary(data || [])
    })
    return () => {
      cancelled = true
    }
  }, [])

  const years = useMemo(() => {
    const ys = Array.from(
      new Set((summary || []).map((d) => Number(d.year)).filter((v) => Number.isFinite(v)))
    ).sort((a, b) => a - b)
    return ys.length ? ys : Array.from({ length: 25 }, (_, i) => 2000 + i)
  }, [summary])

  const { nodes, links } = useMemo(() => {
    if (!summary.length) return { nodes: [], links: [] }

    const filtered = summary
      .filter((d) => Number(d.year) === Number(localYear))
      .map((d) => ({
        ...d,
        region: (d.region ?? "").trim()
      }))

    const regions = ["Africa", "Americas", "Asia", "Europe", "Middle East"]

    const typeLabels = {
      1: "State-based",
      2: "Non-state",
      3: "One-sided"
    }
    const types = [1, 2, 3]

    const nodes = [
      ...regions.map((r) => ({ id: `L:${r}`, name: r })),
      ...types.map((t) => ({ id: `R:${t}`, name: typeLabels[t] }))
    ]

    const links = filtered
      .map((d) => {
        const region = (d.region ?? "").trim()
        const t = Number(d.type_of_violence)
        const value = Number(d.event_count)
        return { source: `L:${region}`, target: `R:${t}`, value }
      })
      .filter((l) => Number.isFinite(l.value) && l.value > 0)

    return { nodes, links }
  }, [summary, localYear])

  const graph = useMemo(() => {
    if (!nodes.length || !links.length) return { nodes: [], links: [] }

    const sankey = d3Sankey()
      .nodeId((d) => d.id)
      .nodeWidth(14)
      .nodePadding(10)
      .extent([[10, 10], [width - 10, height - 10]])

    // d3-sankey mutates objects → clone
    const n = nodes.map((d) => ({ ...d }))
    const l = links.map((d) => ({ ...d }))
    return sankey({ nodes: n, links: l })
  }, [nodes, links, width, height])

  const TYPE_COLOR = {
    "R:1": THEME.ink,          // State-based
    "R:2": "#6B7280",          // Non-state
    "R:3": "#B38A4C"           // One-sided (muted gold-brown)
  }
  const ACCENT_YELLOW = THEME.accent

  const isDimmed = (type, id) => {
    if (!hoverKey) return false

    if (hoverKey.startsWith("node:")) {
      const idx = Number(hoverKey.split(":")[1])
      if (type === "node") {
        const node = graph.nodes[idx]
        const targetNode = graph.nodes[id]
        const connected =
          node.sourceLinks?.some((k) => k.target === targetNode) ||
          node.targetLinks?.some((k) => k.source === targetNode) ||
          idx === id
        return !connected
      }
      if (type === "link") {
        const link = graph.links[id]
        return !(link.source.index === idx || link.target.index === idx)
      }
    }

    if (hoverKey.startsWith("link:")) {
      const li = Number(hoverKey.split(":")[1])
      const active = graph.links[li]
      if (type === "link") return li !== id
      if (type === "node") return !(active.source.index === id || active.target.index === id)
    }

    return true
  }

  const nodeColor = (node) => {
    if (hoverKey?.startsWith("node:")) {
      const idx = Number(hoverKey.split(":")[1])
      const activeId = graph.nodes?.[idx]?.id
      if (activeId && node.id === activeId) return ACCENT_YELLOW
    }
    if (TYPE_COLOR[node.id]) return TYPE_COLOR[node.id]
    return "#E5E7EB"
  }

  const linkColor = (link, i) => {
    if (hoverKey === `link:${i}`) return ACCENT_YELLOW
    const tid = typeof link.target === "object" ? link.target.id : link.target
    return TYPE_COLOR[tid] || "#9CA3AF"
  }

  if (!summary.length) return <div className="text-sm text-gray-500">Loading Sankey data…</div>
  if (!links.length) return <div className="text-sm text-gray-500">No data for year {localYear}.</div>

  return (
    <div className="w-full">
      {/* Local controls (standalone) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-900">Flows by region and violence type</div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Year</span>
          <select
            className="rounded-md border bg-white px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-0"
            value={localYear}
            onChange={(e) => setLocalYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg width={width} height={height} role="img" aria-label="Sankey chart">
          {/* Links */}
          <g fill="none">
            {graph.links.map((link, i) => (
              <path
                key={i}
                d={sankeyLinkHorizontal()(link)}
                stroke={linkColor(link, i)}
                strokeOpacity={isDimmed("link", i) ? 0.06 : 0.5}
                strokeWidth={Math.max(1, link.width)}
                onMouseEnter={() => setHoverKey(`link:${i}`)}
                onMouseLeave={() => setHoverKey(null)}
              />
            ))}
          </g>

          {/* Nodes */}
          <g>
            {graph.nodes.map((node, i) => (
              <g
                key={node.id}
                transform={`translate(${node.x0},${node.y0})`}
                onMouseEnter={() => setHoverKey(`node:${i}`)}
                onMouseLeave={() => setHoverKey(null)}
                style={{ cursor: "default" }}
              >
                <rect
                  width={node.x1 - node.x0}
                  height={Math.max(1, node.y1 - node.y0)}
                  fill={nodeColor(node)}
                  fillOpacity={isDimmed("node", i) ? 0.22 : 0.85}
                  rx="2"
                />
                <text
                  x={node.x0 < width / 2 ? (node.x1 - node.x0) + 8 : -8}
                  y={(node.y1 - node.y0) / 2}
                  dy="0.35em"
                  textAnchor={node.x0 < width / 2 ? "start" : "end"}
                  fontSize="12"
                  fill="#111827"
                  opacity={isDimmed("node", i) ? 0.25 : 0.9}
                >
                  {node.name}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      <p className="mt-3 max-w-3xl text-xs leading-relaxed text-gray-600">
        The flow thickness represents event counts for the selected year, linking regions to dominant forms of violence.
      </p>
    </div>
  )
}