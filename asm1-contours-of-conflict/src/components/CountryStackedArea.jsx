import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const TYPE_LABEL = {
  1: "State-based",
  2: "Non-state",
  3: "One-sided",
};

const TYPE_COLOR = {
  1: "#D6A84C",
  2: "#7C8A9A",
  3: "#E07A5F",
};

// Minimal CSV parser (works for simple CSV without tricky quoted commas)
function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length <= 1) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  const rows = [];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const c = line.split(",");
    rows.push({
      country: c[idx.country] ?? "",
      country_id: Number(c[idx.country_id]),
      year: Number(c[idx.year]),
      type_of_violence: Number(c[idx.type_of_violence]),
      share: Number(c[idx.share]),
    });
  }
  return rows;
}

export default function CountryStackedArea({ countryId, year }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load once
  useEffect(() => {
    let cancelled = false;

    fetch("/data/country_year_type_share.csv")
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        const parsed = parseCSV(text).filter(
          (d) =>
            Number.isFinite(d.country_id) &&
            Number.isFinite(d.year) &&
            Number.isFinite(d.type_of_violence) &&
            Number.isFinite(d.share)
        );
        setRows(parsed);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setRows([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!countryId) return [];

    // Keep narrative range consistent with your project
    const MIN_YEAR = 2000;
    const MAX_YEAR = 2024;

    const filtered = rows.filter(
      (d) =>
        d.country_id === countryId &&
        d.year >= MIN_YEAR &&
        d.year <= MAX_YEAR &&
        (d.type_of_violence === 1 ||
          d.type_of_violence === 2 ||
          d.type_of_violence === 3)
    );

    // Build year -> {year, t1, t2, t3} (share sums to 1)
    const byYear = new Map();
    for (const d of filtered) {
      if (!byYear.has(d.year)) byYear.set(d.year, { year: d.year, t1: 0, t2: 0, t3: 0 });
      const obj = byYear.get(d.year);

      if (d.type_of_violence === 1) obj.t1 = d.share;
      if (d.type_of_violence === 2) obj.t2 = d.share;
      if (d.type_of_violence === 3) obj.t3 = d.share;
    }

    return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
  }, [rows, countryId]);

  if (!countryId) {
    return <div className="text-sm text-gray-500">Select a country</div>;
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (!chartData.length) {
    return (
      <div className="text-sm text-gray-500">
        No data for this country (2000–2024).
      </div>
    );
  }

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            tickMargin={8}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value, name) => [
              `${Math.round(Number(value) * 100)}%`,
              name,
            ]}
            labelFormatter={(lbl) => `Year: ${lbl}`}
          />
          <Legend
            formatter={(key) => key}
            wrapperStyle={{ fontSize: 12 }}
          />

          {/* Vertical marker for global year */}
          {Number.isFinite(year) ? (
            <ReferenceLine x={year} stroke="#1F2937" strokeDasharray="4 2" />
          ) : null}

          <Area
            type="monotone"
            dataKey="t1"
            name={TYPE_LABEL[1]}
            stackId="1"
            stroke={TYPE_COLOR[1]}
            fill={TYPE_COLOR[1]}
            fillOpacity={0.85}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="t2"
            name={TYPE_LABEL[2]}
            stackId="1"
            stroke={TYPE_COLOR[2]}
            fill={TYPE_COLOR[2]}
            fillOpacity={0.85}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="t3"
            name={TYPE_LABEL[3]}
            stackId="1"
            stroke={TYPE_COLOR[3]}
            fill={TYPE_COLOR[3]}
            fillOpacity={0.85}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}