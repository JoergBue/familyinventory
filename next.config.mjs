/** @type {import('next').NextConfig} */
const nextConfig = {
  // Wird bei jedem "next build" (also bei jedem Deploy) fest in den Code
  // eingebacken - so lässt sich auf der Willkommensseite erkennen, ob eine
  // Änderung tatsächlich schon live ist (siehe src/app/page.tsx).
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
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
