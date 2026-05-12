"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ExternalLink,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { LANGUAGE_META, LANGUAGES, type Lang } from "@/lib/i18n/dict";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  ADVANCED_KEYS,
  ADVANCED_RANGES,
  DEFAULT_SETTINGS,
  diffFromDefaults,
  type AdvancedKey,
  type Settings,
} from "@/lib/settings";
import type { UserPrefs } from "@/lib/user";
import { useTheme } from "@/lib/useTheme";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  user: UserPrefs;
  onSaveUser: (prefs: UserPrefs) => void;
  settings: Settings;
  onSaveSettings: (next: Settings) => void;
  onResetEverything: () => void;
}

type Tab = "basic" | "advanced";

/**
 * Settings dialog with two tabs:
 *  - Basic     — name, API key, theme, language
 *  - Advanced  — model sampling params (temperature, top_p, etc.)
 *
 * The form is local-only until the user hits Save. While any field has been
 * touched, the "Cancel" button morphs into "Save". Resetting from Advanced
 * surfaces a confirm list of exactly which params will revert.
 */
export function SettingsModal({
  open,
  onClose,
  user,
  onSaveUser,
  settings,
  onSaveSettings,
  onResetEverything,
}: SettingsModalProps) {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();

  // Local draft state — never touches the real stores until Save
  const [tab, setTab] = useState<Tab>("basic");
  const [draftName, setDraftName] = useState(user.displayName);
  const [draftKey, setDraftKey] = useState(user.apiKey);
  const [draftTheme, setDraftTheme] = useState<"light" | "dark">(theme);
  const [draftSettings, setDraftSettings] = useState<Settings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDanger, setConfirmDanger] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTab("basic");
    setDraftName(user.displayName);
    setDraftKey(user.apiKey);
    setDraftTheme(theme);
    setDraftSettings(settings);
    setShowKey(false);
    setConfirmReset(false);
    setConfirmDanger(false);
  }, [open, user, theme, settings]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const dirty = useMemo(() => {
    if (draftName.trim() !== user.displayName) return true;
    if (draftKey.trim() !== user.apiKey) return true;
    if (draftTheme !== theme) return true;
    if (draftSettings.language !== settings.language) return true;
    for (const k of ADVANCED_KEYS) {
      if (draftSettings[k] !== settings[k]) return true;
    }
    return false;
  }, [
    draftName,
    draftKey,
    draftTheme,
    draftSettings,
    user.displayName,
    user.apiKey,
    theme,
    settings,
  ]);

  const draftDiffs = diffFromDefaults(draftSettings);

  const handleSave = () => {
    const name = draftName.trim();
    const key = draftKey.trim();
    if (!name || key.length < 16) return;

    if (name !== user.displayName || key !== user.apiKey) {
      onSaveUser({ displayName: name, apiKey: key });
    }
    if (draftTheme !== theme) setTheme(draftTheme);
    onSaveSettings(draftSettings);
    onClose();
  };

  const handleResetAdvanced = () => {
    setDraftSettings((prev) => ({
      ...prev,
      maxCompletionTokens: DEFAULT_SETTINGS.maxCompletionTokens,
      temperature: DEFAULT_SETTINGS.temperature,
      topP: DEFAULT_SETTINGS.topP,
      frequencyPenalty: DEFAULT_SETTINGS.frequencyPenalty,
    }));
    setConfirmReset(false);
  };

  // No AnimatePresence on the backdrop: when Save flips `open=false` AND
  // the language/settings update at the same tick, the outer exit animation
  // can race with React's re-render and leave a transparent backdrop layer
  // sitting on top of the page, blocking clicks. Plain conditional render
  // tears the overlay down synchronously.
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-stretch md:place-items-center md:p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-lg bg-paper-100 md:rounded-3xl md:hairline md:shadow-card overflow-hidden flex flex-col h-dvh md:h-auto md:max-h-[88vh]"
      >
            <header className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
              <div>
                <h2 className="text-[15px] font-medium text-ink-900">
                  {t("settings.title")}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-md text-ink-400 hover:text-ink-900 hover:bg-paper-300/70 transition-colors"
              >
                <X size={15} />
              </button>
            </header>

            <Tabs tab={tab} onChange={setTab} />

            <div className="flex-1 overflow-y-auto px-6 pb-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.14 }}
                >
                  {tab === "basic" ? (
                    <BasicPanel
                      name={draftName}
                      onName={setDraftName}
                      apiKey={draftKey}
                      onApiKey={setDraftKey}
                      showKey={showKey}
                      onToggleShowKey={() => setShowKey((v) => !v)}
                      theme={draftTheme}
                      onTheme={setDraftTheme}
                      language={draftSettings.language}
                      onLanguage={(lang) =>
                        setDraftSettings((s) => ({ ...s, language: lang }))
                      }
                    />
                  ) : (
                    <AdvancedPanel
                      settings={draftSettings}
                      onChange={(patch) =>
                        setDraftSettings((s) => ({ ...s, ...patch }))
                      }
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {tab === "advanced" && (
              <div className="px-6 pt-1 pb-3 shrink-0">
                <AnimatePresence initial={false}>
                  {confirmReset ? (
                    <ResetConfirm
                      keys={draftDiffs}
                      onConfirm={handleResetAdvanced}
                      onCancel={() => setConfirmReset(false)}
                    />
                  ) : (
                    <motion.button
                      key="reset-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setConfirmReset(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[12px] text-ink-500 hover:text-ink-900 hover:bg-paper-300/70 transition-colors"
                    >
                      <RotateCcw size={12} />
                      {t("settings.reset")}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            <footer className="px-6 pb-5 pt-2 flex items-center justify-between gap-3 shrink-0 border-t border-paper-300/40">
              <AnimatePresence mode="wait" initial={false}>
                {confirmDanger ? (
                  <motion.div
                    key="danger-confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-[12px] text-rose-700 dark:text-rose-400"
                  >
                    <span>{t("settings.danger.confirm")}</span>
                    <button
                      onClick={() => {
                        onResetEverything();
                        onClose();
                      }}
                      className="px-2.5 h-7 rounded-full bg-rose-600 text-white text-[12px] hover:bg-rose-700 transition-colors"
                    >
                      {t("settings.danger.confirmYes")}
                    </button>
                    <button
                      onClick={() => setConfirmDanger(false)}
                      className="px-2.5 h-7 rounded-full text-ink-500 hover:text-ink-900 transition-colors"
                    >
                      {t("settings.danger.confirmNo")}
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="danger-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setConfirmDanger(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[12px] text-ink-500 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={12} />
                    {t("settings.danger.clear")}
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2 ml-auto">
                {!dirty ? (
                  <button
                    onClick={onClose}
                    className="px-3.5 h-9 rounded-full text-[13px] text-ink-700 hover:bg-paper-300/70 transition-colors"
                  >
                    {t("settings.cancel")}
                  </button>
                ) : (
                  <motion.button
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={handleSave}
                    className="px-3.5 h-9 rounded-full text-[13px] font-medium bg-ink-900 text-paper-50 hover:bg-ink-700 transition-colors"
                  >
                    {t("settings.save")}
                  </motion.button>
                )}
              </div>
            </footer>
      </motion.div>
    </div>
  );
}

function Tabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const { t } = useI18n();
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "basic", label: t("settings.tab.basic") },
    { id: "advanced", label: t("settings.tab.advanced") },
  ];
  return (
    <div className="px-6 pb-3 shrink-0">
      <div className="inline-flex bg-paper-300/40 rounded-full p-0.5">
        {tabs.map((tt) => {
          const active = tt.id === tab;
          return (
            <button
              key={tt.id}
              onClick={() => onChange(tt.id)}
              className="relative px-3 h-7 rounded-full text-[12.5px] text-ink-700"
            >
              {active && (
                <motion.span
                  layoutId="settings-tab"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-paper-50 shadow-card"
                />
              )}
              <span
                className={`relative ${active ? "text-ink-900 font-medium" : "text-ink-500"}`}
              >
                {tt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface BasicPanelProps {
  name: string;
  onName: (v: string) => void;
  apiKey: string;
  onApiKey: (v: string) => void;
  showKey: boolean;
  onToggleShowKey: () => void;
  theme: "light" | "dark";
  onTheme: (t: "light" | "dark") => void;
  language: Lang;
  onLanguage: (l: Lang) => void;
}

function BasicPanel({
  name,
  onName,
  apiKey,
  onApiKey,
  showKey,
  onToggleShowKey,
  theme,
  onTheme,
  language,
  onLanguage,
}: BasicPanelProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <Field
        label={t("settings.basic.name")}
        value={name}
        onChange={onName}
      />
      <div>
        <Field
          label={t("settings.basic.key")}
          value={apiKey}
          onChange={onApiKey}
          type={showKey ? "text" : "password"}
          monospace
          suffix={
            <button
              type="button"
              onClick={onToggleShowKey}
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
          playground.opentyphoon.ai
          <ExternalLink size={11} />
        </a>
      </div>

      <Row label={t("settings.basic.theme")}>
        <Segmented
          value={theme}
          onChange={(v) => onTheme(v as "light" | "dark")}
          options={[
            {
              value: "light",
              label: t("settings.basic.theme.light"),
              icon: <Sun size={13} />,
            },
            {
              value: "dark",
              label: t("settings.basic.theme.dark"),
              icon: <Moon size={13} />,
            },
          ]}
        />
      </Row>

      <Row label={t("settings.basic.language")}>
        <select
          value={language}
          onChange={(e) => onLanguage(e.target.value as Lang)}
          className="bg-paper-50 hairline rounded-xl h-9 px-3 text-[13px] text-ink-900 focus:outline-none focus:border-ink-400/60"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {LANGUAGE_META[l].native} · {LANGUAGE_META[l].label}
            </option>
          ))}
        </select>
      </Row>
    </div>
  );
}

function AdvancedPanel({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}) {
  const { t } = useI18n();
  const items: Array<{
    key: AdvancedKey;
    label: string;
    desc: string;
  }> = [
    {
      key: "maxCompletionTokens",
      label: t("settings.adv.maxTokens"),
      desc: t("settings.adv.maxTokens.desc"),
    },
    {
      key: "temperature",
      label: t("settings.adv.temperature"),
      desc: t("settings.adv.temperature.desc"),
    },
    {
      key: "topP",
      label: t("settings.adv.topP"),
      desc: t("settings.adv.topP.desc"),
    },
    {
      key: "frequencyPenalty",
      label: t("settings.adv.freqPenalty"),
      desc: t("settings.adv.freqPenalty.desc"),
    },
  ];

  return (
    <div className="space-y-5 pb-2">
      {items.map((item) => (
        <SliderField
          key={item.key}
          label={item.label}
          desc={item.desc}
          value={settings[item.key]}
          range={ADVANCED_RANGES[item.key]}
          onChange={(v) => onChange({ [item.key]: v } as Partial<Settings>)}
          isDefault={settings[item.key] === DEFAULT_SETTINGS[item.key]}
        />
      ))}
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  desc: string;
  value: number;
  range: { min: number; max: number; step: number };
  onChange: (n: number) => void;
  isDefault: boolean;
}

function SliderField({
  label,
  desc,
  value,
  range,
  onChange,
  isDefault,
}: SliderFieldProps) {
  const decimals = range.step < 1 ? 2 : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[13px] font-medium text-ink-900">{label}</span>
        <span
          className={`text-[12px] tabular-nums ${
            isDefault ? "text-ink-400" : "text-ink-900 font-medium"
          }`}
        >
          {value.toFixed(decimals)}
        </span>
      </div>
      <p className="text-[11.5px] text-ink-500 leading-relaxed mb-2">{desc}</p>
      <input
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-ink-900"
      />
    </div>
  );
}

interface ResetConfirmProps {
  keys: AdvancedKey[];
  onConfirm: () => void;
  onCancel: () => void;
}

function ResetConfirm({ keys, onConfirm, onCancel }: ResetConfirmProps) {
  const { t } = useI18n();
  const labels: Record<AdvancedKey, string> = {
    maxCompletionTokens: t("settings.adv.maxTokens"),
    temperature: t("settings.adv.temperature"),
    topP: t("settings.adv.topP"),
    frequencyPenalty: t("settings.adv.freqPenalty"),
  };

  return (
    <motion.div
      key="reset-confirm"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="rounded-2xl bg-paper-300/40 hairline p-3 space-y-2"
    >
      {keys.length === 0 ? (
        <p className="text-[12.5px] text-ink-500">
          {t("settings.reset.empty")}
        </p>
      ) : (
        <>
          <p className="text-[12.5px] text-ink-700">{t("settings.reset.title")}</p>
          <ul className="space-y-0.5 pl-1">
            {keys.map((k) => (
              <li
                key={k}
                className="text-[12.5px] text-ink-900 flex items-center gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-ink-500" />
                {labels[k]}
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-2.5 h-7 rounded-full text-[12px] text-ink-500 hover:text-ink-900 transition-colors"
        >
          {t("settings.reset.cancel")}
        </button>
        {keys.length > 0 && (
          <button
            onClick={onConfirm}
            className="px-2.5 h-7 rounded-full bg-ink-900 text-paper-50 text-[12px] hover:bg-ink-700 transition-colors"
          >
            {t("settings.reset.confirm")}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] font-medium text-ink-700">{label}</span>
      <div>{children}</div>
    </div>
  );
}

interface SegmentedProps {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string; icon?: ReactNode }>;
}

function Segmented({ value, onChange, options }: SegmentedProps) {
  return (
    <div className="inline-flex bg-paper-300/40 rounded-full p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[12px]"
          >
            {active && (
              <motion.span
                layoutId="settings-segment"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="absolute inset-0 rounded-full bg-paper-50 shadow-card"
              />
            )}
            <span
              className={`relative inline-flex items-center gap-1.5 ${active ? "text-ink-900" : "text-ink-500"}`}
            >
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "password";
  monospace?: boolean;
  suffix?: ReactNode;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  monospace,
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
          autoComplete="off"
          spellCheck={false}
          className={`flex-1 min-w-0 bg-transparent text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none ${
            monospace ? "font-mono text-[13px]" : ""
          }`}
        />
        {suffix}
      </div>
    </label>
  );
}
