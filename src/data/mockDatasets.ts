export interface Dataset {
  id: string;
  name: string;
  description: string;
  fundedAmount: number;
  fundingGoal: number;
  tokenPrice: number;
  tokensAvailable: number;
  totalTokens: number;
  tags: string[];
}

export const mockDatasets: Dataset[] = [
  {
    id: "ds-1",
    name: "Nombre del ítem 1",
    description: "Descripción del primer ítem disponible en el catálogo. Explicá brevemente de qué se trata y por qué es valioso.",
    fundedAmount: 6500,
    fundingGoal: 20000,
    tokenPrice: 20,
    tokensAvailable: 675,
    totalTokens: 1000,
    tags: ["Categoría A", "Categoría B"],
  },
  {
    id: "ds-2",
    name: "Nombre del ítem 2",
    description: "Descripción del segundo ítem disponible en el catálogo. Explicá brevemente de qué se trata y por qué es valioso.",
    fundedAmount: 12000,
    fundingGoal: 15000,
    tokenPrice: 50,
    tokensAvailable: 60,
    totalTokens: 300,
    tags: ["Categoría C", "Categoría D"],
  },
  {
    id: "ds-3",
    name: "Nombre del ítem 3",
    description: "Descripción del tercer ítem disponible en el catálogo. Explicá brevemente de qué se trata y por qué es valioso.",
    fundedAmount: 1800,
    fundingGoal: 10000,
    tokenPrice: 10,
    tokensAvailable: 820,
    totalTokens: 1000,
    tags: ["Categoría E", "Categoría F"],
  }
];
