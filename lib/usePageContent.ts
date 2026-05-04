"use client";

import { useEffect, useState } from "react";

type ContentMap = Record<string, string>;

// Fetches page content from DB and returns a lookup function
// Usage: const get = usePageContent("home");
//        get("hero", "heading", "Default heading")
export function usePageContent(page: string) {
  const [map, setMap] = useState<ContentMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(`/api/public/pages?page=${page}`)
      .then((r) => r.json())
      .then((data: { raw: { page: string; section: string; key: string; value: string }[] }) => {
        if (!data?.raw) return;
        const m: ContentMap = {};
        data.raw.forEach((item) => {
          m[`${item.section}__${item.key}`] = item.value;
        });
        setMap(m);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [page]);

  function get(section: string, key: string, fallback = ""): string {
    return map[`${section}__${key}`] ?? fallback;
  }

  return { get, ready };
}
