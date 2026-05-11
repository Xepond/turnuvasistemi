import React from "react";
import { colors } from "./tournament_system.data.jsx";

export function Badge({ children, color = "var(--color-background-secondary)", textColor = "var(--color-text-secondary)" }) {
  return (
    <span style={{ background: color, color: textColor, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export function GameTag({ game }) {
  const c = colors[game] || "#888";
  return <Badge color={c + "22"} textColor={c}>{game}</Badge>;
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--color-background-primary)", borderRadius: 16, padding: "1.5rem", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", border: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-secondary)", padding: 0, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle = { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 14 };
