import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseParsed = supabaseUrl ? new URL(supabaseUrl) : null;

const config: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  images: {
    remotePatterns: supabaseParsed
      ? [
          {
            protocol: supabaseParsed.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseParsed.hostname,
            port: supabaseParsed.port || undefined,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
    formats: ["image/avif", "image/webp"],
  },
};

export default config;
