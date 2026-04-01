
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Auth context
export interface AuthContextState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  signOut: () => Promise<void>;
}

// React Context
export const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * SupabaseAuthProvider manages and provides user authentication state.
 */
export const SupabaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const syncUser = async () => {
      const { data: { user: sbUser }, error } = await supabase.auth.getUser();
      setUserAuthState({
        user: sbUser,
        isUserLoading: false,
        userError: error as Error | null
      });
    };

    syncUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserAuthState({
        user: session?.user || null,
        isUserLoading: false,
        userError: null
      });
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const contextValue = useMemo((): AuthContextState => {
    return {
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [userAuthState, supabase]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider.');
  }
  return context;
};

