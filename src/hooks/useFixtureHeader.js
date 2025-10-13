import { useEffect, useState } from "react";

const TTL = 15 * 60 * 1000;
const key = (id) => `fixture_header_${id}_v1`;

export function useFixtureHeader(fixtureId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    if (!fixtureId) return;
    let cancelled = false;

    // cache
    try {
      const raw = localStorage.getItem(key(fixtureId));
      if (raw) {
        const { data, fetchedAt } = JSON.parse(raw);
        if (data) {
          setData(data);
          setLoading(!(Date.now() - fetchedAt < TTL));
        }
      }
    } catch {}

    fetch(`https://v3.football.api-sports.io/fixtures?id=${fixtureId}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": apiKey,
      },
    })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const item = Array.isArray(j?.response) ? j.response[0] : null;
        setData(item);
        setError("");
        try {
          localStorage.setItem(
            key(fixtureId),
            JSON.stringify({ data: item, fetchedAt: Date.now() })
          );
        } catch {}
      })
      .catch((e) => setError(e?.message ?? "Ukendt fejl"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [fixtureId, apiKey]);

  return { data, loading, error };
}
