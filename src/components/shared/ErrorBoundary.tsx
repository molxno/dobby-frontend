import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-xl border border-red-500/30">
              <span className="text-3xl text-red-400 font-bold">!</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-lg font-semibold text-slate-100 font-heading">Algo salió mal</h1>
              <p className="text-sm text-slate-400">
                Ocurrió un error inesperado en la aplicación. Puedes intentar recargar la página o reiniciar.
              </p>
            </div>

            <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3 text-left">
              <p className="text-xs text-red-400 font-mono break-all">{this.state.error.message}</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 text-sm font-medium bg-surface-800 text-slate-300 rounded-lg hover:bg-surface-700 transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
