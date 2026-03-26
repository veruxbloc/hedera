# Hedera HashConnect + Agente IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar HashConnect para conexión nativa con HashPack y agregar un agente IA con Hedera Agent Kit + OpenRouter accesible desde el dashboard, sin tocar wagmi/RainbowKit existente.

**Architecture:** `HederaProvider` gestiona la sesión HashConnect y expone `accountId` via contexto. Un API route server-side orquesta el agente LangChain con tools del Hedera Agent Kit usando OpenRouter como LLM. El chat UI vive en el dashboard y consume ese endpoint.

**Tech Stack:** hashconnect, @hashgraph/sdk, hedera-agent-kit, langchain, @langchain/openai, @langchain/langgraph

---

## Mapa de archivos

| Acción | Archivo | Responsabilidad |
|---|---|---|
| Crear | `src/context/HederaProvider.tsx` | Contexto HashConnect: accountId, connect, disconnect |
| Crear | `src/app/api/agent/route.ts` | API route server-side del agente |
| Crear | `src/components/AgentChat.tsx` | Chat UI con burbujas y estado de carga |
| Crear | `.env.local` | Variables de entorno secretas |
| Modificar | `src/app/layout.tsx` | Agrega HederaProvider al árbol |
| Modificar | `src/components/Navbar.tsx` | Agrega botón HashPack junto al ConnectButton existente |
| Modificar | `src/app/dashboard/page.tsx` | Usa accountId de HederaProvider + agrega AgentChat |
| Sin tocar | `src/context/Web3Provider.tsx` | wagmi/RainbowKit se mantiene intacto |
| Sin tocar | `src/components/PurchaseModal.tsx` | Sigue usando wagmi useAccount |

---

## Task 1: Instalar dependencias

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar paquetes**

```bash
cd /home/plkz/Escritorio/Hackaton
npm install hashconnect @hashgraph/sdk hedera-agent-kit langchain @langchain/openai @langchain/langgraph @langchain/core
```

- [ ] **Step 2: Verificar instalación**

```bash
node -e "require('hashconnect'); require('@hashgraph/sdk'); console.log('OK')"
```

Expected output: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install hashconnect, hedera-agent-kit and langchain dependencies"
```

---

## Task 2: Variables de entorno

**Files:**
- Create: `.env.local`

- [ ] **Step 1: Crear `.env.local`**

```bash
cat > /home/plkz/Escritorio/Hackaton/.env.local << 'EOF'
# Hedera network
NEXT_PUBLIC_HEDERA_NETWORK=testnet

# WalletConnect project ID (reutilizado por HashConnect v3)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=cef62be2725ea6148b4e180feef94f36

# Hedera operator (cuenta que firma transacciones del agente)
HEDERA_OPERATOR_ID=0.0.XXXXXXX
HEDERA_OPERATOR_KEY=302e0201...

# OpenRouter
OPENROUTER_API_KEY=sk-or-...
EOF
```

> Reemplazar `HEDERA_OPERATOR_ID`, `HEDERA_OPERATOR_KEY` y `OPENROUTER_API_KEY` con valores reales antes de correr el agente.

- [ ] **Step 2: Verificar que `.env.local` no está en git**

```bash
grep ".env.local" /home/plkz/Escritorio/Hackaton/.gitignore || echo ".env.local" >> /home/plkz/Escritorio/Hackaton/.gitignore
```

- [ ] **Step 3: Commit del gitignore**

```bash
git add .gitignore
git commit -m "chore: ensure .env.local is gitignored"
```

---

## Task 3: HederaProvider (contexto HashConnect)

**Files:**
- Create: `src/context/HederaProvider.tsx`

- [ ] **Step 1: Crear el provider**

Crear `src/context/HederaProvider.tsx` con el siguiente contenido:

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { HashConnect } from "hashconnect";
import { LedgerId } from "@hashgraph/sdk";

const APP_METADATA = {
  name: "NombreApp",
  description: "Marketplace tokenizado en Hedera",
  url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  icons: [],
};

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const NETWORK = process.env.NEXT_PUBLIC_HEDERA_NETWORK === "mainnet"
  ? LedgerId.MAINNET
  : LedgerId.TESTNET;

interface HederaContextType {
  accountId: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  network: string;
}

const HederaContext = createContext<HederaContextType | undefined>(undefined);

let hc: HashConnect | null = null;

export function HederaProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    hc = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA, false);

    hc.pairingEvent.on((data) => {
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
```

