import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="container py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Cryptocurrency Market
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time cryptocurrency prices and market data
              </p>
            </div>
          </header>

          <main className="container py-8">{children}</main>

          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="container py-6">
              <p className="text-center text-gray-500 text-sm">
                Powered by CoinGecko API • Built with Next.js 15 & React 19
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
