import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ELEMENT ELITE FLEET",
  description: "Analisis de resenas y prediccion de abandono o retencion"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
