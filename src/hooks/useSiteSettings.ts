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
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("key, value");
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((row) => {
        map[row.key] = row.value;
      });
      setSettings(map);
      localStorage.setItem(CACHE_KEY, JSON.stringify(map));
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
