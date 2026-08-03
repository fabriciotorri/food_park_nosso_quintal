import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Park Menu | Mesa 12",
  description: "Cardápio digital do food park",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
