import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const ToastContext = createContext(null);

const toastColors = {
  success: { backgroundColor: "#15803d", color: "#ffffff" },
  error: { backgroundColor: "#dc2626", color: "#ffffff" },
  warning: { backgroundColor: "#d97706", color: "#ffffff" },
  info: { backgroundColor: "#2563eb", color: "#ffffff" },
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, severity = "info") => {
    setToast({ id: Date.now(), message, severity });
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      success: (message) => showToast(message, "success"),
      error: (message) => showToast(message, "error"),
      warning: (message) => showToast(message, "warning"),
      info: (message) => showToast(message, "info"),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.id}
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 7 }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity || "info"}
          variant="filled"
          elevation={8}
          sx={{
            minWidth: { xs: 280, sm: 360 },
            alignItems: "center",
            fontSize: "1rem",
            fontWeight: 600,
            ...toastColors[toast?.severity || "info"],
            "& .MuiAlert-icon": {
              color: "#ffffff",
              opacity: 1,
            },
            "& .MuiAlert-action": {
              color: "#ffffff",
            },
          }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
