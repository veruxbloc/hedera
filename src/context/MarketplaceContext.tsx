"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { mockDatasets, Dataset } from '@/data/mockDatasets';

interface UserPurchase {
  datasetId: string;
  tokens: number;
}

interface MarketplaceContextType {
  datasets: Dataset[];
  userPurchases: UserPurchase[];
  buyTokens: (datasetId: string, amount: number) => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [datasets, setDatasets] = useState<Dataset[]>(mockDatasets);
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);

  const buyTokens = async (datasetId: string, amount: number) => {
    // Simulate web3 transaction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setDatasets((prev) =>
      prev.map((ds) => {
        if (ds.id === datasetId) {
          const totalCost = ds.tokenPrice * amount;
          return {
            ...ds,
            fundedAmount: ds.fundedAmount + totalCost,
            tokensAvailable: ds.tokensAvailable - amount,
          };
        }
        return ds;
      })
    );

    setUserPurchases((prev) => {
      const existing = prev.find((p) => p.datasetId === datasetId);
      if (existing) {
        return prev.map((p) =>
          p.datasetId === datasetId ? { ...p, tokens: p.tokens + amount } : p
        );
      }
      return [...prev, { datasetId, tokens: amount }];
    });
  };

  return (
    <MarketplaceContext.Provider value={{ datasets, userPurchases, buyTokens }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
