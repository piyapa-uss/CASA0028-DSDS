import { useMemo, useState, useEffect } from "react";
import * as d3 from "d3";
import { sankey as d3Sankey, sankeyLinkHorizontal } from "d3-sankey";


export default function SankeyChart({ year, width = 900, height = 420 }) {
  const [hoverKey, setHoverKey] = useState(null); 
  const [summary, setSummary] = useState([]);
    useEffect(() => {
        d3.csv("/data/sankey_summary.csv").then(data => {
            setSummary(data);
        });
    }, []);

  const { nodes, links } = useMemo(() => {
  
    if (!summary.length) return { nodes: [], links: [] };

    // filter year 
    const filtered = summary
        .filter(d => Number(d.year) === Number(year))
        .map(d => ({ ...d, region: (d.region ?? "").trim() }));

    // nodes: region (left) + type (right)
    const regions = ["Africa", "Americas", "Asia", "Europe", "Middle East"];

    const typeLabels = {
        1: "State-based",
        2: "Non-state",
        3: "One-sided",
    };

    const types = [1, 2, 3];

    const nodes = [
        ...regions.map(r => ({ id: `L:${r}`, name: r })),
        ...types.map(t => ({ id: `R:${t}`, name: typeLabels[t] })),
    ];

    // links
    const links = filtered
        .map(d => {
            const region = (d.region ?? "").trim();
            const t = Number(d.type_of_violence);
            const value = Number(d.event_count);

            return {
            source: `L:${region}`,
            target: `R:${t}`,
            value,
            };
        })
        .filter(l => Number.isFinite(l.value) && l.value > 0);

    console.log("year", year, "filtered", filtered.length, "links", links.length);

    return { nodes, links };
    }, [summary, year]);

  const graph = useMemo(() => {
    if (!nodes.length || !links.length) return { nodes: [], links: [] };

    const sankey = d3Sankey()
        .nodeId(d => d.id)
        .nodeWidth(14)
        .nodePadding(10)
        .extent([[10, 10], [width - 10, height - 10]]);

    // d3-sankey mutates objects → clone
    const n = nodes.map(d => ({ ...d }));
    const l = links.map(d => ({ ...d }));

    return sankey({ nodes: n, links: l });
    }, [nodes, links, width, height]);

  const isDimmed = (type, id) => {
    if (!hoverKey) return false;
    if (hoverKey === `${type}:${id}`) return false;

    // when hovering a node, keep connected links/nodes visible
    if (hoverKey.startsWith("node:")) {
      const idx = Number(hoverKey.split(":")[1]);
      if (type === "node") {
        const node = graph.nodes[idx];
        const targetNode = graph.nodes[id];
        const connected =
          node.sourceLinks?.some(k => k.target === targetNode) ||
          node.targetLinks?.some(k => k.source === targetNode) ||
          idx === id;
        return !connected;
      }
      if (type === "link") {
        const link = graph.links[id];
        return !(link.source.index === idx || link.target.index === idx);
      }
    }

    // when hovering a link, keep its endpoints visible
    if (hoverKey.startsWith("link:")) {
      const li = Number(hoverKey.split(":")[1]);
      const active = graph.links[li];
      if (type === "link") return li !== id;
      if (type === "node") return !(active.source.index === id || active.target.index === id);
    }

    return true;
  };

  // Color
    const TYPE_COLOR = {
        "R:1": "#1F2933", // State-based 
        "R:2": "#6B7280", // Non-state 
        "R:3": "#B38A4C", // One-sided 
        };
    const ACCENT_YELLOW = "#C6A43A";

    const nodeColor = (node) => {
        // if hover node on, node is yellow
        if (hoverKey?.startsWith("node:")) {
            const idx = Number(hoverKey.split(":")[1]);
            // graph.nodes[idx] node hover
            // compare by id (more safe thanindex)
            const activeId = graph.nodes?.[idx]?.id;
            if (activeId && node.id === activeId) return ACCENT_YELLOW;
        }

        // Right nodes colored by type, left nodes default gray
        if (TYPE_COLOR[node.id]) return TYPE_COLOR[node.id];
        return "#E5E7EB"; // left nodes warm-ish light grey
        };

    const linkColor = (link, i) => {
        // if hover link, link is yellow
        if (hoverKey === `link:${i}`) return ACCENT_YELLOW;

        const tid = typeof link.target === "object" ? link.target.id : link.target;
        return TYPE_COLOR[tid] || "#9CA3AF";
        };

  if (!summary.length) {
  return <div className="text-sm text-gray-500">Loading Sankey data…</div>;
  }

  if (!links.length) {
  return <div className="text-sm text-gray-500">No data for year {year}.</div>;
  }

  return (
    <div style={{ width, maxWidth: "100%" }}>
      <svg width={width} height={height} role="img" aria-label="Sankey chart">
        {/* Links */}
        <g fill="none">
          {graph.links.map((link, i) => (
            <path
              key={i}
              d={sankeyLinkHorizontal()(link)}
              stroke={linkColor(link, i)}
              strokeOpacity={isDimmed("link", i) ? 0.05 : 0.55}
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
                fillOpacity={isDimmed("node", i) ? 0.25 : 0.85}
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
  );
}