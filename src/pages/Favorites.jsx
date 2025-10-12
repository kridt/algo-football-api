import { useEffect, useMemo, useState } from "react";
import { useLeagues } from "../hooks/useLeagues.js";
import LeagueCard from "../components/LeagueCard.jsx";
import { getFavoriteIds } from "../utils/storage.js";

export default function Favorites() {
  const { leagues, loading, error } = useLeagues();
  const [version, setVersion] = useState(0); // trigger re-render når fav toggles

  // kun leagues der er i favorites
  const favSet = useMemo(() => new Set(getFavoriteIds()), [version]);
  const favLeagues = useMemo(
    () => leagues.filter((x) => favSet.has(x?.league?.id)),
    [leagues, favSet]
  );

  // force update hvis storage ændres andre steder
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "fav_league_ids_v1") setVersion((v) => v + 1);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <section>
      <div className="page-head">
        <div>
          <div className="page-title">Dine favoritter</div>
          <div className="page-sub">
            Forsiden viser kun leagues du har markeret ★ på.
          </div>
        </div>
        <div className="controls">
          <a className="btn" href="/browse">
            + Tilføj flere
          </a>
        </div>
      </div>

      {loading && <p>Loader…</p>}
      {error && <p style={{ color: "#ff7b7b" }}>Fejl: {error}</p>}

      <div className="grid">
        {favLeagues.map((item) => (
          <LeagueCard
            key={item?.league?.id}
            item={item}
            onToggle={() => setVersion((v) => v + 1)}
          />
        ))}
      </div>

      {!loading && favLeagues.length === 0 && (
        <p className="page-sub" style={{ marginTop: 16 }}>
          Ingen favoritter endnu. Gå til <a href="/browse">Browse</a> og tryk ☆.
        </p>
      )}
    </section>
  );
}