- [ ] **Step 2: Verificar que TypeScript no tiene errores**

```bash
cd /home/plkz/Escritorio/Hackaton && npx tsc --noEmit 2>&1 | head -30
```

Expected: sin errores relacionados a `HederaProvider.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/context/HederaProvider.tsx
git commit -m "feat: add HederaProvider with HashConnect context"
```

---

## Task 4: Agregar HederaProvider al layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Editar layout.tsx**

Reemplazar el contenido de `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Provider";
import { HederaProvider } from "@/context/HederaProvider";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NombreApp | Descripción breve",
  description: "Descripción de la aplicación.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col`}>
        <Web3Provider>
          <HederaProvider>
            <MarketplaceProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </MarketplaceProvider>
          </HederaProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verificar compilación**

```bash
cd /home/plkz/Escritorio/Hackaton && npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wrap app with HederaProvider alongside existing Web3Provider"
```

---

## Task 5: Botón HashPack en la Navbar

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Editar Navbar.tsx**

Reemplazar el contenido de `src/components/Navbar.tsx`:

```tsx
"use client";

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

          {/* HashPack button */}
          {mounted && (
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
```

- [ ] **Step 2: Verificar compilación**

```bash
cd /home/plkz/Escritorio/Hackaton && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: add HashPack connect button to Navbar alongside RainbowKit"
```

---

## Task 6: Dashboard usa HederaProvider

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Agregar import de useHedera y reemplazar address/isConnected del dashboard**

En `src/app/dashboard/page.tsx`, cambiar las primeras líneas del componente:

```tsx
"use client";

import { useMarketplace } from "@/context/MarketplaceContext";
import { useHedera } from "@/context/HederaProvider";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Wallet, Database, Lock, Copy, Check, TrendingUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AgentChat } from "@/components/AgentChat";
```

- [ ] **Step 2: Actualizar la lógica del componente para usar accountId de Hedera**

Reemplazar las líneas del hook en `DashboardPage`:

```tsx
export default function DashboardPage() {
  const { accountId, isConnected, network } = useHedera();
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
```

- [ ] **Step 3: Actualizar el guard de isConnected y el badge de red**

Reemplazar el bloque `if (!isConnected)` y el badge de red en el header del dashboard:

```tsx
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
```

Y en el badge de red del header oscuro, reemplazar `{chain && (...)}` por:

```tsx
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-slate-300 text-sm font-medium capitalize">{network}</span>
              </div>
```

- [ ] **Step 4: Agregar AgentChat al final del return, debajo de "Tus adquisiciones"**

Justo antes del cierre `</div>` final del contenido principal, agregar:

```tsx
        {/* Agente Hedera */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-blue-600">✦</span>
            Agente Hedera
          </h2>
          <AgentChat accountId={accountId} />
        </div>
```

- [ ] **Step 5: Verificar compilación**

```bash
cd /home/plkz/Escritorio/Hackaton && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: dashboard uses HederaProvider accountId and includes AgentChat"
```

---

## Task 7: Componente AgentChat

**Files:**
- Create: `src/components/AgentChat.tsx`

- [ ] **Step 1: Crear el componente**

Crear `src/components/AgentChat.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/Button";
import { Bot, Send, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AgentChatProps {
  accountId: string | null;
}

export function AgentChat({ accountId }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `¡Hola! Soy tu asistente en Hedera. Puedo consultar tu balance de HBAR, tus tokens HTS y ejecutar transferencias. ¿En qué puedo ayudarte?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          accountId,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Hubo un error al procesar tu consulta. Por favor intentá de nuevo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-xl">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold">Agente Hedera</h3>
          <p className="text-slate-400 text-xs">Powered by Hedera Agent Kit</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-slate-400 text-xs">Testnet</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === "assistant" ? "bg-blue-600" : "bg-slate-700"
              }`}
            >
              {msg.role === "assistant" ? (
                <Bot className="h-4 w-4 text-white" />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            <div
              className={`max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                  : "bg-blue-600 text-white rounded-tr-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Consultando en Hedera...
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Escribí tu consulta..."
          disabled={isLoading}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar compilación**

