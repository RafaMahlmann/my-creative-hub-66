import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "site_settings";

function loadFromCache(): Record<string, string> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>(loadFromCache);
  const [isLoading, setIsLoading] = useState(() => {
    // If we have cached data, we're not "loading" from the user's perspective
    const cached = loadFromCache();
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
