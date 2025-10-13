import { useEffect, useState } from "react";

const ttlMs = 15 * 60 * 1000; // 15 min

function keyFor(leagueId) {
  return `fixtures_${leagueId}_next10_v1`;
}

export function useFixtures(leagueId) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    if (!leagueId) return;
    let cancelled = false;

    // 1) prøv cache
    try {
      const raw = localStorage.getItem(keyFor(leagueId));
      if (raw) {
        const { data, fetchedAt } = JSON.parse(raw);
        if (Array.isArray(data)) {
          setFixtures(data);
          const isFresh = Date.now() - (fetchedAt || 0) < ttlMs;
          setLoading(!isFresh);
          setStale(!isFresh);
        }
      }
    } catch {}

    // 2) fetch (SWR: revalidate altid)
    const url = `https://v3.football.api-sports.io/fixtures?league=${leagueId}&next=10`;

    fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": apiKey,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const arr = Array.isArray(json?.response) ? json.response : [];
        setFixtures(arr);
        setError("");
        try {
          localStorage.setItem(
            keyFor(leagueId),
            JSON.stringify({ data: arr, fetchedAt: Date.now() })
          );
        } catch {}
      })
      .catch((e) => setError(e?.message ?? "Ukendt fejl"))
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setStale(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [leagueId, apiKey]);

  const refresh = () => {
    // force ignore cache ved at slette key – useEffect vil re-fire hvis du håndterer det udefra,
    // men vi kan også bare trigge et fetch her hvis du vil. Simpelt: bare ryd cache:
    try {
      localStorage.removeItem(keyFor(leagueId));
    } catch {}
    // Caller automatisk igen når komponent mountes på ny; i praksis kan du
    // løse “hard” refresh ved at have en outer key. For nu – giver vi hint i UI hvis stale.
  };

  return { fixtures, loading, error, stale, refresh };
}
