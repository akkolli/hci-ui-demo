import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Vision Pro-style "cozy living room at golden hour" environment.
 *
 * Built from layered CSS gradients and SVG silhouettes. The composition
 * is impressionistic — soft, warm, slightly out-of-focus — so the
 * floating UI reads as the foreground. Layers (back → front):
 *
 *   1. Evening sky behind a tall window (cool blue → warm horizon)
 *   2. Warm cream wall
 *   3. Wooden floor (bottom band)
 *   4. Wall art — framed picture
 *   5. Distant bookshelf silhouette
 *   6. Couch silhouette (left of center, slightly blurred)
 *   7. Coffee table (center, low)
 *   8. Floor lamp with visible warm glow
 *   9. Tall potted plant (right corner)
 *  10. Cool window light spill
 *  11. Atmospheric dust motes (slow drift)
 *  12. Soft vignette + film grain
 */
export function Environment() {
  const motes = useMemo(
    () =>
      Array.from({ length: 36 }, () => ({
        x: Math.random() * 100,
        y: 15 + Math.random() * 70,
        s: 0.8 + Math.random() * 2.2,
        d: 14 + Math.random() * 18,
        dx: -4 + Math.random() * 8,
        dy: -4 + Math.random() * 4,
        delay: Math.random() * 8,
      })),
    [],
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {/* 1 · Evening sky seen through the window */}
      <div
        className="absolute"
        style={{
          left: "4%",
          top: "8%",
          width: "36%",
          height: "66%",
          background: `
            linear-gradient(
              180deg,
              #1a1e4a 0%,
              #2b2f66 18%,
              #4a3578 38%,
              #7a4175 58%,
              #c2683a 78%,
              #f0a464 100%
            )
          `,
          filter: "blur(0.6px)",
          borderRadius: "2px 2px 0 0",
        }}
      >
        {/* Distant mountain silhouette visible outside */}
        <svg
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          className="absolute left-0 right-0 bottom-0 w-full"
          style={{ height: "28%", opacity: 0.75 }}
        >
          <path
            d="M0,200 L0,140 L50,110 L100,150 L160,80 L220,130 L280,95 L340,135 L400,110 L400,200 Z"
            fill="#1a0c1d"
          />
        </svg>
        {/* A single bright planet / star */}
        <motion.circle
          cx="68%"
          cy="20%"
          r="2"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Window frame (mullions) */}
      <WindowFrame />

      {/* 2 · Warm cream wall */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              180deg,
              #e0cfb2 0%,
              #d8c2a0 40%,
              #c9ad87 70%,
              #a5825a 100%
            )
          `,
          clipPath:
            "polygon(0 0, 4% 0, 4% 8%, 40% 8%, 40% 74%, 4% 74%, 4% 100%, 100% 100%, 100% 0)",
        }}
      />

      {/* Warm ambient fill over the whole scene */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 70% at 75% 55%, rgba(255,190,110,0.35), transparent 65%),
            radial-gradient(ellipse 60% 50% at 15% 30%, rgba(110,140,200,0.18), transparent 70%)
          `,
        }}
      />

      {/* 3 · Wooden floor */}
      <div
        className="absolute inset-x-0"
        style={{
          bottom: 0,
          height: "30%",
          background: `
            linear-gradient(
              180deg,
              #8a5d36 0%,
              #7a4e2a 30%,
              #5c3820 75%,
              #3d2614 100%
            )
          `,
        }}
      >
        {/* Plank lines */}
        <svg
          viewBox="0 0 1600 400"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.2 }}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <line
              key={i}
              x1={-200 + i * 300}
              y1={0}
              x2={0 + i * 300}
              y2={400}
              stroke="#1a0f06"
              strokeWidth="2"
            />
          ))}
        </svg>
        {/* Rug */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: "12%",
            width: "58%",
            height: "40%",
            background: `
              radial-gradient(
                ellipse 60% 70% at 50% 50%,
                rgba(180,130,90,0.55) 0%,
                rgba(140,95,60,0.4) 55%,
                transparent 85%
              )
            `,
            filter: "blur(8px)",
          }}
        />
      </div>

      {/* 4 · Wall art (right wall) */}
      <div
        className="absolute"
        style={{
          right: "9%",
          top: "20%",
          width: "14%",
          height: "28%",
        }}
      >
        <div
          className="w-full h-full"
          style={{
            background: `
              linear-gradient(135deg, #5a4a3e 0%, #2d241c 100%)
            `,
            border: "3px solid #1d150c",
            borderRadius: 2,
            boxShadow: "0 8px 20px rgba(0,0,0,0.35), inset 0 0 20px rgba(0,0,0,0.45)",
          }}
        >
          {/* Abstract painting */}
          <div
            className="w-full h-full"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(200,140,80,0.45), transparent 60%),
                radial-gradient(circle at 70% 70%, rgba(220,100,130,0.3), transparent 50%),
                linear-gradient(135deg, #3a2a28, #5e3e2e)
              `,
              filter: "blur(1.2px)",
            }}
          />
        </div>
      </div>

      {/* 5 · Distant bookshelf silhouette (right, behind lamp) */}
      <svg
        className="absolute"
        style={{
          right: "6%",
          bottom: "30%",
          width: "18%",
          height: "45%",
          opacity: 0.35,
          filter: "blur(3px)",
        }}
        viewBox="0 0 100 200"
        preserveAspectRatio="none"
      >
        <rect x="10" y="0" width="80" height="200" fill="#2a1b11" />
        {/* Shelves */}
        {[35, 75, 115, 155].map((y) => (
          <rect key={y} x="10" y={y} width="80" height="3" fill="#1a1008" />
        ))}
        {/* Book spines */}
        {Array.from({ length: 24 }).map((_, i) => {
          const shelf = Math.floor(i / 6);
          const y = [5, 40, 80, 120][shelf];
          const x = 14 + (i % 6) * 12;
          const h = [28, 32, 28, 32][shelf];
          const colors = ["#8a5a3a", "#6c3d2a", "#a26f4a", "#4a2d1c", "#7a4a2e"];
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width="10"
              height={h}
              fill={colors[i % colors.length]}
            />
          );
        })}
      </svg>

      {/* 6 · Couch silhouette */}
      <svg
        className="absolute"
        style={{
          left: "18%",
          bottom: "22%",
          width: "44%",
          height: "32%",
          filter: "blur(1.5px)",
        }}
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        {/* Back */}
        <rect x="20" y="40" width="360" height="90" rx="14" fill="#3a2822" />
        {/* Seat */}
        <rect x="10" y="100" width="380" height="70" rx="14" fill="#4a3328" />
        {/* Arms */}
        <rect x="0" y="60" width="40" height="110" rx="14" fill="#2d1e18" />
        <rect x="360" y="60" width="40" height="110" rx="14" fill="#2d1e18" />
        {/* Cushions */}
        <rect x="30" y="75" width="110" height="60" rx="10" fill="#5a4036" />
        <rect x="150" y="75" width="110" height="60" rx="10" fill="#5a4036" />
        <rect x="270" y="75" width="100" height="60" rx="10" fill="#5a4036" />
        {/* Throw pillow */}
        <rect x="50" y="82" width="60" height="48" rx="8" fill="#c28a5a" opacity="0.75" />
      </svg>

      {/* 7 · Coffee table */}
      <svg
        className="absolute"
        style={{
          left: "30%",
          bottom: "14%",
          width: "22%",
          height: "10%",
          filter: "blur(1px)",
        }}
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
      >
        <ellipse cx="100" cy="25" rx="95" ry="14" fill="#2a1a12" />
        <ellipse cx="100" cy="20" rx="90" ry="12" fill="#3d2618" />
        <rect x="45" y="30" width="6" height="25" fill="#1a1008" />
        <rect x="149" y="30" width="6" height="25" fill="#1a1008" />
      </svg>

      {/* 8 · Floor lamp + warm glow */}
      <div
        className="absolute"
        style={{
          right: "17%",
          bottom: "26%",
          width: "5%",
          height: "50%",
        }}
      >
        {/* Stand */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "18%",
            bottom: 0,
            width: 3,
            background: "#1d1208",
            boxShadow: "0 0 6px rgba(0,0,0,0.5)",
          }}
        />
        {/* Base */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: "-2px",
            width: "60%",
            height: "3%",
            background: "#1d1208",
            borderRadius: "50%",
          }}
        />
        {/* Shade */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: 0,
            width: "100%",
            height: "22%",
            background:
              "linear-gradient(180deg, #4a3a28 0%, #2d1f12 100%)",
            clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0 100%)",
          }}
        />
        {/* Warm lightbulb glow through shade */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "4%",
            width: "70%",
            height: "14%",
            background:
              "radial-gradient(ellipse, rgba(255,205,125,0.95) 0%, rgba(255,170,90,0.7) 50%, transparent 90%)",
            filter: "blur(3px)",
          }}
        />
      </div>
      {/* Big radial warm glow from the lamp filling the room */}
      <div
        className="absolute"
        style={{
          right: "10%",
          bottom: "32%",
          width: "60%",
          aspectRatio: "1/1",
          background:
            "radial-gradient(circle, rgba(255,180,100,0.4) 0%, rgba(255,150,80,0.22) 30%, transparent 65%)",
          transform: "translate(50%, 50%)",
          filter: "blur(24px)",
          mixBlendMode: "screen",
        }}
      />

      {/* 9 · Tall potted plant (right corner) */}
      <svg
        className="absolute"
        style={{
          right: "2%",
          bottom: "20%",
          width: "12%",
          height: "56%",
          filter: "blur(0.8px)",
        }}
        viewBox="0 0 100 260"
        preserveAspectRatio="none"
      >
        {/* Pot */}
        <path
          d="M 32 240 L 28 210 L 72 210 L 68 240 Z"
          fill="#4a2d18"
        />
        {/* Stem */}
        <rect x="49" y="140" width="2" height="75" fill="#2a3a20" />
        {/* Leaves */}
        {[
          [35, 120, -40],
          [62, 115, 35],
          [30, 95, -35],
          [67, 90, 45],
          [45, 70, -10],
          [55, 60, 20],
          [40, 50, -25],
          [60, 40, 30],
          [50, 30, 0],
        ].map(([cx, cy, rot], i) => (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx="6"
            ry="18"
            fill={i % 2 === 0 ? "#2d4a2a" : "#385a35"}
            transform={`rotate(${rot} ${cx} ${cy})`}
            opacity={0.92}
          />
        ))}
      </svg>

      {/* 10 · Cool window-light spill onto the floor */}
      <div
        className="absolute"
        style={{
          left: "6%",
          bottom: "8%",
          width: "40%",
          height: "22%",
          background:
            "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(150,170,220,0.35) 0%, transparent 75%)",
          filter: "blur(18px)",
          mixBlendMode: "screen",
        }}
      />

      {/* 11 · Dust motes drifting */}
      {motes.map((m, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.s,
            height: m.s,
            background: "rgba(255,220,180,0.85)",
            boxShadow: "0 0 4px rgba(255,220,180,0.6)",
          }}
          animate={{
            x: [0, m.dx, 0],
            y: [0, m.dy, 0],
            opacity: [0.2, 0.9, 0.2],
          }}
          transition={{
            duration: m.d,
            repeat: Infinity,
            ease: "easeInOut",
            delay: m.delay,
          }}
        />
      ))}

      {/* 12 · Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(15,8,2,0.55) 100%)",
        }}
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-35"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}

function WindowFrame() {
  return (
    <>
      {/* Outer frame */}
      <div
        className="absolute"
        style={{
          left: "3.2%",
          top: "7.2%",
          width: "37.6%",
          height: "67.6%",
          border: "10px solid #2a1a10",
          borderBottomWidth: "14px",
          boxSizing: "border-box",
          boxShadow:
            "0 18px 40px rgba(0,0,0,0.35), inset 0 0 12px rgba(0,0,0,0.3)",
          pointerEvents: "none",
        }}
      />
      {/* Vertical mullion */}
      <div
        className="absolute"
        style={{
          left: "21.8%",
          top: "8%",
          width: 6,
          height: "66%",
          background: "#2a1a10",
          boxShadow: "0 0 10px rgba(0,0,0,0.4)",
        }}
      />
      {/* Horizontal mullion */}
      <div
        className="absolute"
        style={{
          left: "4%",
          top: "40%",
          width: "36%",
          height: 4,
          background: "#2a1a10",
          boxShadow: "0 0 8px rgba(0,0,0,0.3)",
        }}
      />
      {/* Window sill */}
      <div
        className="absolute"
        style={{
          left: "2.6%",
          top: "73.5%",
          width: "38.8%",
          height: 18,
          background:
            "linear-gradient(180deg, #4a2f1c 0%, #2d1a0e 100%)",
          boxShadow: "0 6px 14px rgba(0,0,0,0.45)",
        }}
      />
    </>
  );
}
