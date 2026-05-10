import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => supabase.getSession());
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async function loadProfile(activeSession = session) {
    if (!activeSession?.access_token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const authUser = await supabase.getUser();
      setUser(authUser);
      const rows = await supabase.select("profiles", `?id=eq.${authUser.id}&select=*`);
      setProfile(rows?.[0] || null);
      return rows?.[0] || null;
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadProfile(session);
  }, [loadProfile, session]);

  async function signUp({ fullName, email, password }) {
    const data = await supabase.signUp({ fullName, email, password });
    const nextSession = data.session || supabase.getSession();
    setSession(nextSession);
    if (nextSession) await loadProfile(nextSession);
    return data;
  }

  async function signIn({ email, password }) {
    const data = await supabase.signIn({ email, password });
    setSession(data);
    await loadProfile(data);
    return data;
  }

  async function signOut() {
    await supabase.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }

  function hoursLeft() {
    if (!profile?.trial_ends) return 0;
    return Math.max(0, Math.ceil((new Date(profile.trial_ends).getTime() - Date.now()) / 3600000));
  }

  function trialActive() {
    if (!profile) return false;
    if (profile.plan && profile.plan !== "trial") return true;
    return hoursLeft() > 0;
  }

  function planLabel() {
    if (!profile?.plan) return "Trial";
    return profile.plan === "trial" ? "24-hour trial" : profile.plan;
  }

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: loadProfile,
    trialActive,
    hoursLeft,
    planLabel
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
