"use client";

import { useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Building2, LogOut, Briefcase, Wallet, X, Smartphone, Monitor } from "lucide-react";
import { useXO } from "@/context/XOProvider";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/Button";

function subscribe() {
  return () => {};
}

function WalletModal({ onClose }: { onClose: () => void }) {
  const { isBeexo, connect, connectMetaMask } = useXO();
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "vendimia-tech.vercel.app";

  async function handleBeexo() {
    if (isBeexo) {
      // Ya estamos dentro de Beexo, conectar directamente
      await connect();
      onClose();
    }
    // Si no estamos en Beexo, el bloque de instrucciones se muestra abajo
  }

  async function handleMetaMask() {
    await connectMetaMask();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Conectar Wallet</h2>
            <p className="text-xs text-slate-500">Elegí cómo conectarte</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Beexo */}
          <button
            onClick={handleBeexo}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm">Beexo Wallet</p>
              <p className="text-xs text-slate-500">
                {isBeexo
                  ? "✓ Detectado — click para conectar"
                  : "Abrí esta URL en el browser de Beexo"}
              </p>
            </div>
            {isBeexo && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                Activo
              </span>
            )}
          </button>

          {!isBeexo && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-xs text-slate-600 font-medium mb-1">¿Cómo conectar con Beexo?</p>
              <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
                <li>Abrí la app <strong>Beexo</strong> en tu celular</li>
                <li>Tocá el ícono de <strong>browser/explorar</strong></li>
                <li>Ingresá esta URL:</li>
              </ol>
              <div className="mt-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                <p className="text-xs font-mono text-blue-600 break-all">{siteUrl}</p>
              </div>
            </div>
          )}

          {/* MetaMask */}
          <button
            onClick={handleMetaMask}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <Monitor className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">MetaMask</p>
              <p className="text-xs text-slate-500">Extensión de escritorio</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const { address, isConnected, disconnect } = useXO();
  const { user, role, signOut } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const truncated = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Talent<span className="text-blue-600">Chain</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user && role === "student" && (
              <>
                <Link href="/student/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" /> Mi Panel
                </Link>
                <Link href="/student/certificates" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                  Certificados
                </Link>
              </>
            )}

            {user && role === "company" && (
              <>
                <Link href="/company/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:flex items-center gap-1">
                  <Building2 className="h-4 w-4" /> Mi Empresa
                </Link>
                <Link href="/company/jobs" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                  Ofertas
                </Link>
                <Link href="/company/students" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                  Estudiantes
                </Link>
              </>
            )}

            {!user && (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Ingresar</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </>
            )}

            {user && (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-500 hover:text-red-500 gap-1">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            )}

            {mounted ? (
              isConnected ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono text-slate-700 text-xs">{truncated}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={disconnect} className="text-slate-500 hover:text-red-500">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  Conectar Wallet
                </Button>
              )
            ) : (
              <div className="w-32 h-10 bg-slate-100 animate-pulse rounded-xl" />
            )}
          </div>
        </div>
      </nav>

      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </>
  );
}
