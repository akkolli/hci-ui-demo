import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Heart, Sparkles } from "lucide-react";
import { Window } from "../components/Window";
import { useStore } from "../store";

/**
 * Task:
 *   Brainstorm with Ava on a shared prompt. You must contribute at least
 *   two of your own notes AND react (heart) to at least one of Ava's notes.
 *
 * Ava feels like a person:
 *   - She types notes live with a typing-dots indicator on the board
 *   - Her phrasing is casual and human ("tbh", "idk", lowercase)
 *   - She pauses between notes like she's thinking
 *   - When you post a note she reads it (gaze lingers), sometimes
 *     reacts with a heart back
 */

type Note = {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  author: "ava" | "you";
  reactedByOther?: boolean; // heart from the other person
};

const PROMPT =
  "How can we make remote collaboration feel less lonely?";

// Ava's scripted contributions — casual, human phrasing.
const AVA_NOTES: { text: string; x: number; y: number; color: string }[] = [
  { text: "presence ≠ video feeds\n(passive awareness wins)", x: 60, y: 40, color: "#FFB3C6" },
  { text: "ambient audio from their room — tiny, always-on", x: 240, y: 70, color: "#B8E7C1" },
  { text: "shared hobbies, not shared screens", x: 450, y: 140, color: "#A8D8FF" },
  { text: "let ppl leave little traces\n(sticky notes, half-drawings)", x: 130, y: 220, color: "#FFD98A" },
];

const STICKY_PALETTE = ["#C8E3FF", "#FFD9A8", "#D3FFD0", "#E8D0FF"];

