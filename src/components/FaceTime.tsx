import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Video, PhoneOff, Eye } from "lucide-react";
import { useStore } from "../store";
import { AvaFace } from "./AvaFace";

/**
 * Floating, draggable visionOS-style FaceTime PiP.
 *
 * Presence cues baked into the frame (so no arrows fly across the room):
 *   · A small arrow dot orbits the outer border, positioned on the edge
 *     nearest to whatever Ava is currently looking at. When she looks
 *     at your screen, it centers on top of the window.
 *   · The frame glows in Ava's accent when she's looking at you.
 *   · A caption line under her name describes what she's doing.
 */
export function FaceTime({ onEnd }: { onEnd?: () => void }) {
  const remote = useStore((s) => s.remote);
  const avaFocus = useStore((s) => s.avaFocus);
  const caption = useStore((s) => s.caption);
  const avaSaying = useStore((s) => s.avaSaying);
  const avaTyping = useStore((s) => s.avaTyping);
  const phase = useStore((s) => s.phase);

  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });
  const [arrow, setArrow] = useState<{
    angle: number;
    atCenter: boolean;
    hasTarget: boolean;
  }>({ angle: 0, atCenter: false, hasTarget: false });

  useLayoutEffect(() => {
    const measure = () => {
      if (ref.current) setRect(ref.current.getBoundingClientRect());
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    const id = window.setInterval(measure, 250);
    return () => {
      window.removeEventListener("resize", measure);
      window.clearInterval(id);
    };
  }, []);

  // Resolve gaze target → direction vector from FaceTime center.
  const gaze = useStore((s) => s.gaze);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (!rect) {
        raf = requestAnimationFrame(tick);
        return;
      }

      let target: { x: number; y: number } | null = null;
      if (avaFocus === "facetime") {
        setArrow({ angle: 0, atCenter: true, hasTarget: true });
        raf = requestAnimationFrame(tick);
        return;
      }
      if (avaFocus === null) {
        setArrow((a) => ({ ...a, hasTarget: false }));
        raf = requestAnimationFrame(tick);
        return;
      }
      if (gaze.x !== undefined && gaze.y !== undefined) {
        target = { x: gaze.x, y: gaze.y };
      } else if (gaze.selector) {
        const el = document.querySelector(gaze.selector) as HTMLElement | null;
        if (el) {
          const r = el.getBoundingClientRect();
          target = {
            x: r.left + r.width * (gaze.ox ?? 0.5),
            y: r.top + r.height * (gaze.oy ?? 0.5),
          };
        }
      }
      if (target) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle = Math.atan2(target.y - cy, target.x - cx);
        setArrow({ angle, atCenter: false, hasTarget: true });
      } else {
        setArrow((a) => ({ ...a, hasTarget: false }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gaze, rect, avaFocus]);

  const idle = avaFocus === null;
  const lookingAtYou = avaFocus === "facetime";

  // Default position: top-right
  const w = 280;
  const h = 360;
  const initialX = viewport.w - w - 32;
  const initialY = 80;

  return (
    <motion.div
      id="facetime"
      ref={ref}
      drag
      dragMomentum={false}
      dragConstraints={{
        left: 16,
        top: 16,
        right: viewport.w - w - 16,
        bottom: viewport.h - h - 16,
      }}
      initial={{ opacity: 0, scale: 0.9, x: initialX, y: initialY }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: lookingAtYou
          ? `0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 2px ${remote.color}cc, 0 0 40px ${remote.color}88`
          : `0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.18)`,
      }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className="glass-window fixed z-50 overflow-visible select-none"
      style={{ width: w, height: h, borderRadius: 28 }}
    >
      {/* Title bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 z-10">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulseSoft"
            style={{ background: "#4bd863", boxShadow: "0 0 8px #4bd863" }}
          />
          <span className="text-[12px] font-medium text-white/95">
            {remote.name}
          </span>
        </div>
        <CallTimer />
      </div>

      {/* Caption */}
      {(caption || idle) && (
        <div className="absolute top-9 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="glass-pill px-2.5 py-0.5 text-[10.5px] text-white/75 flex items-center gap-1.5">
            <Eye className="w-2.5 h-2.5" />
            {lookingAtYou
              ? "looking at you"
              : idle
                ? "looking away · idle"
                : caption}
          </div>
        </div>
      )}

      {/* Typing indicator (Ava composing something) */}
      {avaTyping && !avaSaying && (
        <div className="absolute bottom-14 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <TypingDots color={remote.color} />
        </div>
      )}

      {/* Face area */}
      <div className="absolute inset-0 rounded-[28px] overflow-hidden">
        <AvaFace rect={rect} idle={idle} />
      </div>

      {/* Border gaze indicator — orbits the frame toward Ava's target */}
      {arrow.hasTarget && (
        <BorderGazeIndicator
          angle={arrow.angle}
          atCenter={arrow.atCenter}
          color={remote.color}
          w={w}
          h={h}
        />
      )}

      {/* Speech bubble */}
      {avaSaying && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute -bottom-3 left-4 right-4 translate-y-full glass-panel px-3.5 py-2.5 text-[13px] text-white/95 z-20"
          style={{ borderRadius: 16 }}
        >
          <div
            className="absolute -top-1.5 left-6 w-3 h-3 rotate-45"
            style={{
              background: "rgba(255,255,255,0.08)",
              borderLeft: "1px solid rgba(255,255,255,0.14)",
              borderTop: "1px solid rgba(255,255,255,0.14)",
            }}
          />
          <TypedText text={avaSaying} />
        </motion.div>
      )}

      {/* Controls */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 z-10">
        <IconButton>
          <Mic className="w-4 h-4" />
        </IconButton>
        <IconButton>
          <Video className="w-4 h-4" />
        </IconButton>
        {phase !== "pre-call" && phase !== "incoming" && (
          <IconButton danger onClick={onEnd}>
            <PhoneOff className="w-4 h-4" />
          </IconButton>
        )}
      </div>
    </motion.div>
  );
}

