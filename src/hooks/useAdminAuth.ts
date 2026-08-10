import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isDevAdminUI } from '@/lib/devAdmin';

export function useAdminAuth() {
  // Só destrava a interface no desenvolvimento local; o banco segue mandando.
  const devAdmin = isDevAdminUI();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const check = async (userId?: string) => {
      if (!userId) {
        if (active) {
          setIsAdmin(false);
          setEmail(null);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      if (active) {
        setIsAdmin(!!data);
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
      setTimeout(() => check(session?.user?.id), 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
      check(session?.user?.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin: isAdmin || devAdmin, loading: loading && !devAdmin, email, devAdmin };
}
