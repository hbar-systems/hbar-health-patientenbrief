/**
 * UI-only i18n for the Patientenbrief brain-app.
 *
 * Translates ONLY the interface chrome (labels, buttons, hints, microcopy).
 * It does NOT touch the output-language dropdown (LANGS / langCode), the German
 * system prompt sent to the model, or the generated patient letter itself —
 * those are a separate feature and always German by design.
 */

export type Lang = "de" | "en";

const STORAGE_KEY = "hbar-health-lang";

export function getStoredLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "en") return "en";
  } catch {
    // SSR or blocked localStorage — fall back
  }
  return "de";
}

export function storeLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

export interface Strings {
  introPara: string;
  freigegebenerTextLabel: string;
  freigegebenerTextPlaceholder: string;
  zielspracheLabel: string;
  generateButton: string;
  generatingButton: string;
  onlyInBrainHint: string;
  entwurfBadge: string;
  copyButton: string;
  copiedToast: string;
  copyFailedToast: string;
  footerNote: string;
  // Error messages (errorMessage function)
  errNotInBrain: string;
  errPermissionDenied: string;
  errTimeout: string;
  errDefault: string;
}

const de: Strings = {
  introPara:
    "Vom Arzt freigegebenen Text patientenfreundlich umformulieren — in einfachem Deutsch oder übersetzt. Es werden nur vorhandene Inhalte vereinfacht, keine neuen medizinischen Aussagen erzeugt.",
  freigegebenerTextLabel: "Freigegebener Text (Befund, Notiz, Medikationsänderung)",
  freigegebenerTextPlaceholder: "Text hier einfügen…",
  zielspracheLabel: "Zielsprache des Briefs",
  generateButton: "Patientenbrief erstellen",
  generatingButton: "Erstelle…",
  onlyInBrainHint: "Nur im Praxis-Brain verfügbar",
  entwurfBadge: "ENTWURF",
  copyButton: "In Zwischenablage kopieren",
  copiedToast: "In die Zwischenablage kopiert.",
  copyFailedToast: "Kopieren fehlgeschlagen.",
  footerNote:
    "Der Patientenbrief ist ein Entwurf und gibt nur den vom Arzt freigegebenen Inhalt wieder. Bitte prüfen und freigeben — auch die Übersetzung — bevor er an die Patientin/den Patienten geht.",
  errNotInBrain: "Patientenbrief funktioniert nur innerhalb des Praxis-Brains.",
  errPermissionDenied: "Zugriff auf das Modell noch nicht freigegeben (Berechtigung im Brain bestätigen).",
  errTimeout: "Zeitüberschreitung — bitte erneut versuchen.",
  errDefault: "Text konnte nicht erzeugt werden (Modell nicht verfügbar). Bitte später erneut versuchen.",
};

const en: Strings = {
  introPara:
    "Rewrite doctor-approved text in patient-friendly language — in plain German or translated. Only existing content is simplified; no new medical statements are generated.",
  freigegebenerTextLabel: "Approved text (finding, note, medication change)",
  freigegebenerTextPlaceholder: "Paste text here…",
  zielspracheLabel: "Target language of the letter",
  generateButton: "Create patient letter",
  generatingButton: "Creating…",
  onlyInBrainHint: "Only available in the practice brain",
  entwurfBadge: "DRAFT",
  copyButton: "Copy to clipboard",
  copiedToast: "Copied to clipboard.",
  copyFailedToast: "Copy failed.",
  footerNote:
    "The patient letter is a draft and only reflects the content approved by the doctor. Please review and approve — including the translation — before it goes to the patient.",
  errNotInBrain: "Patientenbrief only works inside the practice brain.",
  errPermissionDenied: "Access to the model is not yet granted (confirm the permission in the brain).",
  errTimeout: "Timeout — please try again.",
  errDefault: "The text could not be generated (model unavailable). Please try again later.",
};

const strings: Record<Lang, Strings> = { de, en };

export function t(lang: Lang): Strings {
  return strings[lang];
}
