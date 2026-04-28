import { motion } from "framer-motion";
import { useState } from "react";
import { Star } from "lucide-react";

const QUESTIONS = [
  "How aware did you feel of Ava's attention?",
  "Did the shared space feel like 'being together'?",
  "Would you use this for real work?",
];

export function Survey({ onDone }: { onDone: () => void }) {
  const [answers, setAnswers] = useState<number[]>([0, 0, 0]);
  const allAnswered = answers.every((a) => a > 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="glass-window p-8 w-[520px]">
        <div className="text-[12px] text-white/55 uppercase tracking-[0.18em]">
          Usability check
        </div>
        <h2 className="text-[22px] font-semibold text-white mt-1 mb-6">
          How was that?
        </h2>
        <div className="space-y-5">
          {QUESTIONS.map((q, i) => (
            <div key={q}>
              <div className="text-[13.5px] text-white/85 mb-2">{q}</div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() =>
                      setAnswers((a) => a.map((v, j) => (j === i ? n : v)))
                    }
                    className="w-9 h-9 rounded-xl grid place-items-center transition hover:bg-white/10"
                    style={{
                      background:
                        answers[i] >= n ? "rgba(255,255,255,0.12)" : "transparent",
                    }}
                  >
                    <Star
                      className="w-4 h-4"
                      strokeWidth={1.5}
                      style={{
                        color: answers[i] >= n ? "#FFD466" : "rgba(255,255,255,0.4)",
                        fill: answers[i] >= n ? "#FFD466" : "transparent",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-8">
          <button
            onClick={onDone}
            className="glass-pill px-4 py-2 text-[13px] text-white/75 hover:text-white"
          >
            Skip
          </button>
          <button
            onClick={onDone}
            disabled={!allAnswered}
            className="px-5 py-2 rounded-full text-[13px] font-medium transition"
            style={{
              background: allAnswered ? "#ffffff" : "rgba(255,255,255,0.18)",
              color: allAnswered ? "#111" : "rgba(255,255,255,0.6)",
              boxShadow: allAnswered ? "0 6px 20px rgba(255,255,255,0.25)" : "none",
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </motion.div>
  );
}
