import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast { id: number; type: ToastType; message: string; }
interface ToastContextType { showToast: (type: ToastType, message: string) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);
let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const icons = { success: <CheckCircle className="w-5 h-5 text-emerald-400" />, error: <XCircle className="w-5 h-5 text-red-400" />, info: <AlertCircle className="w-5 h-5 text-blue-400" /> };
  const bgColors = { success: 'bg-emerald-900/90 border-emerald-700', error: 'bg-red-900/90 border-red-700', info: 'bg-blue-900/90 border-blue-700' };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[t.type]} text-white animate-slide-in`}>
            {icons[t.type]}
            <span className="text-sm font-medium">{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-2 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
