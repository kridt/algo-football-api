import { useLocation, useParams, Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { motion } from "framer-motion";
import { useFixtureHeader } from "../hooks/useFixtureHeader.js";
import { useFixtureStatistics } from "../hooks/useFixtureStatistics.js";
import { useTeamStatistics } from "../hooks/useTeamStatistics.js";
import { formatLocalDateTimeFromUnix, fromNowUnix } from "../utils/time.js";
import H2HStats from "../components/H2HStats.jsx";

function toNum(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && v.endsWith("%"))
    return parseFloat(v.replace("%", ""));
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  if (typeof v === "number") return v;
  return null;
}

export default function FixtureDetails() {
  const { fixtureId } = useParams();
  const { state } = useLocation();
  const seed = state?.seed; // fixture fra favorites (valgfrit)

  const {
    data: header,
    loading: hdrLoad,
    error: hdrErr,
  } = useFixtureHeader(fixtureId);
  const {
    stats,
    loading: statsLoad,
    error: statsErr,
  } = useFixtureStatistics(fixtureId);

  // Brug seed hvis header ikke er klar endnu
  const leagueId = header?.league?.id ?? seed?.league?.id;
  const home = header?.teams?.home ?? seed?.teams?.home;
  const away = header?.teams?.away ?? seed?.teams?.away;
  const fx = header?.fixture ?? seed?.fixture;

  const homeStatsRaw =
    stats.find((s) => s.team?.id === home?.id)?.statistics || [];
  const awayStatsRaw =
    stats.find((s) => s.team?.id === away?.id)?.statistics || [];

  // Map type -> value for begge
  const hMap = new Map(homeStatsRaw.map((x) => [x.type, x.value]));
  const aMap = new Map(awayStatsRaw.map((x) => [x.type, x.value]));

  // Fælles nøgler i en pæn rækkefølge
  const order = [
    "Ball Possession",
    "Total Shots",
    "Shots on Goal",
    "Shots off Goal",
    "Blocked Shots",
    "Corner Kicks",
    "Offsides",
    "Goalkeeper Saves",
    "Fouls",
    "Yellow Cards",
    "Red Cards",
    "Total passes",
    "Passes accurate",
    "Passes %",
  ];
  const keys = Array.from(
    new Set([
      ...order,
      ...homeStatsRaw.map((x) => x.type),
      ...awayStatsRaw.map((x) => x.type),
    ])
  );

  // Team season stats (små info-bokse)
  const { data: homeSeason, loading: hsLoad } = useTeamStatistics(
    leagueId,
    home?.id
  );
  const { data: awaySeason, loading: asLoad } = useTeamStatistics(
    leagueId,
    away?.id
  );

  const whenAbs = fx?.timestamp
    ? formatLocalDateTimeFromUnix(fx.timestamp)
    : "—";
  const whenRel = fx?.timestamp ? fromNowUnix(fx.timestamp) : "";
  const venue = fx?.venue;

  return (
    <section>
      <div className="page-head">
        <div>
          <div className="page-title">Kamp</div>
          <div className="page-sub">Detaljer &amp; statistik</div>
        </div>
        <div className="controls">
          <Link className="btn" to={state?.fromFav ? "/favorites" : "/browse"}>
            ← Tilbage
          </Link>
        </div>
      </div>

      {hdrErr && <p style={{ color: "#ff7b7b" }}>Fejl: {hdrErr}</p>}
      {statsErr && <p style={{ color: "#ff7b7b" }}>Fejl: {statsErr}</p>}

      {/* HERO */}
      <div className="match-hero">
        <div className="mh-team">
          {hdrLoad ? (
            <Skeleton circle width={48} height={48} />
          ) : (
            <img src={home?.logo} className="mh-logo" alt="" />
          )}
          <div className="mh-name">
            {home?.name || <Skeleton width={120} />}
          </div>
        </div>

        <div className="mh-center">
          <div className="mh-time">
            {hdrLoad ? (
              <Skeleton width={220} />
            ) : (
              <>
                {whenAbs} <span className="when-rel">• {whenRel}</span>
              </>
            )}
          </div>
          <div className="mh-venue">
            {hdrLoad ? (
              <Skeleton width={260} />
            ) : (
              <>
                {venue?.name}
                {venue?.city ? `, ${venue.city}` : ""}
              </>
            )}
          </div>
        </div>

        <div className="mh-team">
          {hdrLoad ? (
            <Skeleton circle width={48} height={48} />
          ) : (
            <img src={away?.logo} className="mh-logo" alt="" />
          )}
          <div className="mh-name">
            {away?.name || <Skeleton width={120} />}
          </div>
        </div>
      </div>

      {/* TEAM INFO BOXES */}
      <div className="team-info-grid">
        <TeamInfoCard
          title="Hjemme"
          team={homeSeason?.team}
          data={homeSeason}
          loading={hsLoad}
        />
        <TeamInfoCard
          title="Ude"
          team={awaySeason?.team}
          data={awaySeason}
          loading={asLoad}
        />
      </div>

      {/* STATS COMPARE */}
      <div className="panel" style={{ marginTop: 16 }}>
        <h3 className="panel-title">Kamp-statistik</h3>
        <H2HStats
          leagueId={leagueId}
          homeId={home?.id}
          awayId={away?.id}
          homeName={home?.name}
          awayName={away?.name}
        />

        {statsLoad && (
          <div style={{ display: "grid", gap: 10 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div className="stat-row" key={`sk-${i}`}>
                <Skeleton width={80} />
                <div className="stat-bars">
                  <Skeleton height={14} />
                </div>
                <Skeleton width={80} />
              </div>
            ))}
          </div>
        )}

        {!statsLoad && (
          <div className="stats-grid">
            {keys.map((k) => {
              const hv = hMap.get(k);
              const av = aMap.get(k);
              if (hv === undefined && av === undefined) return null;

              // normaliser tal hvis muligt
              const hn = toNum(hv);
              const an = toNum(av);
              let left = hv ?? "—";
              let right = av ?? "—";

              // bar width
              const hasNumbers = hn !== null && an !== null;
              let lw = 50,
                rw = 50;
              if (hasNumbers) {
                const sum = hn + an || 1;
                lw = Math.round((hn / sum) * 100);
                rw = 100 - lw;
              }

              return (
                <motion.div
                  className="stat-row"
                  key={k}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 22,
                    mass: 0.6,
                  }}
                >
                  <div className="stat-left">{left}</div>
                  <div className="stat-bars" title={k}>
                    <div className="bar bar-left" style={{ width: `${lw}%` }} />
                    <div className="stat-label">{k}</div>
                    <div
                      className="bar bar-right"
                      style={{ width: `${rw}%` }}
                    />
                  </div>
                  <div className="stat-right">{right}</div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function TeamInfoCard({ title, team, data, loading }) {
  const logo = team?.logo;
  const name = team?.name;

  const played = data?.fixtures?.played?.total ?? 0;
  const wins = data?.fixtures?.wins?.total ?? 0;
  const draws = data?.fixtures?.draws?.total ?? 0;
  const loses = data?.fixtures?.loses?.total ?? 0;

  const gf = data?.goals?.for?.total?.total ?? null;
  const ga = data?.goals?.against?.total?.total ?? null;

  const avgFor = data?.goals?.for?.average || {};
  const avgAg = data?.goals?.against?.average || {};

  // helper til pæn visning (string->tal eller "—")
  const asNum = (v) => {
    if (v === null || v === undefined) return "—";
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isFinite(n) ? n.toFixed(1) : "—";
  };

  const formStr = (data?.form || "").trim().toUpperCase(); // fx "LDWLWLW"
  const formArr = formStr.split("").filter((c) => ["W", "D", "L"].includes(c));

  return (
    <div className="panel">
      <div className="teaminfo-head">
        {loading ? (
          <Skeleton circle width={32} height={32} />
        ) : (
          <img src={logo} className="teaminfo-logo" alt="" />
        )}
        <div className="teaminfo-title">{title}</div>
        <div className="teaminfo-name">
          {loading ? <Skeleton width={140} /> : name}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          <Skeleton width={220} />
          <Skeleton width={160} />
          <Skeleton width={180} />
          <Skeleton width={260} />
        </div>
      ) : (
        <div className="teaminfo-body">
          <div className="ti-row">
            <span>Kampe</span>
            <span>{played}</span>
          </div>
          <div className="ti-row">
            <span>W-D-L</span>
            <span>
              {wins}-{draws}-{loses}
            </span>
          </div>
          <div className="ti-row">
            <span>Mål (for/imod)</span>
            <span>
              {gf ?? "—"} / {ga ?? "—"}
            </span>
          </div>

          {/* Gennemsnit mål pr. kamp */}
          <div className="ti-section-title">Gns. mål pr. kamp</div>
          <div className="avg-grid">
            <div className="avg-col">
              <div className="avg-head">Total</div>
              <div className="avg-line">
                <span>For</span>
                <strong>{asNum(avgFor.total)}</strong>
              </div>
              <div className="avg-line">
                <span>Imod</span>
                <strong>{asNum(avgAg.total)}</strong>
              </div>
            </div>
            <div className="avg-col">
              <div className="avg-head">Hjemme</div>
              <div className="avg-line">
                <span>For</span>
                <strong>{asNum(avgFor.home)}</strong>
              </div>
              <div className="avg-line">
                <span>Imod</span>
                <strong>{asNum(avgAg.home)}</strong>
              </div>
            </div>
            <div className="avg-col">
              <div className="avg-head">Ude</div>
              <div className="avg-line">
                <span>For</span>
                <strong>{asNum(avgFor.away)}</strong>
              </div>
              <div className="avg-line">
                <span>Imod</span>
                <strong>{asNum(avgAg.away)}</strong>
              </div>
            </div>
          </div>

          {/* Clean sheets / Failed to score */}
          <div className="ti-pills">
            <div className="pill pill-clean">
              Clean sheets: <strong>{data?.clean_sheet?.total ?? 0}</strong>
            </div>
            <div className="pill pill-fts">
              Failed to score:{" "}
              <strong>{data?.failed_to_score?.total ?? 0}</strong>
            </div>
          </div>

          {/* Form som farvede chips */}
          <div className="ti-section-title">Form</div>
          <div className="form-chips" title="Seneste kampe">
            {formArr.length === 0 && <span className="page-sub">—</span>}
            {formArr.map((c, i) => (
              <span
                key={i}
                className={`form-chip ${
                  c === "W" ? "win" : c === "D" ? "draw" : "loss"
                }`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
