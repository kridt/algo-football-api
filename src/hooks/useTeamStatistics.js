import { useEffect, useState } from "react";

const TTL = 15 * 60 * 1000;
const key = (leagueId, teamId) => `team_stats_${leagueId}_${teamId}_2025_v1`;

export function useTeamStatistics(leagueId, teamId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(leagueId && teamId));
  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    if (!leagueId || !teamId) return;
    let cancelled = false;

    try {
      const raw = localStorage.getItem(key(leagueId, teamId));
      if (raw) {
        const { data, fetchedAt } = JSON.parse(raw);
        if (data) {
          setData(data);
          setLoading(!(Date.now() - fetchedAt < TTL));
        }
      }
    } catch {}

    const url = `https://v3.football.api-sports.io/teams/statistics?league=${leagueId}&team=${teamId}&season=2025`;
    fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": apiKey,
      },
    })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const obj = j?.response || null;
        setData(obj);
        setError("");
        try {
          localStorage.setItem(
            key(leagueId, teamId),
            JSON.stringify({ data: obj, fetchedAt: Date.now() })
          );
        } catch {}
      })
      .catch((e) => setError(e?.message ?? "Ukendt fejl"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [leagueId, teamId, apiKey]);

  return { data, loading, error };
}
