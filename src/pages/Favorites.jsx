import { useMemo } from "react";
import { useLeagues } from "../hooks/useLeagues.js";
import { useFavorites } from "../hooks/useFavorites.js";
import LeagueCard from "../components/LeagueCard.jsx";
import LeagueFixtures from "../components/LeagueFixtures.jsx";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Favorites() {
  const { leagues, loading, error } = useLeagues();
  const { ids, entities, isFav, toggle } = useFavorites();

  const cachedList = useMemo(() => {
    return ids.map((id) => entities[id]).filter(Boolean);
  }, [ids, entities]);

  const freshList = useMemo(() => {
    if (!leagues?.length) return cachedList;
    const byId = new Map(leagues.map((x) => [x?.league?.id, x]));
    return ids.map((id) => byId.get(id) || entities[id]).filter(Boolean);
  }, [leagues, ids, entities, cachedList]);

  const showing = freshList.length ? freshList : cachedList;

  return (
    <section>
      <div className="page-head">
        <div>
          <div className="page-title">Dine favoritter</div>
          <div className="page-sub">
            Viser også næste 10 kampe for hver liga.
          </div>
        </div>
        <div className="controls">
          <a className="btn" href="/browse">
            + Tilføj flere
          </a>
        </div>
      </div>

      {error && <p style={{ color: "#ff7b7b" }}>Fejl: {error}</p>}

      <div className="grid">
        {loading && showing.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div className="card" key={`skf-${i}`}>
                <Skeleton height={38} width={58} style={{ borderRadius: 8 }} />
                <div className="meta">
                  <div className="titleline">
                    <Skeleton circle height={18} width={18} />
                    <Skeleton width={180} />
                  </div>
                  <Skeleton width={140} />
                </div>
              </div>
            ))
          : showing.map((item) => (
              <div key={item?.league?.id} className="fav-block">
                <LeagueCard item={item} isFav={isFav} onToggle={toggle} />
                <LeagueFixtures leagueId={item?.league?.id} />
              </div>
            ))}
      </div>

      {!loading && showing.length === 0 && (
        <p className="page-sub" style={{ marginTop: 16 }}>
          Ingen favoritter endnu. Gå til <a href="/browse">Browse</a> og tryk ☆.
        </p>
      )}
    </section>
  );
}
