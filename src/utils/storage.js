const KEY = "fav_league_ids_v1";

export function getFavoriteIds() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setFavoriteIds(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function toggleFavorite(id) {
  const ids = new Set(getFavoriteIds());
  if (ids.has(id)) ids.delete(id);
  else ids.add(id);
  const arr = Array.from(ids);
  setFavoriteIds(arr);
  return arr;
}

export function isFavorite(id) {
  return getFavoriteIds().includes(id);
}
