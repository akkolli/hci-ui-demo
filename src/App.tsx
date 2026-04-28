import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Wifi, Circle, CheckCircle2, Target } from "lucide-react";
import { useStore, type TaskId } from "./store";
import { Home } from "./scenes/Home";
import { Survey } from "./scenes/Survey";
import { DocEditor } from "./scenarios/DocEditor";
import { ModelViewer } from "./scenarios/ModelViewer";
import { StickyBoard } from "./scenarios/StickyBoard";
import { RemoteGaze } from "./components/RemoteGaze";
import { FaceTime } from "./components/FaceTime";
import { IncomingCall } from "./components/IncomingCall";
import { QuickReplies, type Reply } from "./components/QuickReplies";
import { Environment } from "./components/Environment";

type DialogNode = {
  ava?: string;
  avaCaption?: string;
  replies: Reply[];
  /** Map reply id → next node id */
  next: Record<string, string | "home">;
};

const DIALOG: Record<string, DialogNode> = {
  open: {
    ava: "Hey! Saw you were around. Ready when you are 👋",
    avaCaption: "waiting",
    replies: [
      { id: "hi", label: "Hi Ava 👋" },
      { id: "whatsup", label: "Hey — what should we do?" },
    ],
    next: { hi: "hi", whatsup: "whatsup" },
  },
  hi: {
    ava: "Good to see you. I've got the doc, the airframe, and the board open. Pick whichever and I'll jump in.",
    avaCaption: "chatty",
    replies: [
      { id: "pick", label: "Let me pick one" },
      { id: "recommend", label: "Which do you recommend?" },
    ],
    next: { pick: "home", recommend: "recommend" },
  },
  whatsup: {
    ava: "Not much! Three things open — a memo, the airframe review, and the sticky board. Any of those look good?",
    avaCaption: "options",
    replies: [
      { id: "pick", label: "I'll choose" },
      { id: "recommend", label: "You choose" },
    ],
    next: { pick: "home", recommend: "recommend" },
  },
  recommend: {
    ava: "Honestly the board's fun — quick wins. But the doc probably needs us most. Up to you.",
    avaCaption: "nudging",
    replies: [{ id: "ok", label: "Got it — opening now" }],
    next: { ok: "home" },
  },
};

