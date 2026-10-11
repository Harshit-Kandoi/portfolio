import { Component, ErrorInfo, ReactNode } from 'react';
import { trackError } from '../../utils/analytics';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    trackError(error, {
      source: 'react_error_boundary',
      component_stack: errorInfo.componentStack || 'No component stack trace',
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col flex-grow items-center justify-center p-6 h-full w-full bg-blue-950 text-white font-mono select-none text-xs sm:text-sm animate-fade-in relative overflow-hidden">
          {/* CRT Scanline effect */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-5 z-[9999]"
            style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)' }} 
          />
          
          <div className="max-w-md w-full border border-red-500/40 bg-black/40 rounded-2xl p-6 shadow-2xl flex flex-col space-y-4 items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-900/30 text-red-500 border border-red-500/30 flex items-center justify-center animate-pulse">
              <AlertOctagon className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-sm font-black text-red-400 uppercase tracking-widest">⚠️ SYSTEM RUNTIME EXCEPTION</h2>
              <p className="text-[10px] text-gray-400">Harshit-OS has intercepted a sub-system rendering crash.</p>
            </div>

            <div className="w-full text-left bg-black/60 border border-white/5 rounded-xl p-3 text-[10px] text-red-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-32 custom-scrollbar">
              <strong>Error:</strong> {this.state.error?.message || 'Unknown Exception'}
              {this.state.error?.stack && (
                <div className="text-gray-500 mt-1 select-text">
                  {this.state.error.stack.split('\n').slice(0, 3).join('\n')}
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed px-2">
              The failure has been reported to the Portfolio analytics system for debugging. You can attempt to soft-restart the module.
            </p>

            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-purple-500/10 border border-purple-500/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Soft Reboot App</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
