import { createContext, useCallback, useContext, useRef, useState } from "react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { message, title, danger }
  const resolver = useRef(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState({
        message,
        title: options.title || "¿Estás seguro?",
        danger: !!options.danger,
        confirmText: options.confirmText || "Confirmar",
        cancelText: options.cancelText || "Cancelar",
      });
    });
  }, []);

  const handle = (result) => {
    setState(null);
    resolver.current?.(result);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="confirm-overlay" onClick={() => handle(false)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-icon${state.danger ? " confirm-icon--danger" : ""}`}>
              {state.danger ? "!" : "?"}
            </div>
            <h3 className="confirm-title">{state.title}</h3>
            <p className="confirm-message">{state.message}</p>
            <div className="confirm-actions">
              <button type="button" className="confirm-btn confirm-btn--cancel" onClick={() => handle(false)}>
                {state.cancelText}
              </button>
              <button
                type="button"
                className={`confirm-btn confirm-btn--ok${state.danger ? " confirm-btn--danger" : ""}`}
                onClick={() => handle(true)}
                autoFocus
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

/* Devuelve una funcion async: const confirm = useConfirm(); if (await confirm("...")) { ... } */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>");
  return ctx;
}
