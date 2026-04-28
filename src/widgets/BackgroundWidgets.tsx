import { motion } from "framer-motion";
import {
  Music2,
  Play,
  Mail,
  MessageCircle,
  Cloud,
  Sun,
  CalendarDays,
  Video,
  Pencil,
} from "lucide-react";

/* ----------------------------- Safari --------------------------------- */

export function SafariWidget() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b hairline">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
        </div>
        <div className="flex-1 glass-pill px-2 py-0.5 text-[10px] text-white/70 truncate">
          apple.com/vision-pro
        </div>
      </div>
      <div className="flex-1 p-3 text-[11px] text-white/75 leading-snug overflow-hidden">
        <div className="text-[13px] font-semibold text-white mb-1 tracking-tight">
          Spatial computing.
        </div>
        <p className="mb-2">
          A revolutionary new way to interact with apps, photos, and the people
          around you.
        </p>
        <div className="grid grid-cols-3 gap-1.5 mt-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-video rounded-md"
              style={{
                background: `linear-gradient(135deg, rgba(120,180,255,0.3), rgba(200,140,255,0.3))`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Music ---------------------------------- */

export function MusicWidget() {
  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <div className="flex items-center gap-2">
        <motion.div
          className="w-12 h-12 rounded-md shrink-0 grid place-items-center"
          style={{
            background:
              "conic-gradient(from 0deg, #ff2d55, #ff9d6c, #ffcc5c, #ff2d55)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        >
          <Music2 className="w-4 h-4 text-white/90" />
        </motion.div>
        <div className="min-w-0">
          <div className="text-[12px] text-white font-medium truncate">
            Midnight Garden
          </div>
          <div className="text-[10px] text-white/55 truncate">Kiri Yoshida</div>
        </div>
        <button className="ml-auto w-7 h-7 rounded-full bg-white text-black grid place-items-center shrink-0">
          <Play className="w-3 h-3 fill-black" />
        </button>
      </div>
      <div className="flex items-end gap-[3px] h-10 px-0.5">
        {Array.from({ length: 22 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm"
            style={{ background: "rgba(255,255,255,0.55)" }}
            animate={{
              height: [
                `${20 + ((i * 37) % 60)}%`,
                `${40 + ((i * 53) % 50)}%`,
                `${20 + ((i * 37) % 60)}%`,
              ],
            }}
            transition={{
              duration: 1.4 + (i % 5) * 0.18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[9.5px] text-white/55">
        <span>1:24</span>
        <span>–3:06</span>
      </div>
    </div>
  );
}

/* ----------------------------- Messages ------------------------------- */

export function MessagesWidget() {
  const messages = [
    { from: "Marco", text: "Did you see the proto?", mine: false },
    { from: "You", text: "Reviewing now 👀", mine: true },
    { from: "Marco", text: "Ava's got feedback for you", mine: false },
  ];
  return (
    <div className="flex flex-col h-full p-3 gap-1.5">
      <div className="flex items-center gap-1.5 text-[11px] text-white/75 mb-1">
        <MessageCircle className="w-3 h-3" /> Marco
      </div>
      {messages.map((m, i) => (
        <div
          key={i}
          className={`max-w-[85%] rounded-2xl px-2.5 py-1.5 text-[10.5px] leading-snug ${
            m.mine ? "self-end text-white" : "self-start text-white/85"
          }`}
          style={{
            background: m.mine
              ? "linear-gradient(180deg, #2196ff, #0f6bd1)"
              : "rgba(255,255,255,0.14)",
          }}
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- Mail ----------------------------------- */

export function MailWidget() {
  const items = [
    { from: "Design @ Horizon", subj: "Q2 review — agenda", preview: "Just sent the doc..." },
    { from: "TestFlight", subj: "Build 142 available", preview: "New build ready" },
    { from: "Ava Chen", subj: "re: memo edits", preview: "I'll leave some comments." },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b hairline text-[11px] text-white/75">
        <Mail className="w-3 h-3" /> Inbox
      </div>
      <div className="flex-1 overflow-hidden">
        {items.map((it, i) => (
          <div
            key={i}
            className="px-3 py-2 border-b hairline last:border-b-0"
          >
            <div className="text-[10.5px] text-white/55">{it.from}</div>
            <div className="text-[11.5px] text-white/95 font-medium truncate">
              {it.subj}
            </div>
            <div className="text-[10px] text-white/55 truncate">
              {it.preview}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Photos --------------------------------- */

export function PhotosWidget() {
  const tints = [
    ["#ffcfa6", "#ff6b9c"],
    ["#a6dcff", "#6b98ff"],
    ["#cfa6ff", "#6b6bff"],
    ["#a6ffcf", "#6bffa6"],
    ["#ffe6a6", "#ffa66b"],
    ["#a6e6ff", "#b66bff"],
  ];
  return (
    <div className="grid grid-cols-3 gap-[3px] p-[3px] h-full">
      {tints.map((t, i) => (
        <div
          key={i}
          className="rounded-md"
          style={{ background: `linear-gradient(135deg, ${t[0]}, ${t[1]})` }}
        />
      ))}
    </div>
  );
}

/* ----------------------------- Weather -------------------------------- */

export function WeatherWidget() {
  return (
    <div className="h-full p-3 flex flex-col justify-between">
      <div>
        <div className="text-[11px] text-white/70">Cupertino</div>
        <div className="text-[30px] font-thin text-white leading-none">72°</div>
      </div>
      <div className="flex items-center gap-2 text-white/80">
        <Sun className="w-4 h-4" />
        <span className="text-[11px]">Sunny · H:74 L:58</span>
      </div>
      <Cloud className="absolute opacity-0" />
    </div>
  );
}

/* ----------------------------- Calendar ------------------------------- */

export function CalendarWidget() {
  const today = new Date();
  const month = today.toLocaleString("en-US", { month: "long" });
  const dates = Array.from({ length: 28 }, (_, i) => i + 1);
  const todayDate = today.getDate();
  return (
    <div className="flex flex-col h-full p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-white/80 mb-1.5">
        <CalendarDays className="w-3 h-3" />
        <span className="font-medium">{month}</span>
      </div>
      <div className="grid grid-cols-7 gap-[2px] text-[9px] leading-none">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-white/45 py-0.5">
            {d}
          </div>
        ))}
        {dates.slice(0, 28).map((d) => (
          <div
            key={d}
            className="aspect-square grid place-items-center rounded-sm"
            style={{
              color: d === todayDate ? "white" : "rgba(255,255,255,0.78)",
              background: d === todayDate ? "#ff3b30" : "transparent",
              fontWeight: d === todayDate ? 600 : 400,
            }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Video (paused) ------------------------- */

export function VideoWidget() {
  return (
    <div className="relative h-full">
      {/* Scene: sunset over water */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, #1b1f5a 0%, #5a3570 40%, #c06a4a 70%, #ff9f5a 100%)
          `,
        }}
      />
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: 0,
          height: "35%",
          background:
            "linear-gradient(180deg, rgba(255,150,80,0.2), rgba(30,15,50,0.9))",
        }}
      />
      <div
        className="absolute"
        style={{
          left: "48%",
          bottom: "35%",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "rgba(255,230,180,0.95)",
          boxShadow: "0 0 20px rgba(255,200,140,0.8)",
        }}
      />
      {/* Play button */}
      <div className="absolute inset-0 grid place-items-center">
        <div
          className="w-10 h-10 rounded-full bg-white/90 grid place-items-center"
          style={{ boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }}
        >
          <Play className="w-4 h-4 text-black fill-black ml-0.5" />
        </div>
      </div>
      {/* Badge */}
      <div className="absolute top-2 left-2 glass-pill px-2 py-0.5 text-[9px] text-white flex items-center gap-1">
        <Video className="w-2.5 h-2.5" />
        Paused
      </div>
      {/* Timeline */}
      <div className="absolute left-3 right-3 bottom-2 h-[3px] rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: "38%" }}
        />
      </div>
    </div>
  );
}

/* ----------------------------- Freeform sketch ------------------------ */

export function FreeformWidget() {
  return (
    <div className="relative h-full bg-[#fcfaf1]">
      <div className="absolute top-2 left-2 text-[9.5px] text-black/50 flex items-center gap-1">
        <Pencil className="w-2.5 h-2.5" />
        sketch · 2m
      </div>
      <svg
        viewBox="0 0 200 140"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Hand-drawn card */}
        <rect
          x="30"
          y="30"
          width="60"
          height="40"
          stroke="#2a2a2a"
          strokeWidth="1.5"
          fill="none"
          rx="3"
          style={{ strokeDasharray: "none" }}
        />
        <line
          x1="40"
          y1="42"
          x2="80"
          y2="42"
          stroke="#2a2a2a"
          strokeWidth="1"
        />
        <line
          x1="40"
          y1="50"
          x2="72"
          y2="50"
          stroke="#2a2a2a"
          strokeWidth="1"
        />
        {/* Arrow */}
        <path
          d="M 95 50 Q 115 20 140 50"
          stroke="#e0585a"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 134 46 L 140 50 L 135 56"
          stroke="#e0585a"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Second card */}
        <rect
          x="140"
          y="30"
          width="48"
          height="40"
          stroke="#2a2a2a"
          strokeWidth="1.5"
          fill="none"
          rx="3"
        />
        <circle cx="164" cy="50" r="8" fill="#ffd98a" stroke="#2a2a2a" strokeWidth="1" />
        {/* Label */}
        <text
          x="40"
          y="105"
          fill="#2a2a2a"
          fontSize="7"
          fontFamily="'Bradley Hand', cursive"
        >
          handoff flow v2
        </text>
      </svg>
    </div>
  );
}

/* ----------------------------- Clock ---------------------------------- */

export function ClockWidget() {
  const d = new Date();
  const hours = d.getHours() % 12;
  const mins = d.getMinutes();
  const secAngle = (d.getSeconds() / 60) * 360;
  const minAngle = (mins / 60) * 360;
  const hourAngle = ((hours + mins / 60) / 12) * 360;
  return (
    <div className="h-full grid place-items-center p-2">
      <div
        className="relative rounded-full"
        style={{
          width: 90,
          height: 90,
          background:
            "radial-gradient(circle at 40% 35%, #ffffff22, #ffffff08 60%, transparent), rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              width: 2,
              height: 6,
              background: "rgba(255,255,255,0.55)",
              transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-38px)`,
            }}
          />
        ))}
        {/* Hour */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{
            width: 2.5,
            height: 26,
            background: "white",
            transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
            transformOrigin: "50% 100%",
            borderRadius: 2,
          }}
        />
        {/* Minute */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{
            width: 2,
            height: 34,
            background: "white",
            transform: `translate(-50%, -100%) rotate(${minAngle}deg)`,
            transformOrigin: "50% 100%",
            borderRadius: 2,
          }}
        />
        {/* Second */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{
            width: 1,
            height: 38,
            background: "#ff3b30",
            transform: `translate(-50%, -100%) rotate(${secAngle}deg)`,
            transformOrigin: "50% 100%",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-white"
          style={{ transform: "translate(-50%, -50%)" }}
        />
      </div>
    </div>
  );
}
