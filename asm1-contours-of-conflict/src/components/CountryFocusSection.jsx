import { useEffect, useMemo, useState } from "react";
import CountryStackedArea from "./CountryStackedArea";

export default function CountryFocusSection({ year }) {
  const [countryOptions, setCountryOptions] = useState([]);
  const [countryId, setCountryId] = useState(null);

  // Load dropdown options from country_year_type_share.csv (has country_id)
  useEffect(() => {
  Promise.all([
    fetch("/data/country_year_summary.csv").then((r) => r.text()),
    fetch("/data/country_year_type_share.csv").then((r) => r.text()),
  ])
    .then(([summaryText, shareText]) => {
      // --- 1) build country -> iso3 map from summary ---
      const sLines = summaryText.trim().split("\n");
      const sHeader = sLines[0].split(",").map((h) => h.trim());
      const sIdx = Object.fromEntries(sHeader.map((h, i) => [h, i]));

      const iso3ByCountry = new Map();
      for (const line of sLines.slice(1)) {
        const c = line.split(",");
        const country = (c[sIdx.country] ?? "").trim();
        const iso3 = (c[sIdx.iso3] ?? "").trim();
        if (country && iso3 && !iso3ByCountry.has(country)) iso3ByCountry.set(country, iso3);
      }

      // --- 2) read unique country_id + country from type_share ---
      const lines = shareText.trim().split("\n");
      const header = lines[0].split(",").map((h) => h.trim());
      const idx = Object.fromEntries(header.map((h, i) => [h, i]));

      const seen = new Map();
      for (const line of lines.slice(1)) {
        const c = line.split(",");
        const id = Number(c[idx.country_id]);
        if (Number.isNaN(id)) continue;

        const name = (c[idx.country] ?? "Unknown").trim();
        if (!seen.has(id)) {
          seen.set(id, {
            id,
            name,
            iso3: iso3ByCountry.get(name) ?? "",
          });
        }
      }

      const list = Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
      setCountryOptions(list);
    })
    .catch(() => setCountryOptions([]));
    }, []);

  const selectedLabel = useMemo(() => {
    const hit = countryOptions.find((d) => d.id === countryId);
    return hit ? `${hit.name} (${hit.iso3})` : null;
  }, [countryOptions, countryId]);

  return (
    <section id="country" className="w-full bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold">Country focus</h2>
        <p className="mt-2 text-sm text-gray-600">
          Country timeline breakdown by type (share).
        </p>

        {/* Dropdown */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700">
            Select a country
          </label>

          <select
            className="mt-2 w-full rounded-md border px-3 py-2"
            value={countryId ?? ""}
            onChange={(e) =>
              setCountryId(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Select a country…</option>
            {countryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.iso3})
              </option>
            ))}
          </select>

          {selectedLabel ? (
            <div className="mt-2 text-xs text-gray-500">
              Selected: <span className="font-medium">{selectedLabel}</span>
            </div>
          ) : null}
        </div>

        {/* Chart card */}
        <div className="mt-6 rounded-lg border p-6">
          <CountryStackedArea countryId={countryId} year={year} />
        </div>
      </div>
    </section>
  );
}