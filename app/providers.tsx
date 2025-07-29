"use client";

import { useEffect } from "react";
import { AlertProvider } from "./components/CustomAlert";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);
  return (
    <AlertProvider>
      {children}
    </AlertProvider>
  );
} 