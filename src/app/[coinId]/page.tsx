'use client';

import React from 'react';

interface CoinDetailPageProps {
  params: {
    coinId: string;
  };
}

export default function CoinDetailPage({ params }: CoinDetailPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Coin Details: {params.coinId}</h1>
      <p className="text-gray-600">
        This is a placeholder page for coin {params.coinId}.
      </p>
    </div>
  );
}
