"use client";

import { motion } from "framer-motion";

interface PlanNoticeProps {
  resetTime?: string;
  modelName?: string;
}

/**
 * Soft pill notice shown when the user has hit a plan limit.
 * Sits centered below the composer in the empty state.
 */
export function PlanNotice({
  resetTime = "6:35 PM",
  modelName = "Crawl-4o",
}: PlanNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="px-5 py-3 rounded-2xl bg-paper-300/50 hairline max-w-md text-center"
    >
      <p className="text-[12.5px] text-ink-700 leading-snug">
        You&apos;ve hit the Free plan limit for{" "}
        <span className="font-medium text-ink-900">{modelName}</span>.{" "}
        <button className="underline decoration-ink-400 underline-offset-2 hover:text-ink-900">
          Subscribe to Pro
        </button>{" "}
        to increase limits.
      </p>
      <p className="mt-0.5 text-[11.5px] text-ink-500">
        Responses will use another model until your limit resets after{" "}
        {resetTime}.
      </p>
    </motion.div>
  );
}
