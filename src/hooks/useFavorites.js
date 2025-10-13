import { useEffect, useMemo, useState } from "react";
import {
  getFavoriteIds,
  setFavoriteIds,
  getFavoriteEntitiesMap,
  setFavoriteEntitiesMap,
  upsertFavoriteEntity,
  removeFavoriteEntity,
} from "../utils/storage.js";

export function useFavorites() {
  const [ids, setIds] = useState(() => getFavoriteIds());
  const [entities, setEntities] = useState(() => getFavoriteEntitiesMap());

  const favSet = useMemo(() => new Set(ids), [ids]);

  const isFav = (id) => favSet.has(id);

  const add = (item) => {
    const id = item?.league?.id;
    if (!id) return;
    if (favSet.has(id)) return;
    const next = [...ids, id];
    setIds(next);
    setFavoriteIds(next);
    upsertFavoriteEntity(item);
    setEntities(getFavoriteEntitiesMap());
  };

  const remove = (id) => {
    if (!favSet.has(id)) return;
    const next = ids.filter((x) => x !== id);
    setIds(next);
    setFavoriteIds(next);
    removeFavoriteEntity(id);
    setEntities(getFavoriteEntitiesMap());
  };

  const toggle = (item) => {
    const id = item?.league?.id;
    if (!id) return;
    if (favSet.has(id)) remove(id);
    else add(item);
  };

  // sync hvis localStorage ændres i anden fane
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "fav_league_ids_v1" || e.key === "fav_league_entities_v1") {
        setIds(getFavoriteIds());
        setEntities(getFavoriteEntitiesMap());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { ids, entities, isFav, add, remove, toggle };
}
