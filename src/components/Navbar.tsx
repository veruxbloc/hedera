"use client";

// ─── HEDERA TOGGLE ──────────────────────────────────────────────────────────
// Cambiar a true para mostrar el botón HashPack
const HEDERA_ENABLED = false;
// ────────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Database, Wallet, LogOut } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useHedera } from "@/context/HederaProvider";
import { Button } from "./ui/Button";

function subscribe() {
  return () => {};
}

export function Navbar() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const { accountId, isConnected, connect, disconnect } = useHedera();

  const truncated = accountId
    ? `${accountId.slice(0, 6)}...${accountId.slice(-4)}`
    : null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <Database className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Nombre<span className="text-blue-600">App</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
          >
            Dashboard
          </Link>

          {/* HashPack button — activar con HEDERA_ENABLED = true */}
          {HEDERA_ENABLED && mounted && (
            isConnected ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-mono text-slate-300 text-xs">{truncated}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  className="text-slate-500 hover:text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={connect}
                className="gap-2 border-slate-300"
              >
                <Wallet className="h-4 w-4" />
                HashPack
              </Button>
            )
          )}

          {/* WalletConnect (RainbowKit) — se mantiene */}
          {mounted ? (
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
            />
          ) : (
            <div className="w-32 h-10 bg-slate-100 animate-pulse rounded-xl" />
          )}
        </div>
      </div>
    </nav>
  );
}
