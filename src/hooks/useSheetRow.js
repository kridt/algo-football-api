// hooks/useSheetRow.js
import { useEffect, useState } from "react";

const SHEET_ID = "1lJ-kkhy3SspUWfOPG9NXNaO0NoERSKHLUp0fKGrc2w8";
const GID = 0;

// Robust parser: klip alt før første { og efter sidste }
function parseGVizToJSON(txt) {
  const start = txt.indexOf("{");
  const end = txt.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Ugyldigt GViz-respons");
  }
  return JSON.parse(txt.slice(start, end + 1));
}

function mapRows(json) {
  const cols = (json.table?.cols || []).map((c, i) =>
    (c.label || c.id || String.fromCharCode(65 + i)).trim()
  );
  const rows = (json.table?.rows || []).map((r) => {
    const obj = {};
    cols.forEach((h, i) => {
      obj[h] = r.c?.[i]?.v ?? null;
    });
    return obj;
  });
  return rows;
}

async function fetchSheetRowById(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) throw new Error("homeId skal være et tal");

  // Filtrér i Sheets: kolonne A = id
  const tq = encodeURIComponent(`select * where A = ${n}`);
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}&tq=${tq}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const txt = await res.text();
  const json = parseGVizToJSON(txt);
  const rows = mapRows(json);
  if (!rows.length) return null;

  const r = rows[0];

  const minder_om =
    typeof r["minder om"] === "string"
      ? r["minder om"]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : Array.isArray(r["minder om"])
      ? r["minder om"]
      : [];

  return {
    id: r.id != null ? Number(r.id) : null,
    holdnavn: r.holdnavn ?? null,
    liga: r.liga ?? null,
    land: r.land ?? null,
    minder_om,
    spillestile: r.spillestile ?? null,
  };
}

export function useSheetRow(homeId) {
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(Boolean(homeId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let dead = false;

    async function run() {
      if (homeId == null) {
        setRow(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSheetRowById(homeId);
        if (!dead) setRow(data);
      } catch (e) {
        if (!dead) setError(e);
      } finally {
        if (!dead) setLoading(false);
      }
    }

    run();
    return () => {
      dead = true;
    };
  }, [homeId]);

  return { row, loading, error };
}
