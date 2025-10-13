import { useMemo, useState } from "react";
import { useSettings } from "../hooks/useSettings.js";
import { useLeagues } from "../hooks/useLeagues.js";

export default function Settings() {
  const { settings, update, replaceBlacklist, toggleBlacklistCode, DEFAULTS } =
    useSettings();
  const { leagues } = useLeagues(); // bruger cache hvis den findes
  const [query, setQuery] = useState("");

  // Unik liste over lande (code->name) fra data
  const countries = useMemo(() => {
    const map = new Map();
    for (const x of leagues) {
      const code = x?.country?.code;
      const name = x?.country?.name;
      if (code && name) map.set(code, name);
    }
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [leagues]);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countries, query]);

  const isBlacklisted = (code) => settings.blacklistedCountries.includes(code);

  const selectAllVisible = () => {
    const codes = new Set(settings.blacklistedCountries);
    filteredCountries.forEach((c) => codes.add(c.code));
    replaceBlacklist(Array.from(codes));
  };
  const clearAllVisible = () => {
    const toRemove = new Set(filteredCountries.map((c) => c.code));
    replaceBlacklist(
      settings.blacklistedCountries.filter((c) => !toRemove.has(c))
    );
  };
  const resetAll = () => update({ ...DEFAULTS, blacklistedCountries: [] });

  return (
    <section>
      <div className="page-head">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">Gemmes automatisk i din browser.</div>
        </div>
        <div className="controls">
          <button className="btn" onClick={resetAll}>
            Nulstil alt
          </button>
        </div>
      </div>

      <div className="settings-grid">
        {/* Generelle toggles */}
        <div className="panel">
          <h3 className="panel-title">Visning</h3>

          <Toggle
            label="Kun aktuelle sæsoner"
            checked={settings.showCurrentOnly}
            onChange={(v) => update({ showCurrentOnly: v })}
          />
          <Toggle
            label="Skjul Cups"
            checked={settings.hideCups}
            onChange={(v) => update({ hideCups: v })}
          />
          <Toggle
            label="Kompakte kort"
            checked={settings.compactCards}
            onChange={(v) => update({ compactCards: v })}
          />
          <Toggle
            label="Skjul flag"
            checked={settings.hideFlags}
            onChange={(v) => update({ hideFlags: v })}
          />
          <Toggle
            label="Animationer"
            checked={settings.enableAnimations}
            onChange={(v) => update({ enableAnimations: v })}
          />

          <div className="row">
            <label className="label">Sortering</label>
            <div className="row-inline">
              <select
                className="select"
                value={settings.sortBy}
                onChange={(e) => update({ sortBy: e.target.value })}
              >
                <option value="name">Liga-navn</option>
                <option value="country">Land</option>
                <option value="type">Type</option>
              </select>
              <select
                className="select"
                value={settings.sortDir}
                onChange={(e) => update({ sortDir: e.target.value })}
              >
                <option value="asc">Stigende</option>
                <option value="desc">Faldende</option>
              </select>
            </div>
          </div>
        </div>

        {/* Country blacklist */}
        <div className="panel">
          <h3 className="panel-title">Blacklist lande (skjules i Browse)</h3>
          <div className="row">
            <input
              className="input"
              placeholder="Søg land eller kode…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="row-inline">
              <button className="btn" onClick={selectAllVisible}>
                Markér alle (viste)
              </button>
              <button className="btn" onClick={clearAllVisible}>
                Fjern alle (viste)
              </button>
            </div>
          </div>

          <div className="country-list">
            {filteredCountries.map((c) => (
              <button
                key={c.code}
                className={`country-chip ${
                  isBlacklisted(c.code) ? "blocked" : ""
                }`}
                onClick={() => toggleBlacklistCode(c.code)}
                title={
                  isBlacklisted(c.code)
                    ? "Klik for at tillade"
                    : "Klik for at blokere"
                }
              >
                <span className="chip-code">{c.code}</span>
                <span className="chip-name">{c.name}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="page-sub" style={{ marginTop: 8 }}>
                Ingen lande matcher.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="row">
      <span className="label">{label}</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider" />
      </label>
    </div>
  );
}
