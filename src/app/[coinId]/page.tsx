'use client';

import React, { use } from 'react';

interface CoinDetailPageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default function CoinDetailPage({ params }: CoinDetailPageProps) {
  const resolvedParams = use(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Coin Details: {resolvedParams.coinId}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        This is a placeholder page for coin {resolvedParams.coinId}.
      </p>
    </div>
  );
}
