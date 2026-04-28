import { create } from "zustand";

export type AppId =
  | "doc"
  | "model"
  | "board"
  | "safari"
  | "mail"
  | "music"
  | "photos"
  | "messages"
  | "notes"
  | "weather"
  | "clock"
  | "freeform";

export type TaskId = Extract<AppId, "doc" | "model" | "board">;

export type Phase =
  | "pre-call"
  | "incoming"
  | "greeting"
  | "home"
  | "task"
  | "survey";

/** Where Ava is currently looking. App id, "facetime" (your screen), or null (idling / away). */
export type AvaFocus = AppId | "facetime" | null;

export type GazeTarget = {
  selector?: string;
  ox?: number;
  oy?: number;
  x?: number;
  y?: number;
};

export type RemoteUser = {
  id: string;
  name: string;
  color: string;
};

export type DialogMessage = {
  id: string;
  from: "ava" | "you";
  text: string;
};

type State = {
  phase: Phase;
  setPhase: (p: Phase) => void;

  task: TaskId | null;
  setTask: (t: TaskId | null) => void;

  remote: RemoteUser;

  /** Pixel target of the gaze circle overlay */
  gaze: GazeTarget;
  setGaze: (g: GazeTarget) => void;

  /** High-level semantic focus used for app-tile highlighting & FaceTime border */
  avaFocus: AvaFocus;
  setAvaFocus: (f: AvaFocus) => void;

  /** Short caption shown under Ava's name in FaceTime */
  caption: string | null;
  setCaption: (c: string | null) => void;

  /** Ava speech caption (bubble). Typed out char-by-char by DialogBar */
  avaSaying: string | null;
  setAvaSaying: (s: string | null) => void;

  /** True when Ava is composing a message/note — shows typing dots. */
  avaTyping: boolean;
  setAvaTyping: (b: boolean) => void;

  dialog: DialogMessage[];
  pushDialog: (m: DialogMessage) => void;
  clearDialog: () => void;

  scripted: boolean;
  setScripted: (b: boolean) => void;

  dialogNode: string | null;
  setDialogNode: (id: string | null) => void;

  /** Current scenario's coordinated objective state. */
  taskReady: boolean;
  setTaskReady: (b: boolean) => void;
};

export const useStore = create<State>((set) => ({
  phase: "pre-call",
  setPhase: (p) => set({ phase: p }),

  task: null,
  setTask: (t) => set({ task: t }),

  remote: {
    id: "ava",
    name: "Ava Chen",
    color: "#8ab4ff",
  },

  gaze: {},
  setGaze: (g) => set({ gaze: g }),

  avaFocus: null,
  setAvaFocus: (f) => set({ avaFocus: f }),

  caption: null,
  setCaption: (c) => set({ caption: c }),

  avaSaying: null,
  setAvaSaying: (s) => set({ avaSaying: s }),

  avaTyping: false,
  setAvaTyping: (b) => set({ avaTyping: b }),

  dialog: [],
  pushDialog: (m) => set((st) => ({ dialog: [...st.dialog, m] })),
  clearDialog: () => set({ dialog: [] }),

  scripted: true,
  setScripted: (b) => set({ scripted: b }),

  dialogNode: null,
  setDialogNode: (id) => set({ dialogNode: id }),

  taskReady: false,
  setTaskReady: (b) => set({ taskReady: b }),
}));

export const APPS: {
  id: AppId;
  name: string;
  tint: string;
  gradient: [string, string];
  task?: TaskId;
}[] = [
  {
    id: "doc",
    name: "Research Memo",
    tint: "#6aa5ff",
    gradient: ["#4f83ff", "#9fc4ff"],
    task: "doc",
  },
  {
    id: "model",
    name: "Airframe v3",
    tint: "#c29bff",
    gradient: ["#8d5cff", "#d4b7ff"],
    task: "model",
  },
  {
    id: "board",
    name: "Think Board",
    tint: "#ff9dbd",
    gradient: ["#ff5c8a", "#ffbcd1"],
    task: "board",
  },
  {
    id: "safari",
    name: "Safari",
    tint: "#4aa3ff",
    gradient: ["#1f6fff", "#7fb6ff"],
  },
  {
    id: "mail",
    name: "Mail",
    tint: "#5bcaff",
    gradient: ["#1499ff", "#7fe0ff"],
  },
  {
    id: "music",
    name: "Music",
    tint: "#ff5f7a",
    gradient: ["#ff2d55", "#ff8fa6"],
  },
  {
    id: "photos",
    name: "Photos",
    tint: "#ffb347",
    gradient: ["#ffb347", "#ff6bff"],
  },
  {
    id: "messages",
    name: "Messages",
    tint: "#4bd863",
    gradient: ["#1fd655", "#a2f2b0"],
  },
  {
    id: "notes",
    name: "Notes",
    tint: "#ffd466",
    gradient: ["#ffb300", "#ffe799"],
  },
  {
    id: "weather",
    name: "Weather",
    tint: "#8fc4ff",
    gradient: ["#3e6fff", "#a8d4ff"],
  },
  {
    id: "clock",
    name: "Clock",
    tint: "#333",
    gradient: ["#2a2a2a", "#5a5a5a"],
  },
  {
    id: "freeform",
    name: "Freeform",
    tint: "#ffcc66",
    gradient: ["#ff9b50", "#ffd98a"],
  },
];
