"use client";

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

// Demo Project ID para WalletConnect (Hackathon MVP).
// Para paso a producción, genera el tuyo en cloud.walletconnect.com
const projectId = 'cef62be2725ea6148b4e180feef94f36';

const config = getDefaultConfig({
  appName: 'DataToken MVP',
  projectId: projectId,
  chains: [mainnet, sepolia],
  ssr: true, 
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={lightTheme({
            accentColor: '#2563eb', // blue-600
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
