import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestion Apparts",
  description: "Plateforme de gestion de studios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
