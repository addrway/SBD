const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://cfzlglnnqyetjtbtixlx.supabase.co";
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem("sbd_session")) || null;
  } catch (error) {
    return null;
  }
}

function setStoredSession(session) {
  if (session) localStorage.setItem("sbd_session", JSON.stringify(session));
  else localStorage.removeItem("sbd_session");
}

async function supabaseFetch(path, options = {}) {
  if (!SUPABASE_KEY) throw new Error("Missing REACT_APP_SUPABASE_KEY");
  const session = getStoredSession();
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${session?.access_token || SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: options.prefer || "return=representation",
    ...options.headers
  };
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || "Supabase request failed");
  return data;
}

export const supabase = {
  getSession() { return getStoredSession(); },
  setSession(session) { setStoredSession(session); },
  async signUp({ email, password, fullName }) {
    const data = await supabaseFetch("/auth/v1/signup", { method: "POST", body: JSON.stringify({ email, password, data: { full_name: fullName } }) });
    if (data?.session) setStoredSession(data.session);
    return data;
  },
  async signIn({ email, password }) {
    const data = await supabaseFetch("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
    setStoredSession(data);
    return data;
  },
  async signOut() {
    const session = getStoredSession();
    if (session?.access_token) await supabaseFetch("/auth/v1/logout", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } }).catch(() => null);
    setStoredSession(null);
  },
  async getUser() {
    const session = getStoredSession();
    if (!session?.access_token) return null;
    return supabaseFetch("/auth/v1/user", { method: "GET", headers: { Authorization: `Bearer ${session.access_token}` } });
  },
  async select(table, query = "") { return supabaseFetch(`/rest/v1/${table}${query}`, { method: "GET", prefer: "" }); },
  async insert(table, rows) { return supabaseFetch(`/rest/v1/${table}`, { method: "POST", body: JSON.stringify(rows) }); },
  async upsert(table, rows, onConflict = "id") {
    return supabaseFetch(`/rest/v1/${table}?on_conflict=${onConflict}`, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(rows) });
  }
};
