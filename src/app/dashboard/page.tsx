"use client";

// ─── HEDERA TOGGLE ──────────────────────────────────────────────────────────
// Cambiar a true para usar HashPack + Agente Hedera
const HEDERA_ENABLED = false;
// ────────────────────────────────────────────────────────────────────────────

import { useMarketplace } from "@/context/MarketplaceContext";
import { useHedera } from "@/context/HederaProvider";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Wallet, Database, Lock, Copy, Check, TrendingUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AgentChat } from "@/components/AgentChat";

export default function DashboardPage() {
  const hedera = useHedera();
  const wagmi = useAccount();

  const accountId   = HEDERA_ENABLED ? hedera.accountId  : (wagmi.address ?? null);
  const isConnected = HEDERA_ENABLED ? hedera.isConnected : wagmi.isConnected;
  const network     = HEDERA_ENABLED ? hedera.network     : (wagmi.chain?.name ?? "");

  const { datasets, userPurchases } = useMarketplace();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (accountId) {
      navigator.clipboard.writeText(accountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAddress = accountId
    ? `${accountId.slice(0, 8)}...${accountId.slice(-4)}`
    : "";

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-md">
        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100 shadow-inner">
          <Lock className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Acceso Restringido</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Para acceder a esta sección necesitás conectar tu wallet HashPack desde la barra de navegación.
        </p>
      </div>
    );
  }

  const purchasedDatasets = userPurchases.map(purchase => {
    const dataset = datasets.find(d => d.id === purchase.datasetId);
    return {
      ...dataset,
      tokensOwned: purchase.tokens,
      totalValue: purchase.tokens * (dataset?.tokenPrice || 0),
      participation: dataset
        ? Math.round((purchase.tokens / dataset.totalTokens) * 1000) / 10
        : 0,
    };
  }).filter(d => d.id !== undefined);

  const totalInvestment = purchasedDatasets.reduce((sum, item) => sum + item.totalValue, 0);
  const totalTokens = userPurchases.reduce((sum, item) => sum + item.tokens, 0);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Banda oscura superior */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-8 py-8">

          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
                Panel de portafolio
              </p>
              <h1 className="text-3xl font-bold text-white">Mi Panel</h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-slate-300 text-sm font-medium capitalize">{network}</span>
              </div>
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors group cursor-pointer"
              >
                <span className="font-mono text-slate-300 text-sm">{truncatedAddress}</span>
                {copied
                  ? <Check className="h-3.5 w-3.5 text-green-400" />
                  : <Copy className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                }
              </button>
            </div>
          </div>

          {/* Tickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg shadow-blue-900/40">
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-3">
                Valor total
              </p>
              <p className="text-4xl font-bold text-white tracking-tight">
                ${totalInvestment.toLocaleString()}
                <span className="text-lg font-normal text-blue-300 ml-2">USD</span>
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  Ítems adquiridos
                </p>
                <Database className="h-4 w-4 text-slate-500" />
              </div>
              <p className="text-4xl font-bold text-white tracking-tight">
                {purchasedDatasets.length}
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  Tokens asignados
                </p>
                <Wallet className="h-4 w-4 text-slate-500" />
              </div>
              <p className="text-4xl font-bold text-white tracking-tight">{totalTokens}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 sm:px-8 py-10">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Tus adquisiciones
        </h2>

        {purchasedDatasets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
            <div className="bg-slate-50 p-4 rounded-full w-fit mx-auto mb-4 border border-slate-100 shadow-sm">
              <Database className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Todavía no tenés ningún ítem
            </h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Explorá el catálogo para descubrir opciones disponibles y comenzar.
            </p>
            <Link href="/#marketplace">
              <Button size="lg" className="rounded-full shadow-md">Explorar el catálogo</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {purchasedDatasets.map((ds) => {
              const dataset = datasets.find(d => d.id === ds.id);
              const fundingProgress = dataset
                ? Math.round((dataset.fundedAmount / dataset.fundingGoal) * 100)
                : 0;

              return (
                <Card key={ds.id} className="border-slate-200 hover:border-blue-300 transition-all hover:shadow-md">
                  <CardContent className="p-6">

                    {/* Encabezado de card */}
                    <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                          <Database className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-tight">
                            {ds.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {ds.tags?.slice(0, 2).join(' · ')}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 whitespace-nowrap">
                        {ds.participation}% stake
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
                          Tokens propios
                        </p>
                        <p className="text-2xl font-bold text-blue-600">{ds.tokensOwned}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
                          Valor estimado
                        </p>
                        <p className="text-2xl font-bold text-slate-900">${ds.totalValue}</p>
                      </div>
                    </div>

                    {/* Barra de financiación */}
                    <div className="mb-5">
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-500">Progreso de financiación</span>
                        <span className="text-blue-600">{fundingProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1.5 text-slate-400">
                        <span>${dataset?.fundedAmount.toLocaleString()}</span>
                        <span>objetivo ${dataset?.fundingGoal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Acción */}
                    <Button
                      variant="outline"
                      className="w-full gap-2 font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Descargar muestra
                    </Button>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Agente Hedera — activar con HEDERA_ENABLED = true */}
        {HEDERA_ENABLED && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-blue-600">✦</span>
              Agente Hedera
            </h2>
            <AgentChat accountId={accountId} />
          </div>
        )}
      </div>
    </div>
  );
}
