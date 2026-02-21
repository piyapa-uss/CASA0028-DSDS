export function buildSankeyData(rows, { year, leftKey = "continent", rightKey = "conflict_type" }) {
  const filtered = rows.filter(d => String(d.year) === String(year));

  // 1) aggregate count per pair
  const pairCount = new Map();
  for (const d of filtered) {
    const a = (d[leftKey] ?? "Unknown").trim?.() ?? String(d[leftKey] ?? "Unknown");
    const b = (d[rightKey] ?? "Unknown").trim?.() ?? String(d[rightKey] ?? "Unknown");
    const k = `${a}__${b}`;
    pairCount.set(k, (pairCount.get(k) ?? 0) + 1);
  }

  // 2) collect node names
  const leftNames = new Set();
  const rightNames = new Set();
  for (const k of pairCount.keys()) {
    const [a, b] = k.split("__");
    leftNames.add(a);
    rightNames.add(b);
  }

  // 3) build nodes with stable ids
  const nodes = [];
  const idByName = new Map();

  // keep “side” separate to avoid same label collision
  const addNode = (name, side) => {
    const key = `${side}:${name}`;
    if (!idByName.has(key)) {
      idByName.set(key, nodes.length);
      nodes.push({ id: nodes.length, name, side });
    }
    return idByName.get(key);
  };

  for (const a of leftNames) addNode(a, "left");
  for (const b of rightNames) addNode(b, "right");

  // 4) build links
  const links = [];
  for (const [k, value] of pairCount.entries()) {
    const [a, b] = k.split("__");
    const source = addNode(a, "left");
    const target = addNode(b, "right");
    links.push({ source, target, value });
  }

  return { nodes, links };
}