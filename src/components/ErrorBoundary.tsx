import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error.message, errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="rounded-full bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Algo salio mal
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center max-w-md">
            Ocurrio un error inesperado. Intenta recargar la seccion.
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
