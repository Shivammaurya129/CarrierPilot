import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (msg: string) => addToast(msg, "success");
  const error = (msg: string) => addToast(msg, "error");
  const info = (msg: string) => addToast(msg, "info");
  const warning = (msg: string) => addToast(msg, "warning");

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      
      {/* Toast Portal Container */}
      <div id="toast-portal" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${
                t.type === "success"
                  ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200"
                  : t.type === "error"
                  ? "bg-rose-950/90 border-rose-500/30 text-rose-200"
                  : t.type === "warning"
                  ? "bg-amber-950/90 border-amber-500/30 text-amber-200"
                  : "bg-slate-900/90 border-slate-700 text-slate-200"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {t.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400" id="toast-icon-success" />}
                {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400" id="toast-icon-error" />}
                {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400" id="toast-icon-warning" />}
                {t.type === "info" && <Info className="w-5 h-5 text-sky-400" id="toast-icon-info" />}
              </div>
              <div className="flex-1 text-sm font-medium leading-5">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-0.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                id={`toast-close-${t.id}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
