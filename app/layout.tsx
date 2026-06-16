import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://marianaarquiteta.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Arquiteta Mariana Alcântara",
    template: "%s · Arquiteta Mariana Alcântara",
  },
  description:
    "Arquitetura residencial com estética, conforto e propósito. Mais de 1000 ambientes entregues em todo o Brasil.",
  keywords: [
    "arquitetura",
    "design de interiores",
    "projetos residenciais",
    "Mariana Alcântara",
    "Aracaju",
    "ambientação",
  ],
  authors: [{ name: "Mariana Alcântara" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Arquiteta Mariana Alcântara",
    title: "Arquiteta Mariana Alcântara",
    description:
      "Projetos residenciais que unem estética, conforto e propósito.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arquiteta Mariana Alcântara",
    description:
      "Projetos residenciais que unem estética, conforto e propósito.",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-m.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          toastOptions={{
            classNames: {
              toast:
                "bg-bone border border-walnut/20 text-ink font-sans rounded-none shadow-xl",
              title: "text-ink font-medium",
              description: "text-ink/70",
            },
          }}
        />
      </body>
    </html>
  );
}
