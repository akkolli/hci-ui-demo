import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Box,
  StickyNote as StickyIcon,
  Compass,
  Mail,
  Music,
  Image as ImageIcon,
  MessageCircle,
  NotebookPen,
  Cloud,
  Clock,
  PenTool,
  Users,
  Mountain,
  LayoutGrid,
} from "lucide-react";
import { APPS, useStore, type AppId, type TaskId } from "../store";
import {
  SafariWidget,
  MusicWidget,
  MessagesWidget,
  PhotosWidget,
  CalendarWidget,
  VideoWidget,
  FreeformWidget,
  WeatherWidget,
} from "../widgets/BackgroundWidgets";

const ICONS: Record<AppId, React.ComponentType<{ className?: string }>> = {
  doc: FileText,
  model: Box,
  board: StickyIcon,
  safari: Compass,
  mail: Mail,
  music: Music,
  photos: ImageIcon,
  messages: MessageCircle,
  notes: NotebookPen,
  weather: Cloud,
  clock: Clock,
  freeform: PenTool,
};

/** Ordered for a pleasing 6x2 grid. Tasks occupy the top row, left to right. */
const GRID_ORDER: AppId[] = [
  "doc",
  "model",
  "board",
  "freeform",
  "notes",
  "messages",
  "safari",
  "mail",
  "music",
  "photos",
  "weather",
  "clock",
];

type Step = { focus: AppId | "facetime" | null; caption: string; wait: number };
const HOME_SCRIPT: Step[] = [
  { focus: null, caption: "idle", wait: 1400 },
  { focus: "doc", caption: "eyeing the memo", wait: 1500 },
  { focus: "facetime", caption: "looking at you", wait: 1400 },
  { focus: "model", caption: "curious about the model", wait: 1500 },
  { focus: "music", caption: "humming", wait: 1200 },
  { focus: null, caption: "thinking", wait: 1000 },
  { focus: "board", caption: "scanning the board", wait: 1500 },
  { focus: "messages", caption: "checking her phone", wait: 1200 },
  { focus: "facetime", caption: "back to you", wait: 1400 },
];

