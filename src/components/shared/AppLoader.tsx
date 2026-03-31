import { useTranslation } from 'react-i18next';
import { DobbyLogo } from './DobbyLogo';

interface AppLoaderProps {
  message?: string;
}

export function AppLoader({ message }: AppLoaderProps) {
  const { t } = useTranslation();
  const displayMessage = message ?? t('loader.default');
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center animate-pulse">
          <DobbyLogo size={72} showWordmark />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-300 font-medium">{displayMessage}</p>
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
