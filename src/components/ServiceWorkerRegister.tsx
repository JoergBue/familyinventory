"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registrierung fehlgeschlagen - kein kritischer Fehler,
        // die App funktioniert auch ohne Service Worker.
      });
    }
  }, []);

  return null;
}
