import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasBrowserConfig = Boolean(supabaseUrl && supabaseAnonKey);

const previewError = {
  message: "Supabase is not configured for this local preview.",
};

let previewQuery;
previewQuery = new Proxy({}, {
  get: (_target, property) => {
    if (property === "then") {
      return (resolve) => Promise.resolve({ data: [], error: previewError }).then(resolve);
    }

    if (property === "single" || property === "maybeSingle") {
      return async () => ({ data: null, error: previewError });
    }

    return () => previewQuery;
  },
});

const previewClient = {
  from: () => previewQuery,
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ data: null, error: previewError }),
    signUp: async () => ({ data: null, error: previewError }),
  },
};

if (!hasBrowserConfig && process.env.NODE_ENV !== "development") {
  throw new Error("Missing Supabase environment variables");
}

if (!hasBrowserConfig && process.env.NODE_ENV === "development") {
  console.warn("Supabase is not configured; using local preview mode.");
}

export const supabase = hasBrowserConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : previewClient;

// Admin client for server-side operations. This remains strict in every mode.
export const createServerSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing server-side Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
