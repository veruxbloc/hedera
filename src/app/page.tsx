"use client";

import { useMarketplace } from '@/context/MarketplaceContext';
import { DatasetCard } from '@/components/DatasetCard';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Database, Coins, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { datasets } = useMarketplace();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-28 lg:pt-32 lg:pb-36">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
        
        <div className="container mx-auto px-4 sm:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            Etiqueta destacada
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto">
            Título principal de la
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm"> plataforma</span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Descripción breve de la propuesta de valor. Explicá qué hace la plataforma y para quién está pensada en dos o tres oraciones.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-blue-500/20" onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}>
              Acción principal <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-white border-slate-200">
                Mi Panel
              </Button>
            </Link>
          </div>
          
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto border-t border-slate-100 pt-10">
            <div className="flex flex-col items-center p-4">
              <div className="bg-blue-50 p-3 rounded-2xl mb-4">
                <Database className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Característica 1</h3>
              <p className="text-slate-500 text-sm mt-1">Descripción breve de la primera ventaja o diferencial.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="bg-indigo-50 p-3 rounded-2xl mb-4">
                <Coins className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Característica 2</h3>
              <p className="text-slate-500 text-sm mt-1">Descripción breve de la segunda ventaja o diferencial.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="bg-green-50 p-3 rounded-2xl mb-4">
                <ShieldCheck className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Característica 3</h3>
              <p className="text-slate-500 text-sm mt-1">Descripción breve de la tercera ventaja o diferencial.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mb-12 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">Título de sección</h2>
              <p className="text-lg text-slate-600">Descripción de esta sección. Explicá brevemente qué puede encontrar el usuario aquí.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {datasets.map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
