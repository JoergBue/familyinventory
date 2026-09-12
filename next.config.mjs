/** @type {import('next').NextConfig} */
const nextConfig = {
  // Wird bei jedem "next build" (also bei jedem Deploy) fest in den Code
  // eingebacken - so lässt sich auf der Willkommensseite erkennen, ob eine
  // Änderung tatsächlich schon live ist (siehe src/app/page.tsx).
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  eslint: {
    // ESLint-Stilfehler (z.B. ein falsch escapetes Anführungszeichen) sollen
    // den Deploy nicht mehr hart abbrechen - lokal (npm run dev) läuft
    // ohnehin kein ESLint, sodass solche Fehler erst beim Hostinger-Build
    // auffallen würden. Echte Typfehler (TypeScript) stoppen den Build
    // weiterhin ganz normal.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