```bash
cd /home/plkz/Escritorio/Hackaton && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AgentChat.tsx
git commit -m "feat: add AgentChat component with Hedera-style UI"
```

---

## Task 8: API Route del agente

**Files:**
- Create: `src/app/api/agent/route.ts`

- [ ] **Step 1: Crear el directorio**

```bash
mkdir -p /home/plkz/Escritorio/Hackaton/src/app/api/agent
```

- [ ] **Step 2: Crear `src/app/api/agent/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import HederaAgentKit, { createHederaTools } from "hedera-agent-kit";

export async function POST(req: NextRequest) {
  try {
    const { messages, accountId } = await req.json();

    const agentKit = new HederaAgentKit(
      process.env.HEDERA_OPERATOR_ID!,
      process.env.HEDERA_OPERATOR_KEY!,
      (process.env.NEXT_PUBLIC_HEDERA_NETWORK as "mainnet" | "testnet" | "previewnet") ?? "testnet"
    );

    const tools = createHederaTools(agentKit);

    const llm = new ChatOpenAI({
      modelName: "openai/gpt-4o-mini",
      openAIApiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "NombreApp Hackathon",
        },
      },
    });

    const systemPrompt = `Sos un asistente inteligente de un marketplace tokenizado construido sobre Hedera blockchain.
El usuario conectado tiene la cuenta Hedera: ${accountId ?? "desconocida"}.
Podés consultar balances de HBAR, tokens HTS, información de cuentas y ejecutar transferencias.
Respondé siempre en español, de forma concisa y clara.
Si el usuario no especifica una cuenta, usá la suya: ${accountId ?? "desconocida"}.`;

    const agent = createReactAgent({
      llm,
      tools,
      messageModifier: systemPrompt,
    });

    const lastUserMessage = messages[messages.length - 1];

    const result = await agent.invoke({
      messages: [new HumanMessage(lastUserMessage.content)],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    const responseContent =
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : JSON.stringify(lastMessage.content);

    return NextResponse.json({ response: responseContent });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { response: "Error al procesar la consulta. Verificá la configuración del agente." },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Verificar compilación**

```bash
cd /home/plkz/Escritorio/Hackaton && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/agent/route.ts
git commit -m "feat: add Hedera agent API route with LangChain + OpenRouter"
```

---

## Task 9: Smoke test del flujo completo

- [ ] **Step 1: Arrancar el servidor de desarrollo**

```bash
cd /home/plkz/Escritorio/Hackaton && npm run dev
```

Expected: servidor corriendo en `http://localhost:3000` sin errores de compilación.

- [ ] **Step 2: Verificar la Navbar**

Abrir `http://localhost:3000`. Verificar que aparecen dos botones:
- "HashPack" (botón outline con ícono de wallet)
- El ConnectButton de RainbowKit (existente)

- [ ] **Step 3: Verificar el dashboard sin wallet conectada**

Abrir `http://localhost:3000/dashboard`. Debe mostrar la pantalla de "Acceso Restringido" mencionando HashPack.

- [ ] **Step 4: Verificar el chat UI (con HashPack conectado)**

Con HashPack conectado, el dashboard debe mostrar:
- Banda oscura con `accountId` en formato `0.0.XXXXXX`
- Badge de red "testnet"
- Sección "Agente Hedera" con el chat al final

- [ ] **Step 5: Verificar el agente (con `.env.local` completo)**

En el chat, escribir: `¿Cuál es mi balance de HBAR?`

Expected: el agente responde con el balance real de la cuenta en testnet (requiere `HEDERA_OPERATOR_ID`, `HEDERA_OPERATOR_KEY` y `OPENROUTER_API_KEY` configurados).

---

## Notas de ajuste post-instalación

Si `hedera-agent-kit` exporta el agentkit con un nombre diferente, verificar con:

```bash
node -e "const kit = require('hedera-agent-kit'); console.log(Object.keys(kit))"
```

Ajustar los imports en `route.ts` según el output. El patrón de nombres más común es `HederaAgentKit` (default export) y `createHederaTools` (named export).
