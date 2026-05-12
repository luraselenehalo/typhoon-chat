"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HistoryPanel } from "./HistoryPanel";
import { IconRail } from "./IconRail";
import type { Conversation } from "@/lib/types";

interface SidebarShellProps {
  onNew: () => void;
  onOpenAbout: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const HOVER_OPEN_DELAY = 2000; // ms — must dwell on the rail this long
const HOVER_CLOSE_DELAY = 200; // ms — grace period when crossing the gap

/**
 * Wraps icon rail + history panel.
 *
 * Two ways to expand:
 *  1. Click the PanelLeft button → pins open instantly.
 *  2. Hover for `HOVER_OPEN_DELAY` ms (2s) → auto-expands.
 *
 * The hover delay is deliberately long so the panel doesn't pop out just
 * because the user's cursor grazed the edge. Pinning bypasses the delay
 * entirely.
 *
 * Closing always honours a short grace period so the user can cross the
 * gap from rail → panel without the panel snapping shut underneath them.
 */
export function SidebarShell({
  onNew,
  onOpenAbout,
  conversations,
  activeId,
  onSelect,
  onDelete,
}: SidebarShellProps) {
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
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
    if (hovering || pinned || openTimer.current) return;
    openTimer.current = setTimeout(() => {
      setHovering(true);
      openTimer.current = null;
    }, HOVER_OPEN_DELAY);
  };

  const handleLeave = () => {
    // Cancel any pending open — user's no longer dwelling
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (!hovering) return;
    closeTimer.current = setTimeout(() => {
      setHovering(false);
      closeTimer.current = null;
    }, HOVER_CLOSE_DELAY);
  };

  useEffect(() => () => clearTimers(), [clearTimers]);

  const open = pinned || hovering;

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative flex shrink-0"
    >
      <IconRail
        onNew={() => {
          onNew();
          if (pinned) setPinned(false);
        }}
        onToggleHistory={() => {
          // Pin toggle bypasses the hover delay entirely
          clearTimers();
          setHovering(false);
          setPinned((p) => !p);
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
          if (!pinned) {
            clearTimers();
            setHovering(false);
          }
        }}
        onDelete={onDelete}
      />
    </div>
  );
}
