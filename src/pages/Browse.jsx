import { useMemo, useState } from "react";
import { useLeagues } from "../hooks/useLeagues.js";
import LeagueCard from "../components/LeagueCard.jsx";

export default function Browse() {
  const { leagues, loading, error } = useLeagues();

  // simple client-side søgning/filtrering
  const [q, setQ] = useState("");
  const [countryCode, setCountryCode] = useState("");

  const countries = useMemo(() => {
    const set = new Set(leagues.map((x) => x?.country?.code).filter(Boolean));
    return Array.from(set).sort();
  }, [leagues]);

  const filtered = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    return leagues.filter((x) => {
      const name = x?.league?.name?.toLowerCase() || "";
      const country = (x?.country?.name || "").toLowerCase();
      const code = (x?.country?.code || "").toLowerCase();

      const matchQ = qlc ? name.includes(qlc) || country.includes(qlc) : true;
      const matchCode = countryCode ? code === countryCode.toLowerCase() : true;

      return matchQ && matchCode;
    });
  }, [leagues, q, countryCode]);

  return (
    <section>
      <div className="page-head">
        <div>
          <div className="page-title">Browse alle ligaer</div>
          <div className="page-sub">
            Henter sæson 2025 fra API-Football. Klik ☆ for at gemme som favorit.
          </div>
        </div>
        <div className="controls">
          <input
            className="input"
            placeholder="Søg efter liga eller land…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="select"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            <option value="">Alle lande</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p>Loader…</p>}
      {error && <p style={{ color: "#ff7b7b" }}>Fejl: {error}</p>}

      <div className="grid">
        {filtered.map((item) => (
          <LeagueCard key={item?.league?.id} item={item} />
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="page-sub" style={{ marginTop: 16 }}>
          Ingen resultater. Prøv at rydde filtre.
        </p>
      )}
    </section>
  );
}
