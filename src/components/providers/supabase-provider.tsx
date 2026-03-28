"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";

interface SupabaseContext {
  user: any | null;
  isUserLoading: boolean;
  signOut: () => Promise<void>;
}

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Compatibility layer with Firebase User structure
        setUser({
          ...user,
          uid: user.id,
          id: user.id,
          email: user.email,
          displayName: user.user_metadata?.full_name || user.user_metadata?.nomeCompleto,
          photoURL: user.user_metadata?.avatar_url || user.user_metadata?.fotoUrl,
        });
      } else {
        setUser(null);
      }
      setIsUserLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (session?.user) {
         const user = session.user;
         setUser({
          ...user,
          uid: user.id,
          email: user.email,
          displayName: user.user_metadata?.full_name || user.user_metadata?.nomeCompleto,
          photoURL: user.user_metadata?.avatar_url || user.user_metadata?.fotoUrl,
        });
      } else {
        setUser(null);
      }
      setIsUserLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Context.Provider value={{ user, isUserLoading, signOut }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabaseUser = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabaseUser must be used inside SupabaseProvider");
  }
  return context;
};
