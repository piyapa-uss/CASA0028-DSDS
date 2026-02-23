import { useEffect, useMemo, useState } from "react"
import Papa from "papaparse"
import { ResponsiveContainer, Sankey, Tooltip } from "recharts"
import { THEME } from "../theme"

const TYPE_LABEL = {
  1: "State-based",
  2: "Non-state",
  3: "One-sided",
}

// Colors for violence types (state-based, non-state, one-sided)
// NOTE: use RGBA for non-state to avoid 8-digit hex alpha quirks on some browsers
const TYPE_COLOR = {
  1: THEME?.ink ?? "#111827",
  2: "rgba(164, 167, 172, 0.55)", // muted slate with alpha
  3: THEME?.accent ?? "#E9D48D",
}

function SankeyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload
  if (!p) return null

  // hover link
  if (p.source != null && p.target != null && p.value != null) {
    const source = p.source?.name ?? ""
    const target = p.target?.name ?? ""
    const t = p?.typeId
    const swatch = TYPE_COLOR[t] ?? (THEME?.muted ?? "#6B7280")

    return (
      <div className="rounded-lg border bg-white/95 px-3 py-2 text-[12px] shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold text-gray-900">
            {source} → {target}
          </div>
          <span
            className="h-2.5 w-2.5 rounded-sm border"
            style={{ background: swatch }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-1 text-gray-600 tabular-nums">
          Events:{" "}
          <span className="font-semibold text-gray-900">
            {Math.round(p.value).toLocaleString()}
          </span>
        </div>
      </div>
    )
  }

  // hover node
  if (p.name) {
    const isType = p.kind === "type"
    const t = p?.typeId
    const swatch = isType ? (TYPE_COLOR[t] ?? (THEME?.ink ?? "#111827")) : (THEME?.panel ?? "#E5E7EB")

    return (
      <div className="rounded-lg border bg-white/95 px-3 py-2 text-[12px] shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm border"
            style={{ background: swatch }}
            aria-hidden="true"
          />
          <div className="font-semibold text-gray-900">{p.name}</div>
        </div>
        <div className="mt-1 text-gray-600">{isType ? "Violence type" : "Region"}</div>
      </div>
    )
  }

  return null
}

// --- Hover state -------------------------------------------------------------

// We keep hover on the React side to:
// 1) brighten hovered link
// 2) fade non-hover links a bit
function LinkShapeFactory({ hoveredKey, setHoveredKey }) {
  return function LinkShape(props) {
    const {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourceControlX,
      targetControlX,
      linkWidth,
      payload,
    } = props

    const t = payload?.typeId
    const stroke = TYPE_COLOR[t] ?? (THEME?.muted ?? "#6B7280")
    const w = Math.max(1, linkWidth)

    const d = `M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`

    const key = `${payload?.source}-${payload?.target}-${payload?.typeId}-${payload?.value}`
    const isHovered = hoveredKey === key
    const hasHover = hoveredKey != null

    const baseOpacity = 0.60
    const fadedOpacity = 0.20
    const hoverOpacity = 0.90

    const strokeOpacity = hasHover ? (isHovered ? hoverOpacity : fadedOpacity) : baseOpacity

    return (
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={w}
        strokeOpacity={strokeOpacity}
        style={{ mixBlendMode: "normal", cursor: "default" }}
        onMouseEnter={() => setHoveredKey(key)}
        onMouseLeave={() => setHoveredKey(null)}
      />
    )
  }
}

// Custom node (region muted, type colored)
function NodeShape(props) {
  const { x, y, width, height, payload } = props
  const isType = payload?.kind === "type"
  const fill = isType
    ? (TYPE_COLOR[payload?.typeId] ?? (THEME?.ink ?? "#111827"))
    : (THEME?.panel ?? "#E5E7EB")

  // Slightly bolder for type labels to help scan right column quickly
  const fw = isType ? 600 : 500

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={2} fill={fill} opacity={0.95} />
      <text
        x={x + width + 8}
        y={y + height / 2}
        dy="0.35em"
        fontSize={12}
        fontWeight={fw}
        fill="#111827"
      >
        {payload?.name}
      </text>
    </g>
  )
}

