import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CornerDownRight, Users, Sparkles } from "lucide-react";
import { Window } from "../components/Window";
import { useStore } from "../store";

/**
 * Task:
 *   Write a 2-sentence abstract for a research memo. Ava reads along in
 *   real time — her gaze follows what you're typing, she drops comments
 *   with a visible typing indicator, and she reacts to decisions you
 *   make. Task completes when you've written ≥ 25 words AND resolved
 *   at least one of Ava's comments.
 *
 * Ava's comments feel human: lowercase, casual, sometimes with small
 * filler phrasings ("hmm", "ok", "yeah"). She doesn't sound like an AI.
 */

type Comment = {
  id: string;
  text: string;
  resolved?: "accepted" | "dismissed";
};

const CONTEXT = `We ran a six-week pilot study of our shared-space collaboration prototype with the design and engineering teams. Twelve pairs completed a co-editing task inside a virtual room with presence cues (gaze indicators, directional arrows, ambient hand motion). We recorded time-to-consensus and awareness of peer activity.`;

const TITLE = "Pilot Study · Shared-Space Collaboration";

export function DocEditor() {
  const setGaze = useStore((s) => s.setGaze);
  const setAvaFocus = useStore((s) => s.setAvaFocus);
  const setCaption = useStore((s) => s.setCaption);
  const setAvaTyping = useStore((s) => s.setAvaTyping);
  const avaTyping = useStore((s) => s.avaTyping);
  const setTaskReady = useStore((s) => s.setTaskReady);
  const remote = useStore((s) => s.remote);

  const [userText, setUserText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const avaBeat = useRef(0); // how far along Ava's reactive cadence is
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const words = userText.trim() ? userText.trim().split(/\s+/).length : 0;
  const resolved = comments.filter((c) => c.resolved).length;

  // Task completion: real word count + resolved comment
  useEffect(() => {
    setTaskReady(words >= 25 && resolved >= 1);
  }, [words, resolved, setTaskReady]);

  // Ava idles on the memo when the user hasn't started, reading it top-down
  useEffect(() => {
    let cancelled = false;
    const beats: { sel: string; cap: string; wait: number }[] = [
      { sel: "#doc-title", cap: "reading the title", wait: 1800 },
      { sel: "#doc-context", cap: "catching up on context", wait: 2400 },
      { sel: "#doc-prompt", cap: "waiting on you", wait: 1600 },
      { sel: "#facetime", cap: "glancing at you", wait: 1400 },
    ];
    let i = 0;
    const tick = () => {
      if (cancelled || userText.length > 3) return;
      const b = beats[i % beats.length];
      i++;
      setGaze({ selector: b.sel });
      setCaption(b.cap);
      setAvaFocus(b.sel === "#facetime" ? "facetime" : "doc");
      const t = window.setTimeout(tick, b.wait);
      return () => clearTimeout(t);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [userText.length > 3, setGaze, setCaption, setAvaFocus]); // eslint-disable-line

  // Once user begins typing: Ava tracks the textarea and reacts at beats
  useEffect(() => {
    if (userText.length <= 3) return;
    setGaze({ selector: "#doc-user-area", ox: 0.4, oy: 0.4 });
    setAvaFocus("doc");
    setCaption("reading what you wrote");
  }, [userText, setGaze, setAvaFocus, setCaption]);

  // Reactive beats: drop comments as the user crosses word thresholds
  useEffect(() => {
    const step = async (beat: number, text: string, captionDuring: string) => {
      if (avaBeat.current >= beat) return;
      avaBeat.current = beat;
      setCaption(captionDuring);
      setAvaTyping(true);
      await wait(1500 + Math.random() * 800);
      setAvaTyping(false);
      setComments((cs) => [...cs, { id: `c${beat}`, text }]);
      setGaze({ selector: "#doc-comments" });
      setCaption("left a comment");
      await wait(1400);
      if (userText.length > 3) setGaze({ selector: "#doc-user-area" });
    };

    if (words >= 6 && avaBeat.current < 1) {
      step(1, "nice opening — could you name the sample size in this sentence?", "thinking");
    }
    if (words >= 18 && avaBeat.current < 2) {
      step(2, "ok one more — maybe mention the main finding instead of just the method?", "drafting a thought");
    }
  }, [words, setAvaTyping, setCaption, setGaze, userText.length]);

  // When user resolves a comment, Ava reacts
  useEffect(() => {
    if (resolved === 0) return;
    const acceptedLast = comments[resolved - 1]?.resolved === "accepted";
    setGaze({ selector: "#doc-comments" });
    setCaption(acceptedLast ? "👍 nice" : "ok, fair");
    const t = window.setTimeout(() => {
      if (userText.length > 3)
        setGaze({ selector: "#doc-user-area" });
    }, 1400);
    return () => clearTimeout(t);
  }, [resolved]); // eslint-disable-line

  return (
    <div className="flex gap-6 w-full h-full">
      <Window
        id="doc-window"
        title="Research Memo — Q2"
        subtitle="Shared with Ava · autosaving"
        className="flex-1 min-w-0"
        toolbar={
          <>
            <span className="glass-pill px-2.5 py-1 text-[11px] text-white/80 flex items-center gap-1.5">
              <Users className="w-3 h-3" /> 2
            </span>
            <span className="glass-pill px-2.5 py-1 text-[11px] text-white/80 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> {words} words
            </span>
          </>
        }
      >
        <div className="h-full overflow-auto thin-scroll px-10 py-8 leading-relaxed">
          <h1
            id="doc-title"
            className="text-2xl font-semibold tracking-tight text-white mb-4"
          >
            {TITLE}
          </h1>
          <div
            id="doc-context"
            className="text-[15px] text-white/75 mb-8 leading-[1.65]"
          >
            {CONTEXT}
          </div>

          <div
            id="doc-prompt"
            className="glass-panel p-4 mb-4 flex gap-3 items-start"
          >
            <div
              className="w-1 self-stretch rounded-full shrink-0"
              style={{ background: remote.color }}
            />
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/55 mb-1">
                Your abstract
              </div>
              <div className="text-[13px] text-white/80">
                Write 2 sentences summarising the pilot and its main finding.
                Ava will read along and chime in.
              </div>
            </div>
          </div>

          <div
            id="doc-user-area"
            className="relative rounded-2xl transition"
            style={{
              boxShadow:
                userText.length > 3
                  ? `inset 0 0 0 1.5px ${remote.color}55`
                  : "inset 0 0 0 1px rgba(255,255,255,0.14)",
            }}
          >
            <textarea
              ref={textareaRef}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Start typing your abstract here…"
              rows={6}
              className="w-full bg-transparent resize-none outline-none text-[16px] leading-[1.7] text-white px-4 py-3"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
              }}
            />
            {/* Word-count hint */}
            <div className="absolute bottom-1.5 right-3 text-[10.5px] text-white/45 pointer-events-none">
              {words < 25 ? `${25 - words} more words` : "✓ length ok"}
            </div>
          </div>

          <div className="text-[11.5px] text-white/45 mt-3">
            Tip: write freely. Ava's comments will appear on the right.
          </div>
        </div>
      </Window>

      <div className="w-[320px] shrink-0 flex flex-col gap-4">
        <Window id="doc-comments" title="Comments" className="flex-1">
          <div className="p-4 flex flex-col gap-3 overflow-auto thin-scroll h-full">
            <CommentsList
              comments={comments}
              color={remote.color}
              name={remote.name}
              onResolve={(id, kind) =>
                setComments((cs) =>
                  cs.map((x) => (x.id === id ? { ...x, resolved: kind } : x)),
                )
              }
            />
            <AvaTypingRow show={avaTyping} color={remote.color} />
          </div>
        </Window>
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function CommentsList({
  comments,
  color,
  name,
  onResolve,
}: {
  comments: Comment[];
  color: string;
  name: string;
  onResolve: (id: string, kind: "accepted" | "dismissed") => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {comments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-[11.5px] text-white/45 px-1"
        >
          Start typing — Ava will chime in when she has thoughts.
        </motion.div>
      )}
      {comments.map((c) => (
        <motion.div
          key={c.id}
          layout
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-panel p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-semibold"
              style={{
                background: `linear-gradient(135deg, ${color}, #ffffff22)`,
                color: "white",
              }}
            >
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <span className="text-[12px] text-white/85 font-medium">
              {name}
            </span>
            <span className="text-[10px] text-white/40 ml-auto">just now</span>
          </div>
          <div className="text-[12.5px] text-white/80 flex gap-1.5">
            <CornerDownRight className="w-3 h-3 mt-0.5 shrink-0 text-white/40" />
            {c.text}
          </div>
          {!c.resolved ? (
            <div className="flex gap-1.5 mt-2.5">
              <button
                onClick={() => onResolve(c.id, "accepted")}
                className="flex-1 text-[11px] py-1 rounded-full font-medium transition"
                style={{
                  background: "rgba(75,216,99,0.18)",
                  color: "#a8f0b8",
                  border: "1px solid rgba(75,216,99,0.5)",
                }}
              >
                Accept
              </button>
              <button
                onClick={() => onResolve(c.id, "dismissed")}
                className="flex-1 text-[11px] py-1 rounded-full text-white/70 border border-white/15 hover:bg-white/10 transition"
              >
                Dismiss
              </button>
            </div>
          ) : (
            <div
              className="text-[10.5px] mt-2"
              style={{
                color:
                  c.resolved === "accepted" ? "#a8f0b8" : "rgba(255,255,255,0.5)",
              }}
            >
              {c.resolved === "accepted" ? "✓ Accepted" : "× Dismissed"}
            </div>
          )}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

function AvaTypingRow({ show, color }: { show: boolean; color: string }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass-panel p-3 flex items-center gap-2"
    >
      <span
        className="w-5 h-5 rounded-full"
        style={{ background: `linear-gradient(135deg, ${color}, #ffffff22)` }}
      />
      <span className="text-[11.5px] text-white/55">Ava is typing</span>
      <div className="flex items-center gap-0.5 ml-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block rounded-full"
            style={{ width: 3, height: 3, background: color }}
            animate={{ y: [0, -2, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
