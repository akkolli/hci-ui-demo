import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { useStore } from "../store";
import { useGazePoint } from "../hooks/useGazePoint";

/**
 * A soft, floating, semi-transparent circle that represents the remote
 * user's eye-tracked gaze. Smoothly springs toward the current target
 * with a tiny micro-saccade jitter, mimicking real eye motion.
 */
export function RemoteGaze() {
  const remote = useStore((s) => s.remote);
  const point = useGazePoint();

  const x = useMotionValue(window.innerWidth / 2);
  const y = useMotionValue(window.innerHeight / 2);
  const sx = useSpring(x, { stiffness: 180, damping: 26, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 180, damping: 26, mass: 0.7 });

  // Micro-saccade offset
  const jx = useMotionValue(0);
  const jy = useMotionValue(0);

  useEffect(() => {
    if (point) {
      x.set(point.x);
      y.set(point.y);
    }
  }, [point, x, y]);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    const loop = () => {
      t += 0.016;
      jx.set(Math.sin(t * 2.3) * 3 + Math.cos(t * 5.1) * 1.5);
      jy.set(Math.cos(t * 1.9) * 3 + Math.sin(t * 4.3) * 1.5);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [jx, jy]);

  const tx = useTransform([sx, jx], ([a, b]) => (a as number) + (b as number));
  const ty = useTransform([sy, jy], ([a, b]) => (a as number) + (b as number));

  if (!point) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        x: tx,
        y: ty,
        translateX: "-50%",
        translateY: "-50%",
        pointerEvents: "none",
        zIndex: 70,
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: point.onscreen ? 1 : 0, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Outer halo */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${hexToRgba(
            remote.color,
            0.28,
          )} 0%, ${hexToRgba(remote.color, 0.08)} 55%, transparent 75%)`,
          filter: "blur(2px)",
        }}
      />
      {/* Inner ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: `1.5px solid ${hexToRgba(remote.color, 0.75)}`,
          boxShadow: `0 0 24px ${hexToRgba(remote.color, 0.55)}, inset 0 0 12px ${hexToRgba(
            remote.color,
            0.35,
          )}`,
          background: `radial-gradient(circle, ${hexToRgba(
            remote.color,
            0.18,
          )}, transparent 70%)`,
        }}
      />
      {/* Pinpoint */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: remote.color,
          boxShadow: `0 0 10px ${remote.color}`,
        }}
      />
    </motion.div>
  );
}

function hexToRgba(hex: string, a: number) {
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
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
