import { motion } from "framer-motion";
import { Phone, PhoneOff } from "lucide-react";
import { useStore } from "../store";

export function IncomingCall({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  const remote = useStore((s) => s.remote);
  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-window flex items-center gap-4 px-5 py-4"
      style={{ width: 360, borderRadius: 22 }}
    >
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        className="w-12 h-12 rounded-full grid place-items-center text-white font-semibold"
        style={{
          background: `conic-gradient(from 0deg, ${remote.color}, #c8a6ff, #ffa6d6, ${remote.color})`,
          boxShadow: `0 0 30px ${remote.color}88`,
        }}
      >
        <div className="w-[44px] h-[44px] rounded-full grid place-items-center bg-black/40 backdrop-blur">
          {remote.name
            .split(" ")
            .map((p) => p[0])
            .join("")}
        </div>
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-white/60">FaceTime Video</div>
        <div className="text-[15px] font-medium text-white truncate">
          {remote.name}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecline}
          className="w-10 h-10 rounded-full grid place-items-center text-white"
          style={{
            background: "#ff3b30",
            boxShadow: "0 6px 18px rgba(255,59,48,0.5)",
          }}
        >
          <PhoneOff className="w-4 h-4" />
        </button>
        <button
          onClick={onAccept}
          className="w-10 h-10 rounded-full grid place-items-center text-white animate-pulseSoft"
          style={{
            background: "#4bd863",
            boxShadow: "0 6px 18px rgba(75,216,99,0.55)",
          }}
        >
          <Phone className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