export default function SankeyChart({ year: externalYear }) {
  const [rows, setRows] = useState([])
  const [year, setYear] = useState(externalYear ?? 2000)
  const [hoveredKey, setHoveredKey] = useState(null)

  useEffect(() => {
    if (Number.isFinite(+externalYear)) setYear(+externalYear)
  }, [externalYear])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch("/data/sankey_summary.csv")
      const text = await res.text()
      const parsed = Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      })
      if (!cancelled) setRows(parsed.data || [])
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const years = useMemo(() => {
    return Array.from(new Set(rows.map((d) => +d.year).filter((y) => Number.isFinite(y)))).sort(
      (a, b) => a - b
    )
  }, [rows])

  useEffect(() => {
    if (!years.length) return
    if (!years.includes(+year)) setYear(years[0])
  }, [years]) // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = useMemo(() => {
    const filtered = rows.filter((d) => +d.year === +year)

    const regions = Array.from(
      new Set(filtered.map((d) => String(d.region || "").trim()).filter(Boolean))
    )

    const types = [1, 2, 3].filter((t) => filtered.some((d) => +d.type_of_violence === t))

    const nodes = [
      ...regions.map((r) => ({ name: r, kind: "region" })),
      ...types.map((t) => ({
        name: TYPE_LABEL[t] ?? String(t),
        kind: "type",
        typeId: t,
      })),
    ]

    const regionIndex = new Map(regions.map((r, i) => [r, i]))
    const typeIndex = new Map(types.map((t, i) => [t, regions.length + i]))

    const links = filtered
      .map((d) => {
        const region = String(d.region || "").trim()
        const t = +d.type_of_violence
        const v = +d.event_count

        if (!regionIndex.has(region) || !typeIndex.has(t) || !Number.isFinite(v)) return null
        return {
          source: regionIndex.get(region),
          target: typeIndex.get(t),
          value: Math.max(0, v),
          typeId: t,
        }
      })
      .filter(Boolean)

    return { nodes, links }
  }, [rows, year])

  const hasData = chartData.links?.length > 0

  const LinkShape = useMemo(
    () => LinkShapeFactory({ hoveredKey, setHoveredKey }),
    [hoveredKey]
  )

  return (
    <div className="w-full">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Flows by region and violence type</div>
          <div className="mt-1 text-xs text-gray-500">
            Use the year control to see how these power dynamics reconfigure over time.
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-xs">Year</span>
          <select
            className="rounded-md border bg-white px-2 py-1 text-sm text-gray-900"
            value={year}
            onChange={(e) => setYear(+e.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* chart */}
      <div className="mt-4 h-[420px] w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={chartData}
              nodeWidth={14}
              nodePadding={16}
              iterations={32}
              linkCurvature={0.5}
              node={<NodeShape />}
              link={<LinkShape />}
              // more right margin so labels never feel cramped
              margin={{ top: 10, right: 140, bottom: 10, left: 40 }}
            >
              <Tooltip content={<SankeyTooltip />} />
            </Sankey>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed text-sm text-gray-500">
            No data for {year}.
          </div>
        )}
      </div>

      {/* legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs text-gray-700">
        {[1, 2, 3].map((t) => (
          <div key={t} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border" style={{ background: TYPE_COLOR[t] }} />
            <span>{TYPE_LABEL[t]}</span>
          </div>
        ))}
      </div>

      {/* description */}
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        Flows summarise how violence is distributed across{" "}
        <span className="font-medium">regions</span> and{" "}
        <span className="font-medium">actor configurations</span>. Thicker links indicate where conflict
        is predominantly <span className="font-medium">state-driven</span>, where violence is shaped by{" "}
        <span className="font-medium">non-state groups</span>, and where{" "}
        <span className="font-medium">one-sided violence</span> concentrates.
      </p>
    </div>
  )
}