'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

export interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number; // default 3000ms
}

export interface ToastContextValue {
  showToast: (props: ToastProps) => void;
}

interface ToastItem extends ToastProps {
  id: string;
  visible: boolean;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const typeClasses: Record<ToastProps['type'], string> = {
  success: 'bg-green-100 border-green-500 text-green-800',
  error: 'bg-red-100 border-red-500 text-red-800',
  info: 'bg-blue-100 border-blue-500 text-blue-800',
};

const typeIcons: Record<ToastProps['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

function ToastMessage({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-center gap-3 px-4 py-3
        border-l-4 rounded-lg shadow-md
        transition-all duration-300 ease-in-out
        ${toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${typeClasses[toast.type]}
      `.trim()}
    >
      <span className="text-lg font-bold" aria-hidden="true">
        {typeIcons[toast.type]}
      </span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Tutup notifikasi"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    );
    // Remove from DOM after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback(
    (props: ToastProps) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const duration = props.duration ?? 3000;

      setToasts((prev) => [...prev, { ...props, id, visible: true }]);

      // Auto-dismiss after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container - fixed top-right */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
        aria-label="Notifikasi"
      >
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
