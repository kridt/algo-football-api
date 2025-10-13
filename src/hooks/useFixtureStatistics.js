import { useEffect, useState } from "react";

const TTL = 15 * 60 * 1000;
const key = (id) => `fixture_stats_${id}_v1`;

export function useFixtureStatistics(fixtureId) {
  const [stats, setStats] = useState([]); // array pr team: {team, statistics: [{type,value}]}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    if (!fixtureId) return;
    let cancelled = false;

    try {
      const raw = localStorage.getItem(key(fixtureId));
      if (raw) {
        const { data, fetchedAt } = JSON.parse(raw);
        if (Array.isArray(data)) {
          setStats(data);
          setLoading(!(Date.now() - fetchedAt < TTL));
        }
      }
    } catch {}

    fetch(
      `https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": apiKey,
        },
      }
    )
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const arr = Array.isArray(j?.response) ? j.response : [];
        setStats(arr);
        setError("");
        try {
          localStorage.setItem(
            key(fixtureId),
            JSON.stringify({ data: arr, fetchedAt: Date.now() })
          );
        } catch {}
      })
      .catch((e) => setError(e?.message ?? "Ukendt fejl"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [fixtureId, apiKey]);

  return { stats, loading, error };
}
