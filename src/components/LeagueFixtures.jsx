import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";
import { useFixtures } from "../hooks/useFixtures.js";
import { formatLocalDateTimeFromUnix, fromNowUnix } from "../utils/time.js";

export default function LeagueFixtures({ leagueId }) {
  const { fixtures, loading, error, stale } = useFixtures(leagueId);

  return (
    <div className="fixtures">
      <div className="fixtures-head">
        <div className="fixtures-title">Næste 10 kampe</div>
        {stale && <span className="fixtures-stale">opdaterer…</span>}
      </div>

      {error && <p style={{ color: "#ff7b7b", marginTop: 6 }}>Fejl: {error}</p>}

      <div className="fixtures-list">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div className="fixture-row" key={`fx-sk-${i}`}>
                <Skeleton width={120} />
                <div className="fixture-teams">
                  <div className="fixture-team">
                    <Skeleton circle width={20} height={20} />
                    <Skeleton width={110} />
                  </div>
                  <span className="fixture-vs">vs</span>
                  <div className="fixture-team">
                    <Skeleton circle width={20} height={20} />
                    <Skeleton width={110} />
                  </div>
                </div>
                <Skeleton width={220} />
              </div>
            ))
          : fixtures.map((f) => {
              const fx = f.fixture;
              const hm = f.teams?.home;
              const aw = f.teams?.away;
              const venue = fx?.venue;
              const whenAbs = formatLocalDateTimeFromUnix(fx?.timestamp);
              const whenRel = fromNowUnix(fx?.timestamp);
              const status = fx?.status?.short || "NS";

              return (
                <Link
                  to={`/fixture/${fx?.id}`}
                  state={{ fromFav: true, seed: f }} // giver os teams/league uden ekstra kald
                  className="fixture-link"
                  key={fx?.id}
                >
                  <motion.div
                    className="fixture-row"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 22,
                      mass: 0.6,
                    }}
                  >
                    <div
                      className={`fixture-status tag ${
                        status === "NS" ? "tag-upcoming" : "tag-live"
                      }`}
                    >
                      {status}
                    </div>

                    <div className="fixture-teams">
                      <div className="fixture-team">
                        <img className="team-logo" src={hm?.logo} alt="" />
                        <span className="team-name">{hm?.name}</span>
                      </div>
                      <span className="fixture-vs">vs</span>
                      <div className="fixture-team">
                        <img className="team-logo" src={aw?.logo} alt="" />
                        <span className="team-name">{aw?.name}</span>
                      </div>
                    </div>

                    <div className="fixture-meta">
                      <div className="when">
                        {whenAbs} <span className="when-rel">• {whenRel}</span>
                      </div>
                      <div className="venue">
                        {venue?.name}
                        {venue?.city ? `, ${venue.city}` : ""}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
