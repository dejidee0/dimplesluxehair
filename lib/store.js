// lib/store.js (Final Fixed Auth Store)
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

// Cart Store (unchanged)
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      currency: "GBP",
      exchangeRate: 1850,
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      setCurrency: (currency) => set({ currency }),
      setExchangeRate: (rate) => set({ exchangeRate: rate }),
      convertPrice: (price) => {
        const { currency, exchangeRate } = get();
        return currency === "NGN" ? price * exchangeRate : price;
      },
    }),
    { name: "cart-storage" }
  )
);

// FINAL AUTH STORE with page visibility fix
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      initialized: false,
      initializationPromise: null, // Track initialization promise

      initialize: async () => {
        // Prevent multiple simultaneous initializations
        if (get().initializationPromise) {
          return get().initializationPromise;
        }

        const initPromise = (async () => {
          // If already initialized, don't reinitialize
          if (get().initialized) {
            return;
          }

          set({ loading: true });

          try {
            const {
              data: { session },
              error,
            } = await supabase.auth.getSession();

            if (error) {
              console.error("Error getting session:", error);
              set({ user: null, loading: false, initialized: true });
              return;
            }

            if (session?.user) {
              const { data: profile, error: profileError } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id)
                .single();

              if (profileError) {
                console.error("Error fetching user profile:", profileError);
                set({ user: null, loading: false, initialized: true });
                return;
              }

              if (profile) {
                set({ user: profile, loading: false, initialized: true });
              } else {
                set({ user: null, loading: false, initialized: true });
              }
            } else {
              set({ user: null, loading: false, initialized: true });
            }

            // Set up auth state listener only once
            if (!get().authSubscription) {
              const {
                data: { subscription },
              } = supabase.auth.onAuthStateChange(async (event, session) => {
                // Only log in development mode
                if (process.env.NODE_ENV === "development") {
                  console.log("Auth state changed:", event);
                }

                if (event === "SIGNED_OUT" || !session) {
                  set({ user: null, loading: false });
                  return;
                }

                if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                  if (session?.user) {
                    set({ loading: true });

                    const { data: profile, error: profileError } =
                      await supabase
                        .from("users")
                        .select("*")
                        .eq("id", session.user.id)
                        .single();

                    if (profileError) {
                      console.error(
                        "Error fetching user profile:",
                        profileError
                      );
                      set({ user: null, loading: false });
                      return;
                    }

                    if (profile) {
                      set({ user: profile, loading: false });
                    } else {
                      set({ user: null, loading: false });
                    }
                  }
                }
              });

              set({ authSubscription: subscription });
            }
          } catch (error) {
            console.error("Error initializing auth:", error);
            set({ user: null, loading: false, initialized: true });
          } finally {
            set({ initializationPromise: null });
          }
        })();

        set({ initializationPromise: initPromise });
        return initPromise;
      },

      // Legacy method for backward compatibility
      restoreSession: async () => {
        if (!get().initialized) {
          await get().initialize();
        }
      },

      setUser: (user) => set({ user, loading: false }),
      setLoading: (loading) => set({ loading }),

      logout: async () => {
        set({ loading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Error signing out:", error);
          }
          set({ user: null, loading: false });
        } catch (error) {
          console.error("Error during logout:", error);
          set({ user: null, loading: false });
        }
      },

      cleanup: () => {
        const subscription = get().authSubscription;
        if (subscription) {
          subscription.unsubscribe();
          set({ authSubscription: null });
        }
      },

      // Reset initialization state (useful for testing)
      resetAuth: () => {
        get().cleanup();
        set({
          user: null,
          loading: true,
          initialized: false,
          initializationPromise: null,
          authSubscription: null,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        // Don't persist loading, initialized, or promises
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reset states that shouldn't be persisted
          state.loading = true;
          state.initialized = false;
          state.initializationPromise = null;
          state.authSubscription = null;

          // Initialize after a brief delay to ensure hydration is complete
          setTimeout(() => {
            state.initialize();
          }, 100);
        }
      },
    }
  )
);

// Other stores remain unchanged...
export const useFilterStore = create((set) => ({
  filters: {
    category: "",
    subcategory: "",
    minPrice: 0,
    maxPrice: 999999,
    search: "",
    sortBy: "name",
    length: "",
    color: "",
    texture: "",
  },
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  clearFilters: () =>
    set({
      filters: {
        category: "",
        subcategory: "",
        minPrice: 0,
        maxPrice: 999999,
        search: "",
        sortBy: "name",
        length: "",
        color: "",
        texture: "",
      },
    }),
}));

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      setWishlist: (wishlist) => set({ wishlist }),
      addToWishlist: (product) => {
        const wishlist = get().wishlist;
        if (!wishlist.find((item) => item.id === product.id)) {
          set({ wishlist: [...wishlist, product] });
        }
      },
      removeFromWishlist: (productId) => {
        set({
          wishlist: get().wishlist.filter((item) => item.id !== productId),
        });
      },
      clearWishlist: () => set({ wishlist: [] }),
      isWishlisted: (productId) => {
        return get().wishlist.some((item) => item.id === productId);
      },
    }),
    { name: "wishlist-storage" }
  )
);

export const useUIStore = create((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeAll: () =>
    set({ isCartOpen: false, isMobileMenuOpen: false, isSearchOpen: false }),
}));
