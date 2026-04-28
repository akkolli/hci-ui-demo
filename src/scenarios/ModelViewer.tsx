import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, ContactShadows, Html } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Check, Crosshair } from "lucide-react";
import { Window } from "../components/Window";
import { useStore } from "../store";

/**
 * Task:
 *   Walk through a 3-part design review of the airframe with Ava. For each
 *   part, Ava points (gaze + a 3D-anchored target ring that rotates with
 *   the model) and asks for a design decision. You pick one option; the
 *   change live-previews on the 3D model. Task completes when all three
 *   decisions are made.
 *
 * Ava feels like a human collaborator:
 *   - Casual speech ("be honest — angled or straight?")
 *   - Reacts differently to each choice with short lines
 *   - Typing indicator before she speaks
 *   - Waits on you before moving on
 */

type PartId = "fuselage" | "wings" | "ring";

type Step = {
  id: PartId;
  label: string;
  /** 3D position, in the rotating model's local space. Marker anchors here. */
  anchor: [number, number, number];
  /** Target rotation that shows this part nicely */
  rot: { x: number; y: number };
  avaSays: string;
  question: string;
  options: { id: string; label: string; hex?: string }[];
};

const STEPS: Step[] = [
  {
    id: "fuselage",
    label: "Fuselage finish",
    anchor: [0, 0.3, 0.3],
    rot: { x: 0.1, y: -0.5 },
    avaSays: "ok, first the body finish — matte or chrome? which feels right.",
    question: "Pick a finish for the fuselage.",
    options: [
      { id: "matte", label: "Matte" },
      { id: "chrome", label: "Chrome" },
      { id: "satin", label: "Satin" },
    ],
  },
  {
    id: "wings",
    label: "Wing silhouette",
    anchor: [1.0, 0.1, 0],
    rot: { x: 0.45, y: 0.15 },
    avaSays: "wings. swept like now, or straight? honest opinion.",
    question: "Pick the wing silhouette.",
    options: [
      { id: "angled", label: "Swept" },
      { id: "straight", label: "Straight" },
    ],
  },
  {
    id: "ring",
    label: "Engine ring accent",
    anchor: [0, 0, -0.9],
    rot: { x: 0.1, y: 2.6 },
    avaSays:
      "last one — the engine ring at the back. blue is v2; wanna try something warmer?",
    question: "Pick the accent color.",
    options: [
      { id: "#8ab4ff", label: "Blue", hex: "#8ab4ff" },
      { id: "#ffb38a", label: "Warm", hex: "#ffb38a" },
      { id: "#ff6b88", label: "Coral", hex: "#ff6b88" },
      { id: "#a8ff8a", label: "Lime", hex: "#a8ff8a" },
    ],
  },
];

type Choices = {
  fuselage?: "matte" | "chrome" | "satin";
  wings?: "angled" | "straight";
  ring?: string;
};

const REACTIONS: Record<string, string> = {
  matte: "love matte tbh — feels grounded",
  chrome: "oooh chrome, risky. i'm into it.",
  satin: "safe pick. looks good though.",
  angled: "yeah the rake gives it attitude 👍",
  straight: "cleaner, more serious. hmm.",
  "#8ab4ff": "classic — no notes.",
  "#ffb38a": "warmer works surprisingly well.",
  "#ff6b88": "bold! people will notice.",
  "#a8ff8a": "lol ok, that's fun.",
};

