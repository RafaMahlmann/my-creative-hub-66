import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("key, value");
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((row) => {
        map[row.key] = row.value;
      });
      setSettings(map);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  };

  return { settings, updateSetting, refetch: fetchSettings };
}
