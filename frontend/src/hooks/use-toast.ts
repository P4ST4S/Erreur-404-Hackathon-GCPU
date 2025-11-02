import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastState {
  toasts: Toast[];
}

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] });

  const toast = useCallback(
    ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { id, title, description, variant };

      setState((prev) => ({
        toasts: [...prev.toasts, newToast],
      }));
      setTimeout(() => {
        setState((prev) => ({
          toasts: prev.toasts.filter((t) => t.id !== id),
        }));
      }, 5000);

      return {
        id,
        dismiss: () => {
          setState((prev) => ({
            toasts: prev.toasts.filter((t) => t.id !== id),
          }));
        },
      };
    },
    []
  );

  return {
    toast,
    toasts: state.toasts,
    dismiss: (toastId: string) => {
      setState((prev) => ({
        toasts: prev.toasts.filter((t) => t.id !== toastId),
      }));
    },
  };
}
