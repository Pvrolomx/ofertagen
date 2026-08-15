import "./globals.css";

export const metadata = {
  title: "OfertaGen — Expat Advisor MX",
  description: "Generador inteligente de ofertas de compra inmobiliaria bilingües",
  manifest: "/manifest.json",
  themeColor: "#1a365d",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            // updateViaCache:'none' → el navegador revalida sw.js en cada carga (nunca lo sirve de su HTTP cache),
            // así el SW nuevo se detecta y activa (skipWaiting) tras cada deploy; un reload simple basta para ver los cambios.
            navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
          }
          let deferredPrompt;
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const btn = document.getElementById('install-btn');
            if (btn) btn.classList.remove('hidden');
          });
          window.installApp = function() {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(r => {
              if (r.outcome === 'accepted') {
                const btn = document.getElementById('install-btn');
                if (btn) btn.classList.add('hidden');
              }
              deferredPrompt = null;
            });
          };
          window.addEventListener('appinstalled', () => {
            const btn = document.getElementById('install-btn');
            if (btn) btn.classList.add('hidden');
          });
        `}} />
      </body>
    </html>
  );
}
