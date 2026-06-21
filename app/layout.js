import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Nav    from "@/components/Nav";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"], variable: "--font-display",
  weight: ["400","500","600","700"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"], variable: "--font-mono",
  weight: ["400","500"],
});

export const metadata = {
  title: { default: "Yobest Studio", template: "%s — Yobest Studio" },
  description: "Roblox games, AI tools, and a Discord bot that powers everything.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col bg-ink text-paper">
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
