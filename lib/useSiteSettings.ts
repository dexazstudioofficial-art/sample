"use client";

import { useEffect, useState } from "react";

type SettingsMap = Record<string, string>;

const CACHE: SettingsMap = {};
let CACHE_TIME = 0;
const CACHE_TTL = 60_000; // 1 minute

export function useSiteSettings(keys: string[]) {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    const now = Date.now();
    // Use cache if fresh
    if (now - CACHE_TIME < CACHE_TTL && keys.every((k) => k in CACHE)) {
      const result: SettingsMap = {};
      keys.forEach((k) => { result[k] = CACHE[k]; });
      setSettings(result);
      setReady(true);
      return;
    }

    fetch(`/api/public/settings?keys=${keys.join(",")}`)
      .then((r) => r.json())
      .then((data: SettingsMap) => {
        Object.assign(CACHE, data);
        CACHE_TIME = Date.now();
        setSettings(data);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [keys.join(",")]);

  function get(key: string, fallback = ""): string {
    return settings[key] ?? fallback;
  }

  return { get, ready, settings };
}
