"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { AboutModal } from "@/components/AboutModal";
import { Composer } from "@/components/Composer";
import { ConversationView } from "@/components/ConversationView";
import { Onboarding } from "@/components/Onboarding";
import { SettingsModal } from "@/components/SettingsModal";
import { SidebarShell } from "@/components/SidebarShell";
import { TopBar } from "@/components/TopBar";
import { greetingKey } from "@/lib/greeting";
import { useI18n } from "@/lib/i18n/useI18n";
import { useChat } from "@/lib/useChat";
import { useSettings } from "@/lib/useSettings";
import { useUser } from "@/lib/useUser";
import type { ImageAttachment } from "@/lib/types";

export default function Home() {
  const { user, hydrated, save, clear } = useUser();

  if (!hydrated) return <SplashShell />;
  if (!user) return <Onboarding onSave={save} />;

  return <App user={user} onUserSave={save} onUserClear={clear} />;
}

function App({
  user,
  onUserSave,
  onUserClear,
}: {
  user: { apiKey: string; displayName: string };
  onUserSave: (u: { apiKey: string; displayName: string }) => void;
  onUserClear: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const { settings, replace: replaceSettings } = useSettings();
  const chat = useChat({ apiKey: user.apiKey, settings });

  const empty = chat.messages.length === 0;

  const handleRegenerate = () => {
    const lastUser = [...chat.messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    chat.send({
      text: lastUser.content,
      attachments: lastUser.attachments,
      flags: { deepSearch: false, reason: false },
    });
  };

  const handleSend = (payload: {
    text: string;
    attachments?: ImageAttachment[];
    hiddenPreamble?: string;
    flags: { deepSearch: boolean; reason: boolean };
  }) => {
    chat.send(payload);
  };

  return (
    <main className="min-h-screen w-screen p-3 md:p-4 bg-paper-200">
      <div className="relative h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2rem)] rounded-[28px] bg-paper-100 hairline overflow-hidden flex">
        <SidebarShell
          onNew={chat.startNew}
          onOpenAbout={() => setAboutOpen(true)}
          conversations={chat.conversations}
          activeId={chat.activeId}
          onSelect={chat.select}
          onDelete={chat.deleteConversation}
        />

        <section className="relative flex-1 flex flex-col min-w-0">
          <TopBar
            model={chat.model}
            onModelChange={chat.setModel}
            displayName={user.displayName}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          {empty ? (
            <EmptyHero
              displayName={user.displayName}
              onSend={handleSend}
              onStop={chat.stop}
              isStreaming={chat.isStreaming}
              apiKey={user.apiKey}
            />
          ) : (
            <>
              <ConversationView
                messages={chat.messages}
                isStreaming={chat.isStreaming}
                error={chat.error}
                onRegenerate={handleRegenerate}
              />
              <FloatingComposer
                onSend={handleSend}
                onStop={chat.stop}
                isStreaming={chat.isStreaming}
                apiKey={user.apiKey}
              />
            </>
          )}
        </section>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        onSaveUser={onUserSave}
        settings={settings}
        onSaveSettings={replaceSettings}
        onResetEverything={() => {
          chat.clearAllConversations();
          onUserClear();
        }}
      />

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}

function SplashShell() {
  return (
    <main className="min-h-screen w-screen bg-paper-200 grid place-items-center">
      <div className="w-2 h-2 rounded-full bg-ink-300 animate-pulse" />
    </main>
  );
}

interface HeroProps {
  displayName: string;
  onSend: (p: {
    text: string;
    attachments?: ImageAttachment[];
    hiddenPreamble?: string;
    flags: { deepSearch: boolean; reason: boolean };
  }) => void;
  onStop: () => void;
  isStreaming: boolean;
  apiKey: string;
}

function EmptyHero({
  displayName,
  onSend,
  onStop,
  isStreaming,
  apiKey,
}: HeroProps) {
  const { t } = useI18n();
  // greetingKey is recomputed on every render so the greeting flips when
  // the user crosses a time-of-day boundary mid-session.
  const greeting = useMemo(() => t(greetingKey(), { name: displayName }), [
    t,
    displayName,
  ]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-7"
        >
          <h1 className="text-[28px] md:text-[34px] font-medium tracking-tight text-ink-900">
            {greeting}
          </h1>
          <p className="mt-1.5 text-[14px] text-ink-500">
            {t("greeting.subtitle")}
          </p>
        </motion.div>

        <Composer
          onSend={onSend}
          onStop={onStop}
          isStreaming={isStreaming}
          apiKey={apiKey}
        />

        <p className="mt-6 text-[11.5px] text-ink-400">
          {t("footer.disclaimer")}
        </p>
      </div>
    </div>
  );
}

interface FloatingProps {
  onSend: (p: {
    text: string;
    attachments?: ImageAttachment[];
    hiddenPreamble?: string;
    flags: { deepSearch: boolean; reason: boolean };
  }) => void;
  onStop: () => void;
  isStreaming: boolean;
  apiKey: string;
}

function FloatingComposer({
  onSend,
  onStop,
  isStreaming,
  apiKey,
}: FloatingProps) {
  const { t } = useI18n();
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 md:px-8 pb-6">
      <div
        aria-hidden
        className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-paper-100 to-transparent"
      />
      <div className="pointer-events-auto mx-auto max-w-2xl">
        <Composer
          onSend={onSend}
          onStop={onStop}
          isStreaming={isStreaming}
          apiKey={apiKey}
        />
        <p className="mt-2.5 text-center text-[11px] text-ink-400">
          {t("footer.disclaimer")}
        </p>
      </div>
    </div>
  );
}
