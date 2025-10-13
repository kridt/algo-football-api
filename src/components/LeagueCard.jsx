import { motion } from "framer-motion";

export default function LeagueCard({
  item,
  isFav,
  onToggle,
  animate = true,
  hideFlag = false,
  compact = false,
}) {
  const league = item?.league;
  const country = item?.country;
  const season = Array.isArray(item?.seasons) ? item.seasons[0] : null;

  const id = league?.id;
  const fav = isFav?.(id);

  const start = season?.start
    ? new Date(season.start).toLocaleDateString()
    : "—";
  const end = season?.end ? new Date(season.end).toLocaleDateString() : "—";

  const Card = animate ? motion.div : "div";

  return (
    <Card
      className={`card ${compact ? "card-compact" : ""}`}
      {...(animate
        ? {
            initial: { opacity: 0, y: 6, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            transition: {
              type: "spring",
              stiffness: 220,
              damping: 22,
              mass: 0.6,
            },
            whileHover: { y: -2 },
          }
        : {})}
    >
      {!hideFlag && (
        <img
          className="flag"
          src={country?.flag}
          alt={`${country?.name} flag`}
        />
      )}
      <div className="meta">
        <div className="titleline">
          <img className="league-logo" src={league?.logo} alt="logo" />
          <div className="name">{league?.name ?? "Ukendt liga"}</div>
        </div>
        <div className="country">
          {country?.name} • Code: {country?.code}
        </div>

        <div className="badges">
          <div className="badge">Type: {league?.type ?? "—"}</div>
          <div className="badge ok">{season?.year ?? "2025"}</div>
          <div className="badge">Start: {start}</div>
          <div className="badge">End: {end}</div>
          {season?.current ? <div className="badge ok">Current</div> : null}
        </div>

        <div className="actions">
          <button
            className={`iconbtn fav ${fav ? "active" : ""}`}
            onClick={() => onToggle?.(item)}
            title={fav ? "Fjern fra favoritter" : "Tilføj til favoritter"}
          >
            {fav ? "★ Favorit" : "☆ Favorit"}
          </button>
          <a
            className="iconbtn"
            href={league?.logo}
            target="_blank"
            rel="noreferrer"
          >
            Åbn logo
          </a>
        </div>
      </div>
    </Card>
  );
}
