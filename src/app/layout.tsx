import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | Illinois Probate Directory",
    default: "Illinois Probate Directory – Find a Probate Attorney in Illinois",
  },
  description:
    "Find experienced probate attorneys across Cook, Lake, Will, Kane, McHenry, and DuPage counties in Illinois. Compare ratings, specializations, and get connected today.",
  metadataBase: new URL("https://illinoisprobatedirectory.com"),
  verification: {
    google: "OdAS2upgHPS4qIzSHL45_8gVbwgmPT3StMm42ZYo044",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
