import { Database } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-8">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-slate-400" />
          <span className="text-lg font-semibold text-slate-900">
            Nombre<span className="text-blue-600">App</span>
          </span>
        </div>
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} NombreApp. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