export function Home({ onLaunch }: { onLaunch: (t: TaskId) => void }) {
  const setGaze = useStore((s) => s.setGaze);
  const setAvaFocus = useStore((s) => s.setAvaFocus);
  const setCaption = useStore((s) => s.setCaption);
  const avaFocus = useStore((s) => s.avaFocus);
  const remote = useStore((s) => s.remote);
  const scripted = useStore((s) => s.scripted);
  const phase = useStore((s) => s.phase);
  const i = useRef(0);

  // Mouse parallax (subtle)
  const [tilt, setTilt] = useState({ mx: 0, my: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setTilt({
        mx: (e.clientX / window.innerWidth) * 2 - 1,
        my: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    if (phase !== "home" || !scripted) return;
    let cancelled = false;
    let timer: number | null = null;
    const run = () => {
      if (cancelled) return;
      const step = HOME_SCRIPT[i.current % HOME_SCRIPT.length];
      i.current += 1;
      setAvaFocus(step.focus);
      setCaption(step.caption);
      if (step.focus === null) setGaze({});
      else if (step.focus === "facetime") setGaze({ selector: "#facetime" });
      else setGaze({ selector: `#app-${step.focus}` });
      timer = window.setTimeout(run, step.wait);
    };
    run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [phase, scripted, setAvaFocus, setCaption, setGaze]);

  const greeting = useGreeting();

  return (
    <div className="absolute inset-0">
      {/* AFK floating windows scattered around the living room */}
      <AfkWindow
        x={22}
        y={18}
        z={-260}
        w={220}
        h={150}
        title="Music"
        parallax={tilt}
      >
        <MusicWidget />
      </AfkWindow>
      <AfkWindow
        x={23}
        y={82}
        z={-280}
        w={210}
        h={150}
        title="Safari"
        parallax={tilt}
      >
        <SafariWidget />
      </AfkWindow>
      <AfkWindow
        x={48}
        y={14}
        z={-310}
        w={220}
        h={135}
        title="Video"
        parallax={tilt}
      >
        <VideoWidget />
      </AfkWindow>
      <AfkWindow
        x={74}
        y={14}
        z={-280}
        w={200}
        h={140}
        title="Calendar"
        parallax={tilt}
      >
        <CalendarWidget />
      </AfkWindow>
      <AfkWindow
        x={52}
        y={86}
        z={-260}
        w={220}
        h={140}
        title="Freeform"
        parallax={tilt}
      >
        <FreeformWidget />
      </AfkWindow>
      <AfkWindow
        x={78}
        y={86}
        z={-290}
        w={210}
        h={140}
        title="Messages"
        parallax={tilt}
      >
        <MessagesWidget />
      </AfkWindow>
      <AfkWindow
        x={93}
        y={42}
        z={-310}
        w={180}
        h={110}
        title="Weather"
        parallax={tilt}
      >
        <WeatherWidget />
      </AfkWindow>
      <AfkWindow
        x={7}
        y={50}
        z={-300}
        w={170}
        h={130}
        title="Photos"
        parallax={tilt}
      >
        <PhotosWidget />
      </AfkWindow>

      {/* Greeting */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
        <div
          className="text-[42px] font-thin text-white tracking-tight leading-none"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.35)" }}
        >
          {greeting}
        </div>
        <div
          className="text-[13px] text-white/75 mt-2"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
        >
          Pick an app to open with Ava
        </div>
      </div>

      {/* Centered Home View panel */}
      <div
        className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ perspective: "1600px" }}
      >
        <motion.div
          className="glass-window px-10 py-8"
          style={{
            width: 680,
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateX: -tilt.my * 1.2,
            rotateY: tilt.mx * 1.8,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
        >
          <div className="grid grid-cols-6 gap-x-6 gap-y-5">
            {GRID_ORDER.map((id) => {
              const app = APPS.find((a) => a.id === id)!;
              return (
                <AppIcon
                  key={id}
                  id={id}
                  name={app.name}
                  gradient={app.gradient}
                  tint={app.tint}
                  Icon={ICONS[id]}
                  highlighted={avaFocus === id}
                  accent={remote.color}
                  isTask={!!app.task}
                  onClick={() => app.task && onLaunch(app.task)}
                />
              );
            })}
          </div>

          {/* Segmented control */}
          <div className="flex justify-center mt-7">
            <SegmentedControl />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AppIcon({
  id,
  name,
  gradient,
  tint,
  Icon,
  highlighted,
  accent,
  isTask,
  onClick,
}: {
  id: AppId;
  name: string;
  gradient: [string, string];
  tint: string;
  Icon: React.ComponentType<{ className?: string }>;
  highlighted: boolean;
  accent: string;
  isTask: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      id={`app-${id}`}
      type="button"
      onClick={onClick}
      disabled={!isTask}
      className="group flex flex-col items-center gap-2"
      style={{ cursor: isTask ? "pointer" : "default" }}
      whileHover={isTask ? { y: -3, scale: 1.05 } : undefined}
      whileTap={isTask ? { scale: 0.95 } : undefined}
    >
      <motion.div
        className="relative rounded-full"
        style={{
          width: 72,
          height: 72,
          background: `linear-gradient(150deg, ${gradient[0]}, ${gradient[1]})`,
        }}
        animate={{
          boxShadow: highlighted
            ? `inset 0 1.5px 0 rgba(255,255,255,0.55), 0 16px 40px -8px ${tint}aa, 0 0 0 2px ${accent}dd, 0 0 30px ${accent}88`
            : `inset 0 1.5px 0 rgba(255,255,255,0.55), 0 12px 28px -8px ${tint}88, 0 2px 6px rgba(0,0,0,0.35)`,
        }}
        transition={{ duration: 0.25 }}
      >
        <Icon className="w-8 h-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" />
        {/* Subtle inner highlight ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.35) 0%, transparent 45%)",
          }}
        />

        {/* Ava gaze chip */}
        {highlighted && (
          <motion.div
            layoutId="ava-gaze-tag"
            className="absolute -top-1.5 -right-1.5 glass-pill px-1.5 py-0.5 text-[9px] font-medium flex items-center gap-1"
            style={{
              color: "white",
              border: `1px solid ${accent}`,
              background: `${accent}44`,
            }}
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{ background: accent }}
            />
            Ava
          </motion.div>
        )}
      </motion.div>
      <div
        className="text-[11px] text-white/95 font-medium"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
      >
        {name}
      </div>
    </motion.button>
  );
}

function SegmentedControl() {
  const items = [
    { id: "apps", label: "Apps", icon: LayoutGrid, active: true },
    { id: "people", label: "People", icon: Users, active: false },
    { id: "envs", label: "Environments", icon: Mountain, active: false },
  ];
  return (
    <div
      className="flex items-center p-1 rounded-full"
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
      }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            className="px-4 py-1.5 rounded-full flex items-center gap-1.5 text-[12px] font-medium transition"
            style={{
              background: it.active
                ? "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.14))"
                : "transparent",
              color: it.active ? "white" : "rgba(255,255,255,0.6)",
              boxShadow: it.active
                ? "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 10px rgba(0,0,0,0.2)"
                : "none",
              cursor: "default",
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------ AFK background windows --------------------- */

function AfkWindow({
  x,
  y,
  z,
  w,
  h,
  title,
  parallax,
  children,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  title: string;
  parallax: { mx: number; my: number };
  children: React.ReactNode;
}) {
  const depth = Math.min(1, Math.abs(z) / 300);
  const px = -parallax.mx * Math.abs(z) * 0.06;
  const py = -parallax.my * Math.abs(z) * 0.04;
  return (
    <motion.div
      className="absolute glass-window overflow-hidden"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: w,
        height: h,
        transform: `translate(-50%, -50%) translate3d(${px}px, ${py}px, 0)`,
        filter: `blur(${1 + depth * 2}px) brightness(${1 - depth * 0.35})`,
        borderRadius: 22,
        opacity: 0.85,
      }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b hairline">
        <div className="text-[10.5px] text-white/75 font-medium">{title}</div>
        <div className="text-[9px] text-white/40">idle</div>
      </div>
      <div className="h-[calc(100%-28px)]">{children}</div>
    </motion.div>
  );
}

function useGreeting() {
  const [g] = useState(() => {
    const h = new Date().getHours();
    if (h < 5) return "Good night";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  });
  return g;
}
