"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface HederaContextType {
  accountId: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  network: string;
}

const HederaContext = createContext<HederaContextType | undefined>(undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let hc: any = null;

export function HederaProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { HashConnect } = await import("hashconnect");
      const { LedgerId } = await import("@hashgraph/sdk");

      const NETWORK =
        process.env.NEXT_PUBLIC_HEDERA_NETWORK === "mainnet"
          ? LedgerId.MAINNET
          : LedgerId.TESTNET;

      const APP_METADATA = {
        name: "NombreApp",
        description: "Marketplace tokenizado en Hedera",
        url: window.location.origin,
        icons: [] as string[],
      };

      const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

      hc = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA, false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hc.pairingEvent.on((data: any) => {
        const id = data.accountIds?.[0]?.toString() ?? null;
        if (id) {
          setAccountId(id);
          setIsConnected(true);
        }
      });

      hc.disconnectionEvent.on(() => {
        setAccountId(null);
        setIsConnected(false);
      });

      hc.init();
    };

    init();

    return () => {
      hc?.disconnect();
    };
  }, []);

  const connect = useCallback(async () => {
    await hc?.openPairingModal();
  }, []);

  const disconnect = useCallback(async () => {
    await hc?.disconnect();
    setAccountId(null);
    setIsConnected(false);
  }, []);

  return (
    <HederaContext.Provider
      value={{
        accountId,
        isConnected,
        connect,
        disconnect,
        network: process.env.NEXT_PUBLIC_HEDERA_NETWORK ?? "testnet",
      }}
    >
      {children}
    </HederaContext.Provider>
  );
}

export function useHedera() {
  const context = useContext(HederaContext);
  if (!context) throw new Error("useHedera must be used within HederaProvider");
  return context;
}
