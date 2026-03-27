import { Sparkles } from 'lucide-react';

interface AppLoaderProps {
  message?: string;
}

export function AppLoader({ message = 'Cargando tu información...' }: AppLoaderProps) {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl animate-pulse shadow-lg shadow-brand-600/20">
          <Sparkles className="text-white" size={28} />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-300 font-medium">{message}</p>
          <div className="flex justify-center gap-1">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