function BorderGazeIndicator({
  angle,
  atCenter,
  color,
  w,
  h,
}: {
  angle: number;
  atCenter: boolean;
  color: string;
  w: number;
  h: number;
}) {
  // Project angle onto the rounded rectangle border
  const cx = w / 2;
  const cy = h / 2;
  const padding = 14;
  const rw = w / 2 - padding;
  const rh = h / 2 - padding;
  let px: number;
  let py: number;
  if (atCenter) {
    // Centered indicator on top edge, right of avatar
    px = cx;
    py = padding - 4;
  } else {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const t = Math.min(rw / Math.abs(cos || 1e-6), rh / Math.abs(sin || 1e-6));
    px = cx + cos * t;
    py = cy + sin * t;
  }

  return (
    <motion.div
      initial={false}
      animate={{ left: px, top: py }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className="absolute pointer-events-none"
      style={{
        transform: "translate(-50%, -50%)",
        zIndex: 20,
      }}
    >
      <motion.div
        animate={{
          rotate: atCenter ? 0 : (angle * 180) / Math.PI + 90,
        }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="flex flex-col items-center"
      >
        {atCenter ? (
          <div
            className="rounded-full animate-pulseSoft"
            style={{
              width: 10,
              height: 10,
              background: color,
              boxShadow: `0 0 14px ${color}, 0 0 4px ${color}`,
              border: "1.5px solid rgba(255,255,255,0.85)",
            }}
          />
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path
              d="M7 1 L12 12 L7 9.5 L2 12 Z"
              fill={color}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </svg>
        )}
      </motion.div>
    </motion.div>
  );
}

function IconButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full grid place-items-center transition"
      style={{
        background: danger ? "#ff3b30" : "rgba(255,255,255,0.14)",
        color: "white",
        boxShadow: danger
          ? "0 4px 14px rgba(255,59,48,0.55)"
          : "inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      {children}
    </button>
  );
}

function CallTimer() {
  const phase = useStore((s) => s.phase);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (phase === "pre-call" || phase === "incoming") return;
    const id = window.setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);
  const mm = String(Math.floor(t / 60)).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  return (
    <span className="text-[11px] tabular-nums text-white/65">
      {mm}:{ss}
    </span>
  );
}

function TypingDots({ color }: { color: string }) {
  return (
    <div
      className="glass-pill px-2.5 py-1.5 flex items-center gap-1"
      style={{
        border: `1px solid ${color}55`,
      }}
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

function TypedText({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text]);
  return <span>{shown}</span>;
}
