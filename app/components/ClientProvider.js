"use client";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../lib/store";

export default function ClientProvider({ children }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
