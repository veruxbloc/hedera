"use client";

import { useState } from 'react';
import { Dataset } from '@/data/mockDatasets';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { PurchaseModal } from './PurchaseModal';
import { Database, TrendingUp } from 'lucide-react';

export function DatasetCard({ dataset }: { dataset: Dataset }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const progress = Math.round((dataset.fundedAmount / dataset.fundingGoal) * 100);

  return (
    <>
      <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 hover:border-blue-200">
        <CardHeader>
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-xl bg-blue-50 p-3 shadow-sm border border-blue-100/50">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end w-2/3">
              {dataset.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-slate-100/80 text-slate-600 text-xs rounded-lg font-medium whitespace-nowrap">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <CardTitle className="text-xl leading-tight mb-2 mt-2">{dataset.name}</CardTitle>
          <CardDescription className="line-clamp-3 text-sm leading-relaxed">{dataset.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col justify-end">
          <div className="mb-5 mt-auto">
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span className="text-slate-600">Progreso</span>
              <span className="text-blue-600 font-bold">{progress}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs mt-2 text-slate-500 font-medium">
              <span>${dataset.fundedAmount.toLocaleString()}</span>
              <span>Objetivo: ${dataset.fundingGoal.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Precio por token</p>
              <p className="font-bold text-slate-900 text-lg">${dataset.tokenPrice}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Disponibles</p>
              <p className="font-bold text-slate-900 text-lg">{dataset.tokensAvailable} <span className="text-sm font-normal text-slate-400">/ {dataset.totalTokens}</span></p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button 
            className="w-full gap-2 text-base h-12 shadow-md hover:shadow-lg transition-all" 
            onClick={() => setIsModalOpen(true)}
            disabled={dataset.tokensAvailable === 0}
          >
            <TrendingUp className="h-4 w-4" />
            {dataset.tokensAvailable === 0 ? 'Sin tokens disponibles' : 'Comprar tokens'}
          </Button>
        </CardFooter>
      </Card>

      <PurchaseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        datasetId={dataset.id}
        datasetName={dataset.name}
        tokenPrice={dataset.tokenPrice}
        tokensAvailable={dataset.tokensAvailable}
      />
    </>
  );
}
