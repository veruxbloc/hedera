# Diseño: Integración Hedera (HashConnect + Agente IA)

**Fecha:** 2026-03-26
**Contexto:** Hackathon auspiciado por Hedera. La app es un marketplace tokenizado. Se reemplaza wagmi/RainbowKit por HashConnect y se agrega un agente IA con Hedera Agent Kit.

---

## Arquitectura general

```
UI (Next.js)
├── HederaProvider          ← contexto de wallet (reemplaza Web3Provider)
├── Dashboard con Chat UI   ← nuevo panel de agente
└── Navbar con HashPack btn ← reemplaza ConnectButton de RainbowKit

API (Next.js route handlers)
└── POST /api/agent         ← recibe mensajes, ejecuta el agente, devuelve respuesta

Agente (server-side)
├── LangChain + OpenRouter  ← LLM via API compatible con OpenAI
└── Hedera Agent Kit tools  ← acciones en la red Hedera
```

---

## Paquetes

**Nuevos:**
- `hashconnect` — conectar HashPack wallet
- `@hashgraph/sdk` — SDK nativo de Hedera
- `hedera-agent-kit` — tools del agente para LangChain
- `langchain` — orquestación del agente
- `@langchain/openai` — cliente OpenAI-compatible (usado con OpenRouter)

**Se mantienen (sin tocar):**
- `wagmi`
- `viem`
- `@rainbow-me/rainbowkit`

> wagmi/RainbowKit y HashConnect coexisten. Se decide cuál queda después del hackathon.

---

## Sección 1: HashConnect (wallet)

### Contexto `HederaProvider`

Nuevo archivo que coexiste con `Web3Provider.tsx`. Expone:

```ts
{
  accountId: string | null   // ej: "0.0.123456"
  isConnected: boolean
  connect: () => void        // abre HashPack
  disconnect: () => void
  network: 'testnet' | 'mainnet'
}
```

### Flujo de conexión

1. Usuario hace click en "Conectar HashPack" en la Navbar
2. HashConnect genera un pairing code / QR
3. HashPack firma el handshake
4. `accountId` queda disponible en toda la app via contexto

### Cambios en UI

- `Navbar.tsx` → reemplaza `<ConnectButton>` por botón propio que llama `connect()`; muestra `accountId` truncado cuando está conectado
- `dashboard/page.tsx` → usa `accountId` en lugar de `address`; badge muestra `0.0.XXXXXX`
- `PurchaseModal.tsx` → usa `isConnected` del nuevo contexto

### Variables de entorno

```
NEXT_PUBLIC_HEDERA_NETWORK=testnet
```

---

## Sección 2: Agente IA con Hedera Agent Kit

### API Route — `POST /api/agent`

- Archivo: `src/app/api/agent/route.ts`
- Recibe: `{ messages: {role, content}[], accountId: string }`
- Devuelve: `{ response: string }`
- Corre exclusivamente server-side (las keys nunca se exponen al cliente)

### LLM

OpenRouter via `@langchain/openai` con `baseURL` apuntando a `https://openrouter.ai/api/v1`.

### Tools disponibles (Hedera Agent Kit)

| Tool | Descripción |
|---|---|
| `getAccountBalance` | Consulta HBAR y tokens HTS de una cuenta |
| `getAccountInfo` | Info general de una cuenta Hedera |
| `transferHbar` | Transfiere HBAR entre cuentas |
| `getHtsTokenBalance` | Balance de un token HTS específico |

### Variables de entorno

```
OPENROUTER_API_KEY=...
HEDERA_OPERATOR_ID=...      # cuenta que paga las fees (testnet)
HEDERA_OPERATOR_KEY=...     # private key de esa cuenta
```

### System prompt del agente

El agente recibe como contexto el `accountId` del usuario conectado y actúa como asistente del marketplace. Sabe que puede consultar balances y ejecutar transferencias en Hedera testnet.

---

## Sección 3: Chat UI en el Dashboard

Nueva sección debajo de "Tus adquisiciones" en `dashboard/page.tsx`.

### Componente `AgentChat`

- Archivo: `src/components/AgentChat.tsx`
- Estado local: `messages[]`, `input`, `isLoading`
- Al enviar: `POST /api/agent` con el historial de mensajes y el `accountId`
- Mientras carga: muestra burbuja "Consultando en Hedera..." con spinner
- Diseño: sigue el mismo sistema visual (slate-900 header, cards blancas)

### Flujo de mensajes

1. Usuario escribe en el input y envía
2. Mensaje del usuario aparece como burbuja derecha
3. Aparece indicador de carga con texto "Consultando en Hedera..."
4. Respuesta del agente aparece como burbuja izquierda
5. Si el agente ejecutó un tool, la respuesta incluye los datos de Hedera

---

## Archivos a crear / modificar

| Acción | Archivo |
|---|---|
| Sin cambios | `src/context/Web3Provider.tsx` — wagmi/RainbowKit se mantiene |
| Crear | `src/context/HederaProvider.tsx` |
| Crear | `src/app/api/agent/route.ts` |
| Crear | `src/components/AgentChat.tsx` |
| Modificar | `src/app/layout.tsx` — reemplaza `Web3Provider` por `HederaProvider` |
| Modificar | `src/components/Navbar.tsx` — nuevo botón HashPack |
| Modificar | `src/app/dashboard/page.tsx` — usa accountId + agrega `AgentChat` |
| Modificar | `src/components/PurchaseModal.tsx` — usa nuevo contexto |
| Crear | `.env.local` — variables de entorno |

---

## Lo que no cambia

- `MarketplaceContext.tsx` — compras siguen mockeadas
- `DatasetCard.tsx`
- `PurchaseModal.tsx` (solo el import del contexto)
- Todo el UI del marketplace (`page.tsx`)
- Componentes UI (`Card`, `Button`, `Modal`)
