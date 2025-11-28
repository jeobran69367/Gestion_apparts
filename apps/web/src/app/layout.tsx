import type { Metadata } from "next";
import "./globals.css";
import NavigationWrapper from "../components/NavigationWrapper";

export const metadata: Metadata = {
  title: "StudioRent - Location Premium",
  description: "La plateforme n°1 pour la location de studios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className="antialiased"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        suppressHydrationWarning={true}
      >
        <NavigationWrapper />
        {children}
      </body>
    </html>
  );
}
