import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useEditMode() {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Check if user is already logged in as admin
    const checkSession = async () => {
      console.log("[useEditMode] checking session...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("[useEditMode] session:", session ? session.user.email : "none");
      if (session) {
        const { data } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin" as const,
        });
        console.log("[useEditMode] has_role result:", data);
        if (data) setIsEditing(true);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[useEditMode] onAuthStateChange evento:", _event, "session:", session ? session.user.email : "none");
      if (session) {
        console.log("[useEditMode] RPC has_role ENVIADO para user:", session.user.id);
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin" as const,
        });
        console.log("[useEditMode] RPC has_role RESULTADO:", { data, error: error?.message });
        setIsEditing(!!data);
      } else {
        setIsEditing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isEditing, setIsEditing };
}
