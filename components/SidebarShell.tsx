"use client";

import { useCallback, useEffect, useRef } from "react";
import { HistoryPanel } from "./HistoryPanel";
import { IconRail } from "./IconRail";
import type { Conversation } from "@/lib/types";

interface SidebarShellProps {
  /** Open state lifted up — parent controls both desktop hover/pin and
      the mobile hamburger entry-point. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNew: () => void;
  onOpenAbout: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const HOVER_OPEN_DELAY = 2000;
const HOVER_CLOSE_DELAY = 200;

/**
 * Sidebar shell.
 *
 * - On **desktop** (md+), the rail is visible. Hovering for 2 s expands the
 *   panel, hover-out collapses it after a short grace period. The PanelLeft
 *   button toggles a "pinned" state that bypasses the hover delay.
 * - On **mobile**, the rail is hidden entirely. The history panel renders
 *   as a slide-in drawer over a backdrop; the open trigger lives in the
 *   TopBar's hamburger.
 *
 * Both modes write to the same `open` prop owned by the page, so toggling
 * from any surface keeps state consistent.
 */
export function SidebarShell({
  open,
  onOpenChange,
  onNew,
  onOpenAbout,
  conversations,
  activeId,
  onSelect,
  onDelete,
}: SidebarShellProps) {
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const handleEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (open || openTimer.current) return;
    openTimer.current = setTimeout(() => {
      onOpenChange(true);
      openTimer.current = null;
    }, HOVER_OPEN_DELAY);
  };

  const handleLeave = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (!open) return;
    closeTimer.current = setTimeout(() => {
      onOpenChange(false);
      closeTimer.current = null;
    }, HOVER_CLOSE_DELAY);
  };

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <>
      {/* Desktop rail + inline panel — hidden on mobile.
          Hover listeners are scoped to this wrapper, so no mobile event
          ever fires them. */}
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="hidden md:flex relative shrink-0"
      >
        <IconRail
          onNew={() => {
            onNew();
            if (open) onOpenChange(false);
          }}
          onToggleHistory={() => {
            clearTimers();
            onOpenChange(!open);
          }}
          onOpenAbout={onOpenAbout}
          newActive={!open}
        />
        <HistoryPanel
          open={open}
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => {
            onSelect(id);
            // Hover-opened panels auto-collapse on select; pinned ones stay
            clearTimers();
            onOpenChange(false);
          }}
          onDelete={onDelete}
          onClose={() => onOpenChange(false)}
          onOpenAbout={onOpenAbout}
        />
      </div>

      {/* Mobile drawer renders independently of the desktop block.
          The HistoryPanel itself decides which presentation to render
          via responsive classes — this just lives outside the rail
          wrapper so it can overlay full-screen. */}
      <div className="md:hidden">
        <HistoryPanel
          open={open}
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => {
            onSelect(id);
            onOpenChange(false);
          }}
          onDelete={onDelete}
          onClose={() => onOpenChange(false)}
          onOpenAbout={onOpenAbout}
        />
      </div>
    </>
  );
}
