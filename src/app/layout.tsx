import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tilbudshjelper – AI-tilbud for snekkere",
  description: "Generer profesjonelle tilbud på sekunder med AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="nb">
        <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
