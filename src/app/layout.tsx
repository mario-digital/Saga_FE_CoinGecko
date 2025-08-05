import { Inter } from 'next/font/google';
import { Header } from '@/components/Header';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'sans-serif',
  ],
});

export const metadata = {
  title: 'Saga FE Coin Gecko',
  description:
    'Cryptocurrency market data viewer built with Next.js 15 and React 19',
  keywords: [
    'cryptocurrency',
    'bitcoin',
    'ethereum',
    'market data',
    'crypto prices',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Crypto Market',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#111827', // dark gray to match the app background
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
          <Header />

          <main className="bg-gray-50 dark:bg-gray-900 flex-1 pb-16 sm:pb-0">
            {children}
          </main>

          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto mb-16 sm:mb-0">
            <div className="container py-6">
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                Powered by CoinGecko API • Built with Next.js 15 & React 19
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
