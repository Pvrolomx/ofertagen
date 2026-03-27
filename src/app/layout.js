import "./globals.css";

export const metadata = {
  title: "OfertaGen — Expat Advisor MX",
  description: "Generador inteligente de ofertas de compra inmobiliaria bilingües",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
