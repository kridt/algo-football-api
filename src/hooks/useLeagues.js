import { useEffect, useState } from "react";

/**
 * Henter leagues for sæson 2025 (samme kald som i dit eksempel).
 */
export function useLeagues() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
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
        }
      })
      .catch((e) => setError(e?.message ?? "Ukendt fejl"))
      .finally(() => !cancelled && setLoading(false));

    return () => (cancelled = true);
  }, [apiKey]);

  return { leagues, loading, error };
}
