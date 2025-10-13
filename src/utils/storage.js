const IDS_KEY = "fav_league_ids_v1";
const ENT_KEY = "fav_league_entities_v1"; // id -> full item

export function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem(IDS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function setFavoriteIds(ids) {
  localStorage.setItem(IDS_KEY, JSON.stringify(ids));
}

export function getFavoriteEntitiesMap() {
  try {
    return JSON.parse(localStorage.getItem(ENT_KEY) || "{}");
  } catch {
    return {};
  }
}

export function setFavoriteEntitiesMap(map) {
  localStorage.setItem(ENT_KEY, JSON.stringify(map));
}

export function upsertFavoriteEntity(item) {
  if (!item?.league?.id) return;
  const map = getFavoriteEntitiesMap();
  map[item.league.id] = item;
  setFavoriteEntitiesMap(map);
}

export function removeFavoriteEntity(id) {
  const map = getFavoriteEntitiesMap();
  delete map[id];
  setFavoriteEntitiesMap(map);
}
