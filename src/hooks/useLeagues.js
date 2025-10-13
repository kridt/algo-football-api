import { useEffect, useState } from "react";

const LIST_KEY = "cache_leagues_2025_v1";

export function useLeagues() {
  const [leagues, setLeagues] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(leagues.length === 0); // skeleton kun hvis intet i cache
  const [error, setError] = useState("");
  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    let cancelled = false;

    fetch("https://v3.football.api-sports.io/leagues?season=2025", {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": apiKey,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data || !Array.isArray(data.response)) {
          setError("Uventet API-svar.");
        } else {
          setLeagues(data.response);
          localStorage.setItem(LIST_KEY, JSON.stringify(data.response));
        }
      })
      .catch((e) => setError(e?.message ?? "Ukendt fejl"))
      .finally(() => !cancelled && setLoading(false));

    return () => (cancelled = true);
  }, [apiKey]);

  return { leagues, loading, error };
}
