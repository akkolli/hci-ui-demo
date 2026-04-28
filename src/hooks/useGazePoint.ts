import { useEffect, useState } from "react";
import { useStore } from "../store";

export type Point = { x: number; y: number; onscreen: boolean };

/**
 * Resolve the current gaze target to a viewport coordinate,
 * recomputing on window resize / scroll / layout ticks.
 */
export function useGazePoint(): Point | null {
  const gaze = useStore((s) => s.gaze);
  const [point, setPoint] = useState<Point | null>(null);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      if (gaze.x !== undefined && gaze.y !== undefined) {
        setPoint({ x: gaze.x, y: gaze.y, onscreen: true });
      } else if (gaze.selector) {
        const el = document.querySelector(gaze.selector) as HTMLElement | null;
        if (el) {
          const r = el.getBoundingClientRect();
          const ox = gaze.ox ?? 0.5;
          const oy = gaze.oy ?? 0.5;
          const x = r.left + r.width * ox;
          const y = r.top + r.height * oy;
          const onscreen =
            x >= 0 && y >= 0 && x <= window.innerWidth && y <= window.innerHeight;
          setPoint({ x, y, onscreen });
        } else {
          setPoint(null);
        }
      } else {
        setPoint(null);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gaze]);

  return point;
}
