import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type User = { name: string; email: string; initials: string };

type SessionContextValue = {
  user: User | null;
  signIn: (email: string) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Prototype session. The root layout guards routes with `user`, so signing in
 * or out is all a screen has to do — the router handles the redirect.
 * Replace `signIn` with a real auth provider when wiring the backend.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = useCallback((email: string) => {
    setUser({ name: 'Mariana', email: email.trim() || 'mariana@hidra.mx', initials: 'MG' });
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ user, signIn, signOut }), [signIn, signOut, user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