export default function App() {
  const phase = useStore((s) => s.phase);
  const setPhase = useStore((s) => s.setPhase);
  const task = useStore((s) => s.task);
  const setTask = useStore((s) => s.setTask);
  const setGaze = useStore((s) => s.setGaze);
  const setAvaFocus = useStore((s) => s.setAvaFocus);
  const setCaption = useStore((s) => s.setCaption);
  const setAvaSaying = useStore((s) => s.setAvaSaying);
  const remote = useStore((s) => s.remote);
  const taskReady = useStore((s) => s.taskReady);
  const setTaskReady = useStore((s) => s.setTaskReady);

  const nodeId = useStore((s) => s.dialogNode);
  const setDialogNode = useStore((s) => s.setDialogNode);
  const node = nodeId ? DIALOG[nodeId] : null;

  // Auto-trigger incoming call on mount
  useEffect(() => {
    if (phase !== "pre-call") return;
    const t = window.setTimeout(() => setPhase("incoming"), 1200);
    return () => clearTimeout(t);
  }, [phase, setPhase]);

  // Drive Ava's spoken caption per dialog node
  useEffect(() => {
    if (phase !== "greeting") return;
    if (node) {
      setAvaSaying(node.ava ?? null);
      setCaption(node.avaCaption ?? null);
      // While greeting, Ava is mostly looking at you
      setAvaFocus("facetime");
      setGaze({ selector: "#facetime" });
    }
  }, [phase, node, setAvaSaying, setCaption, setAvaFocus, setGaze]);

  // Clear speech bubble when leaving greeting
  useEffect(() => {
    if (phase !== "greeting") setAvaSaying(null);
  }, [phase, setAvaSaying]);

  const acceptCall = () => {
    setPhase("greeting");
    setDialogNode("open");
  };
  const declineCall = () => {
    setPhase("pre-call");
    setAvaFocus(null);
  };
  const pickReply = (replyId: string) => {
    if (!node || !nodeId) return;
    const next = node.next[replyId];
    if (next === "home") {
      setPhase("home");
      setAvaSaying(null);
      setDialogNode(null);
    } else {
      setDialogNode(next);
    }
  };

  const launchTask = (t: TaskId) => {
    setTaskReady(false);
    setTask(t);
    setPhase("task");
    setAvaFocus(t);
    setCaption("joining you");
  };

  const objective =
    task === "doc"
      ? "Resolve Ava's two suggestions in the comments panel."
      : task === "model"
        ? "Rotate the airframe so Ava can see the back."
        : task === "board"
          ? "Add a note responding to Ava's brainstorm."
          : "";

  const finishTask = () => {
    setPhase("survey");
    setAvaSaying("Nice work — how'd that feel?");
    setAvaFocus("facetime");
    setCaption("curious");
    setGaze({ selector: "#facetime" });
  };

  const finishSurvey = () => {
    setAvaSaying(null);
    setTask(null);
    setPhase("home");
  };

  const endCall = () => {
    setPhase("pre-call");
    setAvaFocus(null);
    setAvaSaying(null);
    setTask(null);
    setDialogNode(null);
  };

  return (
    <div className="h-full w-full relative">
      <Environment />

      {/* Top status bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-pill flex items-center gap-4 px-4 py-1.5 text-[11.5px] text-white/80">
          <div className="flex items-center gap-1.5">
            <Circle
              className="w-2 h-2 fill-emerald-400 text-emerald-400"
              strokeWidth={0}
            />
            <span>Shared Space · Horizon</span>
          </div>
          <div className="w-px h-3 bg-white/15" />
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3" />
            <span>42ms</span>
          </div>
          {phase !== "pre-call" && phase !== "incoming" && (
            <>
              <div className="w-px h-3 bg-white/15" />
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: remote.color }}
                />
                <span>{remote.name} · on call</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pre-call = just home-like launchpad, greyed out */}
      <AnimatePresence mode="wait">
        {phase === "pre-call" && (
          <motion.div
            key="pre"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 grid place-items-center"
          >
            <div className="glass-window p-8 text-center w-[440px]">
              <div className="text-[12px] text-white/55 uppercase tracking-[0.2em] mb-1">
                Horizon · Shared Space
              </div>
              <h1 className="text-[24px] font-semibold text-white mb-2">
                Waiting for your collaborator
              </h1>
              <p className="text-[13px] text-white/60">
                Ava will FaceTime you in a moment.
              </p>
              <div className="mt-6 flex items-center justify-center gap-1.5 text-white/40 text-[12px]">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulseSoft" />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulseSoft"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulseSoft"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {phase === "greeting" && (
          <motion.div
            key="greeting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 grid place-items-center px-10"
          >
            <div className="text-center max-w-[560px]">
              <div className="text-[12px] text-white/55 uppercase tracking-[0.2em] mb-2">
                You're on FaceTime with {remote.name}
              </div>
              <div className="text-[24px] font-semibold text-white/95 tracking-tight leading-tight">
                Pick a task and I'll join you.
              </div>
              <div className="text-[13px] text-white/55 mt-2">
                Reply with a tap below — then choose an app from the home
                screen.
              </div>
            </div>
          </motion.div>
        )}

        {phase === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <Home onLaunch={launchTask} />
          </motion.div>
        )}

        {phase === "task" && task && (
          <motion.div
            key={`task-${task}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-0 pt-20 pb-10 px-10"
          >
            <div className="flex items-center gap-3 mb-4 max-w-[1400px] mx-auto">
              <button
                onClick={() => {
                  setTask(null);
                  setPhase("home");
                }}
                className="glass-pill px-3 py-1.5 text-[12.5px] text-white/85 flex items-center gap-1.5 hover:bg-white/20 transition shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Home
              </button>

              <motion.div
                layout
                className="glass-panel flex-1 flex items-center gap-3 px-4 py-2"
                animate={{
                  boxShadow: taskReady
                    ? "0 0 0 1.5px rgba(75,216,99,0.7), 0 0 24px rgba(75,216,99,0.35)"
                    : "0 0 0 1px rgba(255,255,255,0.14)",
                }}
              >
                {taskReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Target className="w-4 h-4 text-white/70 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[10.5px] text-white/55 uppercase tracking-[0.16em]">
                    Your task
                  </div>
                  <div className="text-[13px] text-white/95 truncate">
                    {objective}
                  </div>
                </div>
              </motion.div>

              <button
                onClick={finishTask}
                disabled={!taskReady}
                className="px-4 py-1.5 rounded-full text-[12.5px] font-medium transition shrink-0"
                style={{
                  background: taskReady ? "#ffffff" : "rgba(255,255,255,0.12)",
                  color: taskReady ? "#111" : "rgba(255,255,255,0.55)",
                  boxShadow: taskReady ? "0 8px 24px rgba(255,255,255,0.25)" : "none",
                  cursor: taskReady ? "pointer" : "not-allowed",
                }}
              >
                Mark task done
              </button>
            </div>
            <div className="h-[calc(100%-48px)] max-w-[1400px] mx-auto">
              {task === "doc" && <DocEditor />}
              {task === "model" && <ModelViewer />}
              {task === "board" && <StickyBoard />}
            </div>
          </motion.div>
        )}

        {phase === "survey" && (
          <motion.div
            key="survey"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <Survey onDone={finishSurvey} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-on overlays once the call is live */}
      {phase !== "pre-call" && phase !== "incoming" && (
        <>
          <FaceTime onEnd={endCall} />
          <RemoteGaze />
        </>
      )}

      {/* Quick reply chips during greeting */}
      {phase === "greeting" && node && (
        <QuickReplies replies={node.replies} onPick={pickReply} />
      )}

      <AnimatePresence>
        {phase === "incoming" && (
          <IncomingCall onAccept={acceptCall} onDecline={declineCall} />
        )}
      </AnimatePresence>
    </div>
  );
}

