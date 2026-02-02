import "./globals.css";
import type { ReactNode } from "react";
import UserMenu from "./components/user-menu";

export const metadata = {
  title: "Expert Q&A Marketplace",
  description: "Antworten von verifizierten Experten in Minuten."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <header className="nav">
          <div><strong>ExpertQ</strong></div>
          <nav className="nav-links">
            <a href="/">Start</a>
            <a href="/categories">Kategorien</a>
            <a href="/how-it-works">So funktioniert's</a>
            <a href="/experts">Experten</a>
            <a href="/faq">FAQ</a>
          </nav>
          <UserMenu />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
