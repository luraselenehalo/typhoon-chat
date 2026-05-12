"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Lock,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useI18n } from "@/lib/i18n/useI18n";
import type { UserPrefs } from "@/lib/user";

interface OnboardingProps {
  onSave: (prefs: UserPrefs) => void;
}

/**
 * First-run setup. Two fields, one CTA.
 *
 * The "Continue" handler validates the API key against our `/api/validate-key`
 * endpoint *before* persisting — if upstream returns 401 we keep the user on
 * the form with a clear error.
 */
export function Onboarding({ onSave }: OnboardingProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validating) return;

    const trimmedName = name.trim();
    const trimmedKey = apiKey.trim();

    if (!trimmedName) return setError(t("onboarding.error.name"));
    if (!trimmedKey) return setError(t("onboarding.error.keyEmpty"));
    if (trimmedKey.length < 16)
      return setError(t("onboarding.error.keyShort"));

    setError(null);
    setValidating(true);
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { Authorization: `Bearer ${trimmedKey}` },
      });
      const data = (await res.json()) as {
        valid: boolean;
        network?: boolean;
      };

      if (!data.valid) {
        setError(
          data.network
            ? t("onboarding.error.network")
            : t("onboarding.error.keyInvalid"),
        );
        return;
      }

      onSave({ apiKey: trimmedKey, displayName: trimmedName });
    } catch {
      setError(t("onboarding.error.network"));
    } finally {
      setValidating(false);
    }
  };

  return (
    <main className="min-h-dvh w-screen p-3 md:p-4 bg-paper-200 grid place-items-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-paper-100 rounded-3xl md:rounded-[28px] hairline shadow-card p-6 md:p-8"
      >
        <div className="flex items-center gap-2.5 mb-7">
          <BrandMark />
          <span className="text-[14px] font-medium tracking-tight text-ink-900">
            {t("onboarding.brand")}
          </span>
        </div>

        <h1 className="text-[24px] md:text-[26px] font-semibold tracking-tight text-ink-900">
          {t("onboarding.title")}
        </h1>
        <p className="mt-1.5 text-[13.5px] text-ink-500 leading-relaxed">
          {t("onboarding.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <Field
            label={t("onboarding.name.label")}
            value={name}
            onChange={setName}
            placeholder={t("onboarding.name.placeholder")}
            autoFocus
            disabled={validating}
          />

          <div>
            <Field
              label={t("onboarding.key.label")}
              value={apiKey}
              onChange={setApiKey}
              placeholder={t("onboarding.key.placeholder")}
              type={showKey ? "text" : "password"}
              monospace
              disabled={validating}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="p-1 rounded-md text-ink-400 hover:text-ink-900 transition-colors"
                  aria-label={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
            <a
              href="https://playground.opentyphoon.ai/"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-ink-500 hover:text-ink-900 transition-colors"
            >
              {t("onboarding.key.link")}
              <ExternalLink size={11} />
            </a>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-3 py-2 text-[12.5px] text-rose-700 dark:text-rose-300"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={validating}
            className="w-full flex items-center justify-center gap-1.5 h-11 rounded-2xl bg-ink-900 text-paper-50 text-[14px] font-medium hover:bg-ink-700 disabled:opacity-70 transition-colors"
          >
            {validating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {t("onboarding.cta.validating")}
              </>
            ) : (
              <>
                {t("onboarding.cta")}
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2 text-[11.5px] text-ink-400 leading-relaxed">
          <Lock size={11} className="mt-0.5 shrink-0" />
          <span>{t("onboarding.security")}</span>
        </div>
      </motion.div>
    </main>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "password";
  monospace?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  suffix?: React.ReactNode;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  monospace,
  autoFocus,
  disabled,
  suffix,
}: FieldProps) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-[12px] font-medium text-ink-700">
        {label}
      </span>
      <div className="flex items-center gap-1 px-3.5 h-11 rounded-2xl bg-paper-50 hairline focus-within:border-ink-400/60 transition-colors">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          autoFocus={autoFocus}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className={`flex-1 min-w-0 bg-transparent text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none disabled:opacity-60 ${
            monospace ? "font-mono text-[13px]" : ""
          }`}
        />
        {suffix}
      </div>
    </label>
  );
}

function BrandMark() {
  return (
    <div className="relative w-6 h-6 rounded-full grid place-items-center bg-ink-900">
      <div className="w-2 h-2 rounded-full bg-paper-50" />
    </div>
  );
}
