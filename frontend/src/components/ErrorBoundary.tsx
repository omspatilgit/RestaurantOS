import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 glass rounded-2xl border border-neon-red/30 text-center my-8 max-w-lg mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-neon-red mx-auto" />
          <h2 className="text-xl font-bold text-surface-50">Dashboard Display Notice</h2>
          <p className="text-sm text-surface-400">
            {this.state.error?.message || 'A temporary rendering issue occurred.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              this.setState({ hasError: false, error: null });
            }}
          >
            Retry Component
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
