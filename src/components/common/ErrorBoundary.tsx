import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#e5e7eb] rounded-[24px] p-8 text-center shadow-lg">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-[20px] font-bold text-[#1e293b] mb-2">Something went wrong</h2>
            <p className="text-[14px] text-[#4b5563] mb-6">
              An unexpected display error occurred in this view. Your session and data remain safe.
            </p>
            <PrimaryButton onClick={this.handleReset} icon={<RefreshCw className="w-4 h-4" />}>
              Refresh Application
            </PrimaryButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
