import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Note Enrichment App",
  description: "Enrich your raw notes with AI-powered research and structured summaries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
