import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "site_settings";

// Cache em nível de módulo - sobrevive re-montagens de componentes
let moduleCache: Record<string, string> | null = null;

function loadCache(): Record<string, string> {
  if (moduleCache) return moduleCache;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      moduleCache = JSON.parse(cached);
      return moduleCache!;
    }
  } catch {
    // localStorage pode não funcionar em iframes
  }
  return {};
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>(loadCache);
  const [isLoading, setIsLoading] = useState(() => {
    const cached = loadCache();
    return Object.keys(cached).length === 0;
  });

  const fetchSettings = async () => {
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error) {
      console.error("[useSiteSettings] fetch error:", error);
      setIsLoading(false);
      return;
    }
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((row) => {
        map[row.key] = row.value;
      });
      moduleCache = map;
      setSettings(map);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(map));
      } catch {
        // localStorage may be unavailable in some iframe contexts
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  };

  return { settings, isLoading, updateSetting, refetch: fetchSettings };
}
