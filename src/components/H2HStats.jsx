import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { motion } from "framer-motion";
import { useH2HStats, STAT_KEYS } from "../hooks/useH2HStats.js";
import { formatLocalDateTimeFromUnix, fromNowUnix } from "../utils/time.js";

export default function H2HStats({ homeId, awayId }) {
  const { fixtures, avgHome, avgAway, loading, error, PERCENT_KEYS } =
    useH2HStats(homeId, awayId);

  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <h3 className="panel-title">Head-to-Head (seneste 5) – gennemsnit</h3>

      {fixtures?.length ? (
        <div className="panel-sub h2h-fixture-tags" style={{ marginBottom: 8 }}>
          {fixtures.map((f) => {
            const t = f.fixture?.timestamp;
            const h = f.teams?.home?.name;
            const a = f.teams?.away?.name;
            const hs = f.goals?.home;
            const as = f.goals?.away;
            return (
              <span className="h2h-tag" key={f.fixture?.id}>
                <span className="h2h-tag-line">
                  {h} {hs ?? "?"}–{as ?? "?"} {a}
                </span>
                <span className="h2h-tag-date">
                  {formatLocalDateTimeFromUnix(t)} • {fromNowUnix(t)}
                </span>
              </span>
            );
          })}
        </div>
      ) : null}

      {error && <p style={{ color: "#ff7b7b" }}>Fejl: {error}</p>}

      {loading ? (
        <div style={{ display: "grid", gap: 10 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div className="stat-row" key={`h2h-sk-${i}`}>
              <Skeleton width={80} />
              <div className="stat-bars">
                <Skeleton height={14} />
              </div>
              <Skeleton width={80} />
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          {STAT_KEYS.map((k) => {
            const hv = avgHome.get(k);
            const av = avgAway.get(k);
            if (hv === null && av === null) return null;

            const leftText =
              hv === null
                ? "—"
                : PERCENT_KEYS.has(k)
                ? `${hv.toFixed(1)}%`
                : hv.toFixed(1);
            const rightText =
              av === null
                ? "—"
                : PERCENT_KEYS.has(k)
                ? `${av.toFixed(1)}%`
                : av.toFixed(1);

            let lw = 50,
              rw = 50;
            if (hv !== null && av !== null) {
              const sum = hv + av || 1;
              lw = Math.round((hv / sum) * 100);
              rw = 100 - lw;
            }

            return (
              <motion.div
                className="stat-row"
                key={`h2h-${k}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 22,
                  mass: 0.6,
                }}
              >
                <div className="stat-left">{leftText}</div>
                <div className="stat-bars" title={k}>
                  <div className="bar bar-left" style={{ width: `${lw}%` }} />
                  <div className="stat-label">{k}</div>
                  <div className="bar bar-right" style={{ width: `${rw}%` }} />
                </div>
                <div className="stat-right">{rightText}</div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
