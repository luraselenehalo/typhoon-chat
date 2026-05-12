"use client";

import { useCallback, useEffect, useState } from "react";
import { clearUser, loadUser, saveUser, type UserPrefs } from "./user";

/**
 * React hook around UserPrefs. `hydrated` flips true after the initial
 * localStorage read so the page can decide whether to show the Onboarding
 * screen — without it we'd flash the wrong UI on first paint.
 */
export function useUser() {
  const [user, setUser] = useState<UserPrefs | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(loadUser());
    setHydrated(true);
  }, []);

  const save = useCallback((u: UserPrefs) => {
    saveUser(u);
    setUser(u);
  }, []);

  const clear = useCallback(() => {
    clearUser();
    setUser(null);
  }, []);

  return { user, hydrated, save, clear };
}