export function StickyBoard() {
  const setGaze = useStore((s) => s.setGaze);
  const setAvaFocus = useStore((s) => s.setAvaFocus);
  const setCaption = useStore((s) => s.setCaption);
  const setAvaTyping = useStore((s) => s.setAvaTyping);
  const setTaskReady = useStore((s) => s.setTaskReady);
  const remote = useStore((s) => s.remote);

  const [notes, setNotes] = useState<Note[]>([]);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [typingPos, setTypingPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  /** Queue of user-note ids waiting for Ava to react to. */
  const reactionQueue = useRef<string[]>([]);
  const userNoteCount = notes.filter((n) => n.author === "you").length;
  const heartedAva = notes.filter(
    (n) => n.author === "ava" && n.reactedByOther,
  ).length;

  useEffect(() => {
    setTaskReady(userNoteCount >= 2 && heartedAva >= 1);
  }, [userNoteCount, heartedAva, setTaskReady]);

  // Single serial Ava driver. Priorities each tick:
  //   1. If user has posted a note recently, react to it.
  //   2. Otherwise, post the next scripted note.
  //   3. Otherwise, idle — re-read the board.
  // This avoids races where a user-note reaction gets stomped by a
  // scripted-post step (or vice versa).
  useEffect(() => {
    let cancelled = false;
    let avaStep = 0;

    const boardOffset = () => {
      const el = document.getElementById("board-surface");
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top };
    };

    const postAvaNote = async (ix: number) => {
      const n = AVA_NOTES[ix];
      const off = boardOffset();
      setGaze({ x: n.x + 90 + off.x, y: n.y + 60 + off.y });
      setAvaFocus("board");
      setCaption("thinking");
      setTypingPos({ x: n.x + 90, y: n.y + 60 });
      setAvaTyping(true);

      await wait(1300 + Math.random() * 500);
      if (cancelled) return;

      setAvaTyping(false);
      setTypingPos(null);
      const noteId = `a${ix}`;
      setNotes((ns) => [
        ...ns,
        {
          id: noteId,
          text: n.text,
          x: n.x,
          y: n.y,
          color: n.color,
          author: "ava",
        },
      ]);
      setGaze({ selector: `#note-${noteId}` });
      setCaption("posted a thought");
      await wait(1400 + Math.random() * 700);
    };

    const reactToUserNote = async (id: string) => {
      // Any in-flight typing indicator must clear before Ava pivots
      setAvaTyping(false);
      setTypingPos(null);
      await wait(350 + Math.random() * 300);
      if (cancelled) return;
      setGaze({ selector: `#note-${id}` });
      setAvaFocus("board");
      setCaption("reading your note");
      await wait(1100 + Math.random() * 500);
      if (cancelled) return;

      if (Math.random() < 0.7) {
        setNotes((ns) =>
          ns.map((n) =>
            n.id === id ? { ...n, reactedByOther: true } : n,
          ),
        );
        setCaption("❤️ loved that");
      } else {
        const verbal = ["mm yeah", "good one", "oh nice", "fair point"];
        setCaption(verbal[Math.floor(Math.random() * verbal.length)]);
      }
      await wait(1400);
    };

    const idleBeat = async () => {
      setAvaFocus("board");
      setCaption("reading the board");
      // Occasionally glance at you
      if (Math.random() < 0.3) {
        setGaze({ selector: "#facetime" });
        setAvaFocus("facetime");
        setCaption("glancing at you");
        await wait(1400);
      } else {
        await wait(2200 + Math.random() * 1400);
      }
    };

    const run = async () => {
      await wait(1200);
      while (!cancelled) {
        if (reactionQueue.current.length > 0) {
          const id = reactionQueue.current.shift()!;
          await reactToUserNote(id);
          continue;
        }
        if (avaStep < AVA_NOTES.length) {
          await postAvaNote(avaStep);
          avaStep += 1;
          continue;
        }
        await idleBeat();
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [setGaze, setAvaFocus, setCaption, setAvaTyping]);

  const onPostNote = (text: string) => {
    if (!text.trim()) return;
    const id = `u${Date.now()}`;
    const x = 180 + Math.random() * 220;
    const y = 170 + Math.random() * 70;
    const color = STICKY_PALETTE[userNoteCount % STICKY_PALETTE.length];
    setNotes((ns) => [...ns, { id, text, x, y, color, author: "you" }]);
    setDraft("");
    setComposing(false);
    // Queue the reaction — the serial driver will pick it up on its next tick
    reactionQueue.current.push(id);
  };

  const onToggleHeart = (id: string) => {
    setNotes((ns) =>
      ns.map((n) =>
        n.author === "ava" && n.id === id
          ? { ...n, reactedByOther: !n.reactedByOther }
          : n,
      ),
    );
  };

  return (
    <div className="flex gap-6 w-full h-full">
      <Window
        id="board-window"
        title="Shared Board · Brainstorm"
        subtitle={`with ${remote.name}`}
        className="flex-1 min-w-0"
        toolbar={
          <button
            onClick={() => setComposing(true)}
            className="glass-pill px-2.5 py-1 text-[11px] text-white/90 flex items-center gap-1.5 hover:bg-white/20 transition"
          >
            <Plus className="w-3 h-3" /> Add your note
          </button>
        }
      >
        <div id="board-surface" className="relative h-full overflow-hidden">
          {/* Dot grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Prompt banner */}
          <div className="absolute top-4 left-4 right-4 flex items-center gap-2 z-10 pointer-events-none">
            <div
              className="glass-pill px-3 py-1.5 text-[12px] text-white/90 flex items-center gap-2"
              style={{ border: `1px solid ${remote.color}44` }}
            >
              <Sparkles className="w-3 h-3" style={{ color: remote.color }} />
              <span className="font-medium">Prompt:</span>
              <span className="text-white/80">{PROMPT}</span>
            </div>
            <div className="ml-auto glass-pill px-2.5 py-1 text-[11px] text-white/70">
              {userNoteCount} of 2 yours · {heartedAva}/1 ❤️
            </div>
          </div>

          {/* Ava's "typing here" indicator on the board */}
          <AnimatePresence>
            {typingPos && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  left: typingPos.x,
                  top: typingPos.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <BoardTypingDots color={remote.color} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {notes.map((n) => (
              <StickyNote
                key={n.id}
                note={n}
                remoteColor={remote.color}
                onHeart={() => onToggleHeart(n.id)}
              />
            ))}
          </AnimatePresence>

          {composing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-sm z-20"
              onClick={(e) =>
                e.target === e.currentTarget && setComposing(false)
              }
            >
              <div className="glass-window p-5 w-[360px]">
                <div className="text-[11px] text-white/55 uppercase tracking-[0.18em] mb-2">
                  Your note
                </div>
                <div className="text-[11.5px] text-white/55 mb-2">
                  Respond to the prompt or react to Ava's notes.
                </div>
                <textarea
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="e.g. let people casually co-exist without performing…"
                  rows={3}
                  className="w-full bg-white/8 rounded-xl px-3 py-2 text-[13px] text-white placeholder-white/35 outline-none border border-white/15 focus:border-white/40"
                  style={{ resize: "none" }}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setComposing(false)}
                    className="glass-pill px-3 py-1.5 text-[12px] text-white/75"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onPostNote(draft)}
                    disabled={!draft.trim()}
                    className="px-4 py-1.5 rounded-full text-[12px] font-medium transition"
                    style={{
                      background: draft.trim()
                        ? "#ffffff"
                        : "rgba(255,255,255,0.2)",
                      color: draft.trim() ? "#111" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Window>
    </div>
  );
}

function StickyNote({
  note,
  remoteColor,
  onHeart,
}: {
  note: Note;
  remoteColor: string;
  onHeart: () => void;
}) {
  const isAva = note.author === "ava";
  return (
    <motion.div
      id={`note-${note.id}`}
      layout
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: 190,
        transform: `rotate(${hashRot(note.id)}deg)`,
      }}
    >
      <div
        className="relative rounded-[14px] p-3.5 pb-5 shadow-[0_14px_30px_-10px_rgba(0,0,0,0.55)]"
        style={{
          background: `linear-gradient(160deg, ${note.color}, ${shade(note.color, -10)})`,
          color: "#1d1526",
          fontFamily: "'Bradley Hand', 'Marker Felt', cursive",
          fontSize: 14.5,
          lineHeight: 1.3,
          whiteSpace: "pre-wrap",
          border: isAva
            ? `1.5px solid ${remoteColor}88`
            : "1.5px solid rgba(255,255,255,0.4)",
        }}
      >
        {note.text}

        {/* author chip */}
        <div
          className="absolute -top-2 left-2 text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            background: isAva ? remoteColor : "#1d1526",
            color: "white",
          }}
        >
          {isAva ? "Ava" : "You"}
        </div>

        {/* heart button */}
        <button
          onClick={onHeart}
          className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full grid place-items-center transition"
          style={{
            background: note.reactedByOther
              ? "#ff3b6b"
              : "rgba(29,21,38,0.88)",
            color: "white",
            boxShadow: note.reactedByOther
              ? "0 6px 16px rgba(255,59,107,0.55)"
              : "0 4px 10px rgba(0,0,0,0.4)",
          }}
        >
          <Heart
            className="w-3.5 h-3.5"
            strokeWidth={note.reactedByOther ? 0 : 2}
            fill={note.reactedByOther ? "white" : "transparent"}
          />
        </button>
      </div>
    </motion.div>
  );
}

function BoardTypingDots({ color }: { color: string }) {
  return (
    <div
      className="glass-pill px-2.5 py-1.5 flex items-center gap-1"
      style={{ border: `1px solid ${color}66` }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block rounded-full"
          style={{ width: 4, height: 4, background: color }}
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function hashRot(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((h % 9) - 4) * 0.6;
}

function shade(hex: string, amt: number) {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

