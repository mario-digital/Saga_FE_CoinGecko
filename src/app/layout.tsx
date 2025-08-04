import { Inter } from 'next/font/google';
import { Header } from '@/components/Header';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
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
          <Header />

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
