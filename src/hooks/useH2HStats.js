import { useEffect, useState } from "react";

const TTL = 15 * 60 * 1000; // 15 min

export const STAT_KEYS = [
  "Shots on Goal",
  "Shots off Goal",
  "Shots insidebox",
  "Shots outsidebox",
  "Total Shots",
  "Blocked Shots",
  "Fouls",
  "Corner Kicks",
  "Offsides",
  "Ball Possession",
  "Yellow Cards",
  "Red Cards",
  "Goalkeeper Saves",
  "Total passes",
  "Passes accurate",
  "Passes %",
];

export const PERCENT_KEYS = new Set(["Ball Possession", "Passes %"]);

const normalize = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && v.endsWith("%"))
    return parseFloat(v.replace("%", ""));
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const cacheKey = (homeId, awayId) => `h2h_avg_${homeId}_${awayId}_ft_last5_v1`;

export function useH2HStats(homeId, awayId) {
  const [loading, setLoading] = useState(Boolean(homeId && awayId));
  const [error, setError] = useState("");
  const [fixtures, setFixtures] = useState([]); // rå H2H fixtures (op til 5)
  const [avgHome, setAvgHome] = useState(new Map()); // Map<statKey, number|null>
  const [avgAway, setAvgAway] = useState(new Map());

  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    if (!homeId || !awayId) return;
    let cancelled = false;

    // cache-læsning
    try {
      const raw = localStorage.getItem(cacheKey(homeId, awayId));
      if (raw) {
        const { data, fetchedAt } = JSON.parse(raw);
        if (data) {
          setFixtures(data.fixtures || []);
          setAvgHome(new Map(data.avgHome || []));
          setAvgAway(new Map(data.avgAway || []));
          setLoading(!(Date.now() - (fetchedAt || 0) < TTL));
        }
      }
    } catch {}

    const h2hUrl = `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${homeId}-${awayId}&status=ft&last=5`;

    fetch(h2hUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": apiKey,
      },
    })
      .then((r) => r.json())
      .then(async (j) => {
        if (cancelled) return;
        const list = Array.isArray(j?.response) ? j.response : [];
        setFixtures(list);

        // hent stats pr. fixture i parallel
        const ids = list.map((x) => x?.fixture?.id).filter(Boolean);
        const perFixture = await Promise.all(
          ids.map((id) =>
            fetch(
              `https://v3.football.api-sports.io/fixtures/statistics?fixture=${id}`,
              {
                method: "GET",
                headers: {
                  "x-rapidapi-host": "v3.football.api-sports.io",
                  "x-rapidapi-key": apiKey,
                },
              }
            )
              .then((r) => r.json())
              .then((jj) => (Array.isArray(jj?.response) ? jj.response : []))
              .catch(() => [])
          )
        );

        // buckets[teamId][statKey] = number[]
        const buckets = {
          [homeId]: Object.fromEntries(STAT_KEYS.map((k) => [k, []])),
          [awayId]: Object.fromEntries(STAT_KEYS.map((k) => [k, []])),
        };

        // Aggreger ALLE fixtures (ikke kun den sidste)
        for (const fixtureStats of perFixture) {
          for (const teamStats of fixtureStats) {
            const tid = teamStats?.team?.id;
            if (tid !== homeId && tid !== awayId) continue;
            const arr = teamStats?.statistics || [];
            const m = new Map(arr.map((s) => [s?.type, s?.value]));
            for (const key of STAT_KEYS) {
              const v = normalize(m.get(key));
              if (v !== null) buckets[tid][key].push(v);
            }
          }
        }

        const makeAvgMap = (obj) => {
          const out = new Map();
          for (const key of STAT_KEYS) {
            const vals = obj[key];
            const avg =
              vals && vals.length
                ? vals.reduce((a, b) => a + b, 0) / vals.length
                : null;
            out.set(key, avg);
          }
          return out;
        };

        const homeMap = makeAvgMap(buckets[homeId]);
        const awayMap = makeAvgMap(buckets[awayId]);

        if (cancelled) return;
        setAvgHome(homeMap);
        setAvgAway(awayMap);
        setError("");

        try {
          localStorage.setItem(
            cacheKey(homeId, awayId),
            JSON.stringify({
              data: {
                fixtures: list,
                avgHome: Array.from(homeMap.entries()),
                avgAway: Array.from(awayMap.entries()),
              },
              fetchedAt: Date.now(),
            })
          );
        } catch {}
      })
      .catch((e) => setError(e?.message ?? "Ukendt fejl"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [homeId, awayId, apiKey]);

  return { fixtures, avgHome, avgAway, loading, error, PERCENT_KEYS };
}
