import { motion, AnimatePresence } from "framer-motion";

export type Reply = { id: string; label: string };

/**
 * Floating quick-reply chips near the bottom of the screen — the user's
 * voice in the conversation with Ava.
 */
export function QuickReplies({
  replies,
  onPick,
}: {
  replies: Reply[];
  onPick: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
      <AnimatePresence>
        <motion.div
          key={replies.map((r) => r.id).join("|")}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="flex gap-2 flex-wrap justify-center max-w-[720px]"
        >
          {replies.map((r) => (
            <button
              key={r.id}
              onClick={() => onPick(r.id)}
              className="glass-pill px-4 py-2 text-[13px] text-white/95 hover:bg-white/20 transition"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }}
            >
              {r.label}
            </button>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
