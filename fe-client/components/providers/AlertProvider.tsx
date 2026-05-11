"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface AlertData {
  type: "success" | "error";
  message: string;
}

interface AlertContextType {
  showAlert: (type: "success" | "error", message: string) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertData | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showAlert = useCallback((type: "success" | "error", message: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAlert({ type, message });
    timeoutRef.current = setTimeout(() => setAlert(null), 5000);
  }, []);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAlert(null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {alert && (
        <div
          className="fixed top-5 right-5 z-[9999] max-w-sm w-full"
          style={{ pointerEvents: "auto" }}
        >
          <div
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm ${
              alert.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
            role="alert"
          >
            {alert.type === "success" ? (
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            )}
            <p className="flex-1 leading-relaxed">{alert.message}</p>
            <button onClick={dismiss} className="shrink-0 mt-0.5 opacity-50 hover:opacity-100 transition-opacity">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within AlertProvider");
  return context;
}
