import { useEffect, useState } from "react";

const SETTINGS_KEY = "app_settings_v1";
const DEFAULTS = {
  showCurrentOnly: true,
  hideCups: false,
  enableAnimations: true,
  compactCards: false,
  hideFlags: false,
  sortBy: "name", // name | country | type
  sortDir: "asc", // asc | desc
  blacklistedCountries: [], // array af country codes: ["RO","US",...]
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  // sync på tværs af faner
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SETTINGS_KEY) {
        setSettings(loadSettings());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const replaceBlacklist = (codes) => update({ blacklistedCountries: codes });
  const toggleBlacklistCode = (code) => {
    const set = new Set(settings.blacklistedCountries);
    if (set.has(code)) set.delete(code);
    else set.add(code);
    update({ blacklistedCountries: Array.from(set) });
  };

  return {
    settings,
    update,
    replaceBlacklist,
    toggleBlacklistCode,
    DEFAULTS,
    SETTINGS_KEY,
  };
}
