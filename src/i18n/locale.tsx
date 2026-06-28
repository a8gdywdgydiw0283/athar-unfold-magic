import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import ar from "./ar.json";
import en from "./en.json";

export type Locale = "ar" | "en";

const MESSAGES: Record<Locale, Record<string, unknown>> = { ar, en };
const STORAGE_KEY = "athar-locale";
const DEFAULT_LOCALE: Locale = "ar";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  messages: Record<string, unknown>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "ar" || saved === "en") setLocaleState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.documentElement.setAttribute("data-locale", locale);
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {}
    setLocaleState(l);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, messages: MESSAGES[locale] }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  return ctx?.locale ?? DEFAULT_LOCALE;
}

export function useSetLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useSetLocale must be used within LocaleProvider");
  return ctx.setLocale;
}

function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export type Translator = ((key: string) => string) & { raw: (key: string) => unknown };

export function useTranslations(namespace: string): Translator {
  const ctx = useContext(LocaleContext);
  const ns = ctx ? resolvePath(ctx.messages, namespace) : undefined;

  const t = ((key: string) => {
    const value = resolvePath(ns, key);
    return typeof value === "string" ? value : key;
  }) as Translator;

  t.raw = (key: string) => resolvePath(ns, key);
  return t;
}