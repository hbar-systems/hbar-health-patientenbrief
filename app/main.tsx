/**
 * hbar.health — Patientenbrief
 *
 * Rewrites doctor-approved clinical text into a patient-friendly version — in
 * plain German or translated (Turkish, Arabic, Russian, Ukrainian, English).
 * STRICT: it only rewrites/translates the provided text; it never adds new
 * medical content. Every output is an ENTWURF the doctor approves. Uses the
 * llm.complete bridge; nothing is retrieved or persisted.
 */

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { type Theme, getStoredTheme, storeTheme, colors } from "./theme";
import { llmComplete, inBrain } from "./brainBridge";
import { type Lang as UiLang, type Strings, getStoredLang, storeLang, t } from "./i18n";
import "./styles.css";

interface Lang {
  code: string;
  label: string;
  /** How to name the target language inside the German system prompt. */
  targetName: string;
  rtl?: boolean;
}

const LANGS: Lang[] = [
  { code: "de", label: "Einfaches Deutsch", targetName: "in einfachem, leicht verständlichem Deutsch" },
  { code: "tr", label: "Türkçe", targetName: "auf Türkisch (in einfacher, patientenfreundlicher Sprache)" },
  { code: "ar", label: "العربية", targetName: "auf Arabisch (in einfacher, patientenfreundlicher Sprache)", rtl: true },
  { code: "ru", label: "Русский", targetName: "auf Russisch (in einfacher, patientenfreundlicher Sprache)" },
  { code: "uk", label: "Українська", targetName: "auf Ukrainisch (in einfacher, patientenfreundlicher Sprache)" },
  { code: "en", label: "English", targetName: "auf Englisch (in einfacher, patientenfreundlicher Sprache)" },
];

function systemPrompt(target: string): string {
  return (
    "Du formulierst vom Arzt bereits freigegebene Inhalte in eine patientenfreundliche " +
    `Fassung um — ${target}. ` +
    "WICHTIG: Füge KEINE neuen medizinischen Informationen, Diagnosen, Befunde oder " +
    "Empfehlungen hinzu. Gib ausschließlich den vorhandenen Inhalt vereinfacht und " +
    "verständlich wieder; erfinde nichts. Verwende einfache, kurze Sätze und kurze " +
    "Absätze, vermeide Fachbegriffe oder erkläre sie in Klammern. Wenn ein " +
    "Medikationsplan enthalten ist, stelle ihn als klare Einnahme-Übersicht dar " +
    "(Medikament — wann — wie viel). Der Text ist ein ENTWURF und wird vom Arzt geprüft."
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function errorMessage(code: string, s: Strings): string {
  switch (code) {
    case "not_in_brain":
      return s.errNotInBrain;
    case "permission_denied":
      return s.errPermissionDenied;
    case "llm_complete_timeout":
      return s.errTimeout;
    default:
      return s.errDefault;
  }
}

function App() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const c = colors(theme);
  const [uiLang, setUiLang] = useState<UiLang>(getStoredLang);
  const s = t(uiLang);
  const [source, setSource] = useState("");
  const [langCode, setLangCode] = useState("de");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const lang = LANGS.find((l) => l.code === langCode)!;

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    storeTheme(next);
  };

  const toggleUiLang = () => {
    const next: UiLang = uiLang === "de" ? "en" : "de";
    setUiLang(next);
    storeLang(next);
  };

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  const generate = async () => {
    if (!source.trim()) return;
    setLoading(true);
    setError(null);
    setResult("");
    try {
      const res = await llmComplete([
        { role: "system", content: systemPrompt(lang.targetName) },
        { role: "user", content: source },
      ]);
      setResult(res.text);
    } catch (e) {
      setError(errorMessage(String((e as Error).message || e), s));
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    flash((await copyText(result)) ? s.copiedToast : s.copyFailedToast);
  };

  const field: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem 0.7rem",
    fontSize: "0.95rem",
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    outline: "none",
    background: c.inputBg,
    color: c.text,
    fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, padding: "0 1rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: "1rem", paddingBottom: "3rem" }}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.7rem 0", borderBottom: `1px solid ${c.navBorder}`, marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: c.brand, letterSpacing: "0.04em" }}>hbar.health · Patientenbrief</span>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button type="button" onClick={toggleUiLang} style={{ padding: "0.2rem 0.55rem", fontSize: "0.75rem", fontWeight: 600, border: `1px solid ${c.border}`, borderRadius: 4, background: "transparent", color: c.muted, cursor: "pointer" }}>
              {uiLang === "de" ? "DE → EN" : "EN → DE"}
            </button>
            <button type="button" onClick={toggleTheme} style={{ padding: "0.2rem 0.55rem", fontSize: "0.75rem", fontWeight: 600, border: `1px solid ${c.border}`, borderRadius: 4, background: "transparent", color: c.muted, cursor: "pointer" }}>
              {theme === "light" ? "☀ → ☾" : "☾ → ☀"}
            </button>
          </div>
        </nav>

        <p style={{ color: c.muted, fontSize: "0.9rem", lineHeight: 1.55, margin: "0 0 1.25rem 0" }}>
          {s.introPara}
        </p>

        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: c.muted, display: "block", marginBottom: "0.35rem" }}>
          {s.freigegebenerTextLabel}
        </label>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder={s.freigegebenerTextPlaceholder}
          style={{ ...field, minHeight: 130, resize: "vertical" }}
        />

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.8rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: c.muted, display: "block", marginBottom: "0.35rem" }}>{s.zielspracheLabel}</label>
            <select value={langCode} onChange={(e) => setLangCode(e.target.value)} style={{ ...field, width: "auto", minWidth: 180, cursor: "pointer" }}>
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          <button type="button" className="rc-btn" disabled={loading || !source.trim()} onClick={generate} style={{ background: c.btnBg, color: c.btnText }}>
            {loading ? s.generatingButton : s.generateButton}
          </button>
          {!inBrain() && <span style={{ fontSize: "0.75rem", color: c.muted, fontStyle: "italic", alignSelf: "center" }}>{s.onlyInBrainHint}</span>}
        </div>

        {error && (
          <div style={{ marginTop: "1.25rem", padding: "0.85rem 1rem", background: c.overdueBg, borderLeft: `4px solid ${c.overdueText}`, borderRadius: 8, color: c.text, fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: "1.1rem 1.2rem", position: "relative" }}>
              <div style={{ position: "absolute", top: "0.9rem", right: "1rem", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", color: c.soonText }}>
                {s.entwurfBadge}
              </div>
              <div
                dir={lang.rtl ? "rtl" : "ltr"}
                style={{ fontSize: "0.98rem", lineHeight: 1.7, color: c.text, whiteSpace: "pre-wrap", textAlign: lang.rtl ? "right" : "left", marginTop: "0.5rem" }}
              >
                {result}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.7rem" }}>
              <button type="button" className="rc-small" onClick={copy} style={{ border: `1px solid ${c.border}`, background: c.card, color: c.text }}>
                {s.copyButton}
              </button>
            </div>
          </div>
        )}

        <p style={{ fontSize: "0.75rem", color: c.muted, marginTop: "2rem", lineHeight: 1.55 }}>
          {s.footerNote}
        </p>

        {toast && (
          <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", background: "#2a2a2a", color: "#fff", padding: "0.7rem 1.25rem", borderRadius: 8, fontSize: "0.9rem", boxShadow: "0 4px 16px rgba(0,0,0,0.3)", zIndex: 1100 }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
