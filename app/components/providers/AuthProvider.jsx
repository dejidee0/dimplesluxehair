// app/components/AuthProvider.js (New AuthProvider)
"use client";
import { useEffect } from "react";
import { useAuthStore } from "../../../lib/store";

export default function AuthProvider({ children }) {
  const { initialized, initialize, cleanup } = useAuthStore();

  useEffect(() => {
    // Initialize auth when the app mounts
    if (!initialized) {
      initialize();
    }

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [initialized, initialize, cleanup]);

  return <>{children}</>;
}
