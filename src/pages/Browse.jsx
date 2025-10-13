import { useMemo, useState } from "react";
import { useLeagues } from "../hooks/useLeagues.js";
import { useFavorites } from "../hooks/useFavorites.js";
import { useSettings } from "../hooks/useSettings.js";
import LeagueCard from "../components/LeagueCard.jsx";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Browse() {
  const { leagues, loading, error } = useLeagues();
  const { isFav, toggle } = useFavorites();
  const { settings } = useSettings();

  const [q, setQ] = useState("");
  const [countryCode, setCountryCode] = useState("");

  const countries = useMemo(() => {
    const set = new Set(leagues.map((x) => x?.country?.code).filter(Boolean));
    return Array.from(set).sort();
  }, [leagues]);

  const filteredBase = useMemo(() => {
    // tekst + dropdown
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

  // anvend settings-filtre
  const filtered = useMemo(() => {
    let arr = filteredBase.slice();

    if (settings.showCurrentOnly) {
      arr = arr.filter(
        (x) => Array.isArray(x?.seasons) && x.seasons[0]?.current === true
      );
    }
    if (settings.hideCups) {
      arr = arr.filter((x) => (x?.league?.type || "").toLowerCase() !== "cup");
    }
    if (settings.blacklistedCountries?.length) {
      const bad = new Set(
        settings.blacklistedCountries.map((c) => c.toLowerCase())
      );
      arr = arr.filter((x) => !bad.has((x?.country?.code || "").toLowerCase()));
    }

    // sortering
    const { sortBy, sortDir } = settings;
    const getKey = (it) => {
      if (sortBy === "country") return it?.country?.name || "";
      if (sortBy === "type") return it?.league?.type || "";
      return it?.league?.name || "";
    };
    arr.sort((a, b) => {
      const A = getKey(a).toLowerCase();
      const B = getKey(b).toLowerCase();
      return sortDir === "desc" ? B.localeCompare(A) : A.localeCompare(B);
    });

    return arr;
  }, [filteredBase, settings]);

  // CSS helper classes
  const densityClass = settings.compactCards
    ? "density-compact"
    : "density-normal";

  return (
    <section className={densityClass}>
      <div className="page-head">
        <div>
          <div className="page-title">Browse alle ligaer</div>
          <div className="page-sub">
            Filtreret efter dine Settings (current:{" "}
            {String(settings.showCurrentOnly)}, cups:{" "}
            {settings.hideCups ? "skjult" : "vises"}).
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
          <a className="btn" href="/settings">
            ⚙ Settings
          </a>
        </div>
      </div>

      {error && <p style={{ color: "#ff7b7b" }}>Fejl: {error}</p>}

      <div className="grid">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => (
              <div className="card" key={`sk-${i}`}>
                <Skeleton
                  height={38}
                  width={58}
                  style={{
                    borderRadius: 8,
                    display: settings.hideFlags ? "none" : "block",
                  }}
                />
                <div className="meta">
                  <div className="titleline">
                    <Skeleton circle height={18} width={18} />
                    <Skeleton width={180} />
                  </div>
                  <Skeleton width={140} />
                  <div className="badges">
                    <Skeleton width={70} height={22} />
                    <Skeleton width={56} height={22} />
                    <Skeleton width={110} height={22} />
                    <Skeleton width={100} height={22} />
                  </div>
                  <div className="actions">
                    <Skeleton width={100} height={34} />
                    <Skeleton width={90} height={34} />
                  </div>
                </div>
              </div>
            ))
          : filtered.map((item) => (
              <LeagueCard
                key={item?.league?.id}
                item={item}
                isFav={isFav}
                onToggle={toggle}
                animate={settings.enableAnimations}
                hideFlag={settings.hideFlags}
                compact={settings.compactCards}
              />
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="page-sub" style={{ marginTop: 16 }}>
          Ingen resultater. Justér dine filtre eller Settings.
        </p>
      )}
    </section>
  );
}
