import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Rango",
  description: "Qual seu Rango de hoje?",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <Providers>
          <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
