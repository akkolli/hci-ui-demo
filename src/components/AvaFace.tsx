import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store";

/**
 * Ava's "FaceTime feed" — a Siri-orb-style animated avatar with two
 * pupil-like dots that track the direction of her current gaze target
 * relative to the FaceTime window. When she's looking at your screen
 * (avaFocus === "facetime"), her eyes center on you.
 */
export function AvaFace({
  rect,
  idle,
}: {
  rect: DOMRect | null;
  idle: boolean;
}) {
  const remote = useStore((s) => s.remote);
  const gaze = useStore((s) => s.gaze);
  const avaFocus = useStore((s) => s.avaFocus);

  const [eyes, setEyes] = useState({ dx: 0, dy: 0 });
  const [blink, setBlink] = useState(false);

  // Resolve gaze to viewport coords
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (!rect) {
        raf = requestAnimationFrame(tick);
        return;
      }

      let target: { x: number; y: number } | null = null;
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

      if (!target || avaFocus === "facetime") {
        setEyes({ dx: 0, dy: 0 });
      } else {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = target.x - cx;
        const dy = target.y - cy;
        const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const max = 4;
        setEyes({ dx: (dx / len) * max, dy: (dy / len) * max });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gaze, rect, avaFocus]);

  // Occasional blink
  useEffect(() => {
    let timeout: number;
    const schedule = () => {
      timeout = window.setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        schedule();
      }, 2800 + Math.random() * 2600);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  const warm = avaFocus === "facetime";

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Ambient gradient background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 120% at 50% 55%, ${remote.color}55 0%, #1a1530 45%, #0b0714 100%)`,
        }}
        animate={{
          scale: idle ? [1, 1.02, 1] : [1, 1.015, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Siri-orb blob */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: 180,
          height: 180,
          x: "-50%",
          y: "-50%",
          background: `conic-gradient(from 0deg, ${remote.color}, #c8a6ff, #ffa6d6, ${remote.color})`,
          filter: "blur(20px)",
          opacity: 0.7,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: 120,
          height: 120,
          x: "-50%",
          y: "-50%",
          background: `radial-gradient(circle at 35% 30%, #ffffff66, ${remote.color}33 50%, transparent 72%)`,
          boxShadow: `0 0 60px ${remote.color}66`,
        }}
        animate={{
          scale: idle ? [1, 1.05, 1] : [1, 1.03, 1],
        }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Eyes */}
      <div
        className="absolute left-1/2 top-1/2 flex gap-4"
        style={{ transform: "translate(-50%, -50%) translateY(-6px)" }}
      >
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            animate={{
              x: eyes.dx,
              y: eyes.dy,
              scaleY: blink ? 0.15 : 1,
            }}
            transition={{
              x: { type: "spring", stiffness: 120, damping: 16 },
              y: { type: "spring", stiffness: 120, damping: 16 },
              scaleY: { duration: 0.08 },
            }}
            className="w-3 h-3 rounded-full"
            style={{
              background: "white",
              boxShadow: `0 0 10px ${remote.color}, 0 0 3px #fff`,
            }}
          />
        ))}
      </div>

      {/* Initials watermark */}
      <div
        className="absolute bottom-3 left-3 text-[10px] font-medium tracking-wide text-white/65"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
      >
        {remote.name}
      </div>

      {/* "Looking at you" halo */}
      {warm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 2px ${remote.color}cc, inset 0 0 40px ${remote.color}55`,
          }}
        />
      )}
    </div>
  );
}
