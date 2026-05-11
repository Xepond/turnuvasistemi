import React from "react";
import { colors } from "./tournament_system.data.jsx";

export function Badge({ children, color = "var(--color-background-secondary)", textColor = "var(--color-text-secondary)" }) {
  return (
    <span style={{ background: color, color: textColor, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap", letterSpacing: "0.01em", boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}>
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(5, 10, 22, 0.72)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", borderRadius: 24, border: "1px solid rgba(255,255,255,0.10)", background: "linear-gradient(180deg, rgba(15, 19, 34, 0.98), rgba(10, 14, 26, 0.98))", boxShadow: "0 28px 90px rgba(0,0,0,0.55)", color: "#F4F7FB" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "1.1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2>
            <div style={{ marginTop: 4, fontSize: 12, color: "rgba(244,247,251,0.70)" }}>Formu eksiksiz doldurduktan sonra kayıt oluşturabilirsin.</div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", cursor: "pointer", fontSize: 20, color: "#F4F7FB", padding: 0, lineHeight: 1, display: "grid", placeItems: "center" }}>×</button>
        </div>
        <div style={{ padding: "1.25rem" }}>{children}</div>
      </div>
    </div>
  );
}

export function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase", color: "rgba(244,247,251,0.72)", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle = { width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(148, 163, 184, 0.22)", background: "rgba(255,255,255,0.04)", color: "#F4F7FB", fontSize: 14, outline: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" };

export const textareaStyle = { ...inputStyle, minHeight: 96, resize: "vertical" };

export const surfaceStyle = { background: "linear-gradient(180deg, rgba(16, 22, 39, 0.92), rgba(12, 16, 29, 0.92))", border: "1px solid rgba(148,163,184,0.14)", boxShadow: "0 16px 40px rgba(0,0,0,0.22)", borderRadius: 20 };