export function ModelViewer() {
  const setGaze = useStore((s) => s.setGaze);
  const setAvaFocus = useStore((s) => s.setAvaFocus);
  const setCaption = useStore((s) => s.setCaption);
  const setAvaSaying = useStore((s) => s.setAvaSaying);
  const setAvaTyping = useStore((s) => s.setAvaTyping);
  const setTaskReady = useStore((s) => s.setTaskReady);
  const remote = useStore((s) => s.remote);

  const [rot, setRot] = useState({ x: 0.1, y: -0.5 });
  const [userDragging, setUserDragging] = useState(false);
  const userTookOver = useRef(false);
  const [activeIx, setActiveIx] = useState(0);
  const [choices, setChoices] = useState<Choices>({});
  const doneCount = Object.values(choices).filter(Boolean).length;

  useEffect(() => {
    setTaskReady(doneCount >= STEPS.length);
  }, [doneCount, setTaskReady]);

  // On each step: Ava types, then narrates; 3D marker appears; auto-rotate toward the target view.
  useEffect(() => {
    const step = STEPS[activeIx];
    if (!step) return;
    let cancelled = false;
    (async () => {
      setAvaFocus("model");
      setCaption("pointing things out");
      setAvaSaying(null);
      setAvaTyping(true);
      await wait(1000 + Math.random() * 500);
      if (cancelled) return;
      setAvaTyping(false);
      setAvaSaying(step.avaSays);

      // Auto-rotate toward the showcase angle unless the user is dragging
      if (!userTookOver.current) {
        const steps = 32;
        for (let i = 0; i < steps; i++) {
          if (cancelled || userDragging) break;
          await wait(28);
          setRot((r) => ({
            x: r.x + (step.rot.x - r.x) * 0.15,
            y: r.y + (step.rot.y - r.y) * 0.15,
          }));
        }
      }
      await wait(900);
      if (cancelled) return;
      setCaption("waiting for you");
    })();
    return () => {
      cancelled = true;
    };
  }, [activeIx]); // eslint-disable-line

  // Ava's gaze tracks the active marker element; updated each frame by drei.
  useEffect(() => {
    const step = STEPS[activeIx];
    if (!step) return;
    setGaze({ selector: `#marker-${step.id}` });
    setAvaFocus("model");
  }, [activeIx, setGaze, setAvaFocus]);

  const pick = (optionId: string) => {
    const step = STEPS[activeIx];
    setChoices((c) => ({ ...c, [step.id]: optionId }));
    setAvaSaying(REACTIONS[optionId] ?? "nice.");
    setCaption("reacting");
    window.setTimeout(() => {
      setAvaSaying(null);
      if (activeIx < STEPS.length - 1) {
        setActiveIx((i) => i + 1);
      } else {
        setCaption("all three picked — thanks");
        setAvaSaying("that's it, three for three. thanks for this 🙌");
      }
    }, 1800);
  };

  return (
    <div className="flex gap-6 w-full h-full">
      <Window
        id="model-window"
        title="Airframe v3 · Design Review"
        subtitle={`Shared review with ${remote.name}`}
        className="flex-1 min-w-0"
      >
        <div
          id="model-canvas"
          className="relative h-full"
          style={{
            cursor: userDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            setUserDragging(true);
            userTookOver.current = true;
          }}
          onPointerUp={(e) => {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            setUserDragging(false);
          }}
          onPointerCancel={() => setUserDragging(false)}
          onPointerMove={(e) => {
            if (!userDragging) return;
            setRot((r) => ({
              x: Math.max(-1.1, Math.min(1.1, r.x + e.movementY * 0.008)),
              y: r.y + e.movementX * 0.01,
            }));
          }}
        >
          <Canvas
            camera={{ position: [0, 0.4, 3.2], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
          >
            <color
              attach="background"
              args={["transparent" as unknown as string]}
            />
            <ambientLight intensity={0.4} />
            <directionalLight position={[3, 4, 2]} intensity={1.1} />
            <directionalLight
              position={[-3, -1, -2]}
              intensity={0.4}
              color="#8ab4ff"
            />
            <Float
              speed={1.1}
              rotationIntensity={0.1}
              floatIntensity={0.35}
            >
              <RotatingModel
                rot={rot}
                choices={choices}
                activePart={STEPS[activeIx]?.id}
                markerColor={remote.color}
              />
            </Float>
            <ContactShadows
              position={[0, -1.1, 0]}
              opacity={0.45}
              scale={6}
              blur={2.4}
              far={2}
            />
            <Environment preset="city" />
          </Canvas>
        </div>
      </Window>

      {/* Side panel: steps + inline options */}
      <div className="w-[340px] shrink-0 flex flex-col gap-4">
        <Window id="model-panel" title="Design review" className="flex-1">
          <div className="p-4 flex flex-col gap-3 overflow-auto thin-scroll h-full">
            <div className="text-[11px] text-white/55 mb-1">
              {doneCount} of {STEPS.length} decided
            </div>
            {STEPS.map((step, ix) => {
              const picked = (choices as Record<string, string | undefined>)[step.id];
              const state =
                picked != null
                  ? "done"
                  : ix === activeIx
                    ? "active"
                    : ix < activeIx
                      ? "done"
                      : "queued";
              return (
                <motion.div
                  key={step.id}
                  layout
                  className="glass-panel p-3"
                  animate={{
                    boxShadow:
                      state === "active"
                        ? `0 0 0 1.5px ${remote.color}bb, 0 0 24px ${remote.color}44`
                        : state === "done"
                          ? "0 0 0 1px rgba(75,216,99,0.45)"
                          : "0 0 0 1px rgba(255,255,255,0.1)",
                    opacity: state === "queued" ? 0.55 : 1,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-semibold shrink-0"
                      style={{
                        background:
                          state === "done"
                            ? "rgba(75,216,99,0.75)"
                            : state === "active"
                              ? remote.color
                              : "rgba(255,255,255,0.14)",
                        color: "white",
                      }}
                    >
                      {state === "done" ? <Check className="w-3 h-3" /> : ix + 1}
                    </div>
                    <div className="text-[12.5px] font-medium text-white">
                      {step.label}
                    </div>
                  </div>
                  <div className="text-[11.5px] text-white/65 mt-1.5 mb-2">
                    {step.question}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {step.options.map((opt) => {
                      const isPicked = picked === opt.id;
                      const disabled = state === "queued";
                      return (
                        <button
                          key={opt.id}
                          disabled={disabled}
                          onClick={() => {
                            if (state === "active") pick(opt.id);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium transition"
                          style={{
                            background: isPicked
                              ? "rgba(255,255,255,0.25)"
                              : state === "active"
                                ? "rgba(255,255,255,0.08)"
                                : "rgba(255,255,255,0.04)",
                            color: isPicked ? "white" : "rgba(255,255,255,0.85)",
                            border: isPicked
                              ? "1px solid rgba(255,255,255,0.45)"
                              : "1px solid rgba(255,255,255,0.12)",
                            cursor:
                              state === "active" && !isPicked
                                ? "pointer"
                                : "default",
                          }}
                        >
                          {opt.hex && (
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{
                                background: opt.hex,
                                boxShadow: `0 0 8px ${opt.hex}88`,
                              }}
                            />
                          )}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Window>
      </div>
    </div>
  );
}

/* ---------------------- 3D model + anchored markers ------------------ */

function RotatingModel({
  rot,
  choices,
  activePart,
  markerColor,
}: {
  rot: { x: number; y: number };
  choices: Choices;
  activePart: PartId | undefined;
  markerColor: string;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      rot.x,
      0.1,
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      rot.y,
      0.1,
    );
  });

  // Material for fuselage based on user choice (live preview)
  const fuselageMat =
    choices.fuselage === "chrome"
      ? { color: "#e8ecf2", metalness: 1.0, roughness: 0.08 }
      : choices.fuselage === "satin"
        ? { color: "#c6cfde", metalness: 0.6, roughness: 0.35 }
        : // default matte
          { color: "#b6bdc8", metalness: 0.15, roughness: 0.7 };

  const wingsStraight = choices.wings === "straight";
  const ringColor = choices.ring ?? "#8ab4ff";

  const wingMat = (
    <meshStandardMaterial color="#aab4c6" metalness={0.75} roughness={0.3} />
  );
  const tailMat = (
    <meshStandardMaterial color="#9aa4b6" metalness={0.75} roughness={0.3} />
  );

  // Wings: two separate meshes so we can sweep/straighten them.
  // Swept: rotated back around Y by ~0.25 rad each.
  // Straight: rotated back by 0, sitting flat perpendicular to fuselage.
  const sweep = wingsStraight ? 0 : 0.3;
  const dihedral = wingsStraight ? 0 : 0.06;
  const wingOffsetZ = wingsStraight ? 0 : -0.1; // swept wings sit slightly aft

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Fuselage — horizontal capsule along Z axis */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.3, 1.1, 12, 24]} />
        <meshStandardMaterial {...fuselageMat} />
      </mesh>

      {/* Nose cone (pointed front) */}
      <mesh position={[0, 0, 0.95]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.3, 0.32, 24]} />
        <meshStandardMaterial {...fuselageMat} />
      </mesh>

      {/* Canopy (cockpit bubble) */}
      <mesh position={[0, 0.22, 0.3]} castShadow>
        <sphereGeometry args={[0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#1a2435"
          metalness={0.9}
          roughness={0.15}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Left wing */}
      <mesh
        position={[-0.55, -0.04, wingOffsetZ]}
        rotation={[0, sweep, -dihedral]}
        castShadow
      >
        <boxGeometry args={[1.15, 0.05, 0.45]} />
        {wingMat}
      </mesh>
      {/* Right wing */}
      <mesh
        position={[0.55, -0.04, wingOffsetZ]}
        rotation={[0, -sweep, dihedral]}
        castShadow
      >
        <boxGeometry args={[1.15, 0.05, 0.45]} />
        {wingMat}
      </mesh>

      {/* Horizontal stabilizers (small tail wings) */}
      <mesh position={[-0.3, 0.05, -0.72]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.55, 0.04, 0.22]} />
        {tailMat}
      </mesh>
      <mesh position={[0.3, 0.05, -0.72]} rotation={[0, -0.15, 0]}>
        <boxGeometry args={[0.55, 0.04, 0.22]} />
        {tailMat}
      </mesh>

      {/* Vertical tail fin */}
      <mesh position={[0, 0.32, -0.72]}>
        <boxGeometry args={[0.04, 0.48, 0.36]} />
        {tailMat}
      </mesh>

      {/* Engine ring — at the rear, visibly larger than fuselage so it
          reads as a jet-engine rim. */}
      <mesh position={[0, 0, -0.85]}>
        <torusGeometry args={[0.36, 0.045, 20, 64]} />
        <meshStandardMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={1.3}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
      {/* Exhaust nozzle inside the ring for depth */}
      <mesh position={[0, 0, -0.82]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.18, 24, 1, true]} />
        <meshStandardMaterial
          color="#1a1a22"
          metalness={0.7}
          roughness={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner glow disc */}
      <mesh position={[0, 0, -0.95]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.35} />
      </mesh>

      {/* 3D-anchored markers — they rotate with the model. */}
      {STEPS.map((step) =>
        step.id === activePart ? (
          <Html
            key={step.id}
            position={step.anchor}
            center
            style={{ pointerEvents: "none" }}
            zIndexRange={[10, 0]}
          >
            <Marker
              id={`marker-${step.id}`}
              color={markerColor}
              label={step.label}
            />
          </Html>
        ) : null,
      )}
    </group>
  );
}

function Marker({
  id,
  color,
  label,
}: {
  id: string;
  color: string;
  label: string;
}) {
  return (
    <div id={id} className="relative" style={{ width: 0, height: 0 }}>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 56,
          height: 56,
          left: -28,
          top: -28,
          border: `1.5px dashed ${color}cc`,
          boxShadow: `0 0 18px ${color}66, inset 0 0 10px ${color}33`,
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute whitespace-nowrap glass-pill px-2 py-0.5 text-[10px] flex items-center gap-1"
        style={{
          left: 14,
          top: -10,
          color: "white",
          background: `${color}55`,
          border: `1px solid ${color}`,
          textShadow: "0 1px 2px rgba(0,0,0,0.45)",
        }}
      >
        <Crosshair className="w-2.5 h-2.5" />
        {label}
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
