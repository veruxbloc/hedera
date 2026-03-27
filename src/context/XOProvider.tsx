"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { XOConnectProvider } from "xo-connect";
import { ethers } from "ethers";

const xoProvider = new XOConnectProvider({ debug: false });

interface XOContextType {
  address: string | null;
  chainId: string;
  isConnected: boolean;
  isBeexo: boolean;
  connect: () => Promise<void>;
  connectMetaMask: () => Promise<void>;
  disconnect: () => void;
  getSigner: () => Promise<ethers.Signer>;
}

const XOContext = createContext<XOContextType | undefined>(undefined);

export function XOProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string>("");
  const [isBeexo, setIsBeexo] = useState(false);

  useEffect(() => {
    xoProvider.on("accountsChanged", (accounts: string[]) => {
      setAddress(accounts[0] || null);
    });
    xoProvider.on("chainChanged", (newChainId: string) => {
      setChainId(newChainId);
    });

    // Detectar si estamos dentro de Beexo / xo-connect disponible
    xoProvider.request({ method: "eth_accounts" })
      .then((accounts) => {
        if (Array.isArray(accounts) && accounts.length > 0) {
          setIsBeexo(true);
          setAddress(accounts[0]);
          xoProvider.request({ method: "eth_chainId" }).then((c) => setChainId(c as string));
        }
      })
      .catch(() => setIsBeexo(false));
  }, []);

  // Conectar con Beexo/xo-connect (solo funciona dentro del browser de Beexo)
  async function connect() {
    try {
      const accounts = await xoProvider.request({ method: "eth_requestAccounts" });
      if (Array.isArray(accounts) && accounts.length > 0) {
        setAddress(accounts[0]);
        const chain = await xoProvider.request({ method: "eth_chainId" });
        setChainId(chain as string);
        setIsBeexo(true);
      }
    } catch {
      // No estamos dentro de Beexo — el usuario debe abrir la URL en el browser de Beexo
    }
  }

  // Conectar con MetaMask
  async function connectMetaMask() {
    try {
      const win = window as unknown as { ethereum?: ethers.Eip1193Provider & { request: (a: { method: string }) => Promise<string[]> } };
      if (!win.ethereum) { alert("MetaMask no está instalado."); return; }
      const accounts = await win.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        const chain = await win.ethereum.request({ method: "eth_chainId" } as never);
        setChainId(chain as unknown as string);
        setIsBeexo(false);
      }
    } catch (err) {
      console.error("Error conectando MetaMask:", err);
    }
  }

  // Devuelve un Signer de ethers usando el provider correcto
  async function getSigner(): Promise<ethers.Signer> {
    if (isBeexo) {
      const provider = new ethers.BrowserProvider(xoProvider as unknown as ethers.Eip1193Provider);
      return provider.getSigner();
    }
    const win = window as unknown as { ethereum?: ethers.Eip1193Provider };
    if (win.ethereum) {
      const provider = new ethers.BrowserProvider(win.ethereum);
      return provider.getSigner();
    }
    throw new Error("No hay wallet conectada. Conectá Beexo o MetaMask.");
  }

  function disconnect() {
    setAddress(null);
    setChainId("");
    setIsBeexo(false);
  }

  return (
    <XOContext.Provider value={{ address, chainId, isConnected: !!address, isBeexo, connect, connectMetaMask, disconnect, getSigner }}>
      {children}
    </XOContext.Provider>
  );
}

export function useXO() {
  const context = useContext(XOContext);
  if (!context) throw new Error("useXO must be used within XOProvider");
  return context;
}
