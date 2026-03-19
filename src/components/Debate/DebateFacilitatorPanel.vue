<script setup lang="ts">
import { useElementSize } from "@vueuse/core";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import debateConfig from "@/data/debate-config.json";
import presets from "@/data/spectrum.json";
import { hasReadyDebatePrompt } from "@/lib/debatePrompts.js";
import { shouldPlayDebateTimerEndJingle } from "@/lib/debateTimerUiState.js";
import { formatPhaseTime } from "@/lib/spectrumTimer.js";
import bingBongJingle from "@/components/SessionBoard/jingles/bing-bong.wav";
import DebateDisplay from "./DebateDisplay.vue";
import DebateExplainer from "./DebateExplainer.vue";
import DebatePhaseStepper from "./DebatePhaseStepper.vue";
import DebatePromptList from "./DebatePromptList.vue";
import { useFacilitatorSync, type DebateState } from "./useDebateBroadcastSync";

type Phase = { name: string; short?: string; duration: number; side?: "disagree" | "agree" };
type Prompt = { text: string; subtitle: string };

const phases = ref<Phase[]>(
  (debateConfig.phases as Array<Record<string, unknown>>).map((p) => ({
    name: typeof p.name === "string" ? p.name : "",
    short: typeof p.short === "string" ? p.short : typeof p.name === "string" ? p.name : "",
    duration: typeof p.duration === "number" ? p.duration : 0,
    side:
      p.side === "agree" || p.side === "disagree"
        ? (p.side as "agree" | "disagree")
        : undefined,
  }))
);

const hasReadyPrompt = computed(() => hasReadyDebatePrompt(prompts.value));

// ── State ─────────────────────────────────────────────────
const prompts = ref<Prompt[]>([{ text: "", subtitle: "" }]);
const currentPromptIndex = ref(0);
const currentPhaseIndex = ref(-1);
const timerState = ref<"idle" | "ready" | "running" | "stopped" | "finished">("idle");
const timeRemaining = ref(0);
const audienceMode = ref<"explainer" | "debate">("debate");
const isLightTheme = ref(false);

// ── Broadcast sync ────────────────────────────────────────
const state = computed<DebateState>(() => ({
  audienceMode: audienceMode.value,
  prompts: prompts.value,
  currentPromptIndex: currentPromptIndex.value,
  currentPhaseIndex: currentPhaseIndex.value,
  timerState: timerState.value,
  timeRemaining: timeRemaining.value,
  isLightTheme: isLightTheme.value,
  phases: phases.value,
}));

useFacilitatorSync(state);

// ── Timer ─────────────────────────────────────────────────
let timerInterval: ReturnType<typeof setInterval> | null = null;

const clearTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const resetToIdle = () => {
  clearTimer();
  currentPhaseIndex.value = -1;
  timerState.value = "idle";
  timeRemaining.value = 0;
};

const selectPhase = (index: number) => {
  clearTimer();
  const phase = phases.value[index];
  if (!phase) {
    resetToIdle();
    return;
  }
  currentPhaseIndex.value = index;
  timeRemaining.value = phase.duration;
  timerState.value = "ready";
};

const playTimer = () => {
  const phase = phases.value[currentPhaseIndex.value];
  if (!phase) return;
  timerState.value = "running";
  if (phase.duration === 0) return;
  timerInterval = setInterval(() => {
    timeRemaining.value--;
    if (timeRemaining.value <= 0) {
      clearTimer();
      timerState.value = "finished";
      timeRemaining.value = 0;
    }
  }, 1000);
};

const pauseTimer = () => {
  clearTimer();
  timerState.value = "stopped";
};

const addTime = () => {
  timeRemaining.value += 60;
  if (timerState.value === "finished" || timerState.value === "ready") {
    playTimer();
  }
};

const advancePhase = () => {
  const next = currentPhaseIndex.value + 1;
  if (next < phases.value.length) selectPhase(next);
};

// ── Prompt navigation ─────────────────────────────────────
const setPromptIndex = (nextIndex: number) => {
  resetToIdle();
  currentPromptIndex.value = nextIndex;
};

// ── Current prompt inline editing ─────────────────────────
const currentPrompt = computed(
  () => prompts.value[currentPromptIndex.value] ?? { text: "", subtitle: "" }
);

const updateCurrentText = (v: string) => {
  prompts.value = prompts.value.map((p, i) =>
    i === currentPromptIndex.value ? { ...p, text: v } : p
  );
};

const updateCurrentSubtitle = (v: string) => {
  prompts.value = prompts.value.map((p, i) =>
    i === currentPromptIndex.value ? { ...p, subtitle: v } : p
  );
};

// ── Timer display for sidebar ─────────────────────────────
const sidebarTimerText = computed(() => {
  if (timerState.value === "idle") return "—";
  if (currentPhaseIndex.value < 0) return "—";
  const phase = phases.value[currentPhaseIndex.value];
  if (!phase) return "—";
  if (phase.duration === 0) return "—";
  return formatPhaseTime(timeRemaining.value);
});

// ── Theme / fullscreen / audience ─────────────────────────
const toggleTheme = () => {
  isLightTheme.value = !isLightTheme.value;
};

const toggleFullscreen = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
};

const openAudienceView = () => {
  window.open("/spectrum/display", "debate-display");
};

// ── Keyboard shortcuts ────────────────────────────────────
onMounted(() => {
  function onKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (currentPromptIndex.value > 0) setPromptIndex(currentPromptIndex.value - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (currentPromptIndex.value < prompts.value.length - 1)
        setPromptIndex(currentPromptIndex.value + 1);
    } else if ((e.key === "b" || e.key === "B") && timerState.value === "idle") {
      selectPhase(0);
    } else if (
      (e.key === "n" || e.key === "N") &&
      (timerState.value === "ready" ||
        timerState.value === "stopped" ||
        timerState.value === "finished")
    ) {
      advancePhase();
    } else if (
      e.key === " " &&
      (timerState.value === "ready" || timerState.value === "stopped")
    ) {
      e.preventDefault();
      playTimer();
    } else if (
      (e.key === "s" || e.key === "S" || e.key === " ") &&
      timerState.value === "running"
    ) {
      e.preventDefault();
      pauseTimer();
    }
  }
  window.addEventListener("keydown", onKeyDown);
  onUnmounted(() => window.removeEventListener("keydown", onKeyDown));
});

onUnmounted(() => clearTimer());

// ── Preview scaling ───────────────────────────────────────
const previewContainer = ref<HTMLElement | null>(null);
const { width: containerW, height: containerH } = useElementSize(previewContainer);
const PREVIEW_W = 1920;
const PREVIEW_H = 1080;
const previewScale = computed(() =>
  Math.min(containerW.value / PREVIEW_W, containerH.value / PREVIEW_H)
);
const previewInnerStyle = computed(() => ({
  transform: `scale(${previewScale.value})`,
  transformOrigin: "top left",
  width: `${PREVIEW_W}px`,
  height: `${PREVIEW_H}px`,
}));
const previewOuterStyle = computed(() => ({
  width: `${PREVIEW_W * previewScale.value}px`,
  height: `${PREVIEW_H * previewScale.value}px`,
}));

// ── Phase CRUD ────────────────────────────────────────────
const addPhase = () => {
  phases.value = [...phases.value, { name: "New Phase", short: "Phase", duration: 60 }];
};

const deletePhase = (i: number) => {
  if (i === currentPhaseIndex.value) {
    resetToIdle();
  } else if (i < currentPhaseIndex.value) {
    currentPhaseIndex.value--;
  }
  phases.value = phases.value.filter((_, idx) => idx !== i);
};

// ── Computed UI state ─────────────────────────────────────
const canBegin = computed(() => timerState.value === "idle");
const canPlay = computed(
  () => timerState.value === "ready" || timerState.value === "stopped"
);
const canPause = computed(() => timerState.value === "running");
const canNext = computed(
  () =>
    (timerState.value === "ready" ||
      timerState.value === "stopped" ||
      timerState.value === "finished") &&
    currentPhaseIndex.value < phases.value.length - 1
);
const canAddTime = computed(
  () => timerState.value !== "idle" && (phases.value[currentPhaseIndex.value]?.duration ?? 0) > 0
);
const canReset = computed(() => timerState.value !== "idle");

watch(timerState, (nextTimerState, previousTimerState) => {
  if (
    !shouldPlayDebateTimerEndJingle({
      role: "facilitator",
      previousTimerState,
      nextTimerState,
    })
  ) {
    return;
  }

  void new Audio(bingBongJingle).play().catch(() => {});
});
</script>

<template>
  <div :class="['debate-facilitator', { 'theme-light': isLightTheme }]">
    <!-- Sidebar -->
    <div class="sidebar">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="header-top">
          <a href="/" class="back-btn">← Back</a>
          <span class="tool-title">Debate</span>
        </div>
        <button class="btn-primary" @click="openAudienceView">Open Audience View</button>
      </div>

      <!-- Audience Mode -->
      <div class="sidebar-section">
        <div class="section-label">Audience View</div>
        <div class="segmented">
          <button
            :class="['seg-btn', { active: audienceMode === 'explainer' }]"
            @click="audienceMode = 'explainer'"
          >
            Explainer
          </button>
          <button
            :class="['seg-btn', { active: audienceMode === 'debate' }]"
            @click="audienceMode = 'debate'"
          >
            Debate Display
          </button>
        </div>
      </div>

      <!-- Current Prompt -->
      <div class="sidebar-section">
        <div class="section-label">Current Prompt</div>
        <div class="prompt-nav">
          <button
            class="nav-btn"
            :disabled="currentPromptIndex === 0"
            @click="setPromptIndex(currentPromptIndex - 1)"
          >
            ←
          </button>
          <span class="prompt-counter">
            {{ currentPromptIndex + 1 }} / {{ prompts.length }}
          </span>
          <button
            class="nav-btn"
            :disabled="currentPromptIndex === prompts.length - 1"
            @click="setPromptIndex(currentPromptIndex + 1)"
          >
            →
          </button>
        </div>
        <textarea
          class="content-textarea"
          :value="currentPrompt.text"
          placeholder="Enter a debate prompt…"
          rows="3"
          @input="updateCurrentText(($event.target as HTMLTextAreaElement).value)"
        />
        <input
          class="subtitle-input"
          :value="currentPrompt.subtitle"
          placeholder="Subtitle (optional)…"
          @input="updateCurrentSubtitle(($event.target as HTMLInputElement).value)"
        />
        <div class="keyboard-hint">← → arrow keys to navigate</div>
      </div>

      <!-- All Prompts -->
      <div class="sidebar-section">
        <div class="section-label">All Prompts</div>
        <DebatePromptList
          :prompts="prompts"
          :currentPromptIndex="currentPromptIndex"
          :presets="presets"
          @update:prompts="(v) => (prompts = v)"
          @update:currentPromptIndex="(v) => setPromptIndex(v)"
        />
      </div>

      <!-- Phases -->
      <div class="sidebar-section">
        <div class="section-label">Phases</div>
        <DebatePhaseStepper
          :phases="phases"
          :currentPhaseIndex="currentPhaseIndex"
          :timerState="timerState"
          @jump="(i) => selectPhase(i)"
          @update:phases="(v) => (phases = v)"
          @add="addPhase"
          @delete="deletePhase"
        />

        <div class="phase-actions">
          <button
            v-if="canBegin"
            class="btn-action btn-accent"
            :disabled="!hasReadyPrompt"
            @click="selectPhase(0)"
          >
            Begin Debate
          </button>
          <button v-if="canPlay" class="btn-action btn-accent" @click="playTimer">
            ▶ Play
          </button>
          <button v-if="canPause" class="btn-action btn-stop" @click="pauseTimer">
            ⏸ Pause
          </button>
          <button v-if="canAddTime" class="btn-action btn-ghost" @click="addTime">+1 min</button>
          <button v-if="canNext" class="btn-action btn-ghost" @click="advancePhase">
            Next →
          </button>
          <button v-if="canReset" class="btn-action btn-ghost" @click="resetToIdle">Reset</button>
        </div>

        <div v-if="timerState !== 'idle'" class="timer-readout">
          <span class="timer-phase-name">
            {{ currentPhaseIndex >= 0 ? phases[currentPhaseIndex]?.name : "" }}
          </span>
          <span class="timer-value">{{ sidebarTimerText }}</span>
        </div>

        <div class="keyboard-hint">
          <span><kbd>B</kbd> begin</span>
          <span><kbd>Space</kbd> play/pause</span>
          <span><kbd>N</kbd> next</span>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div class="preview-area" ref="previewContainer">
      <div class="preview-outer" :style="previewOuterStyle">
        <div class="preview-inner" :style="previewInnerStyle">
          <DebateExplainer
            v-if="audienceMode === 'explainer'"
            :phases="phases"
            :isLightTheme="isLightTheme"
          />
          <DebateDisplay
            v-else
            :prompts="prompts"
            :currentPromptIndex="currentPromptIndex"
            :phases="phases"
            :currentPhaseIndex="currentPhaseIndex"
            :timerState="timerState"
            :timeRemaining="timeRemaining"
            :isLightTheme="isLightTheme"
          />
        </div>
      </div>
    </div>

    <!-- Utility controls -->
    <div class="preview-controls">
      <button class="utility-btn" title="Toggle theme" @click="toggleTheme">◐</button>
      <button class="utility-btn" title="Toggle fullscreen" @click="toggleFullscreen">⛶</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.debate-facilitator {
  --theme-bg: 17, 17, 17;
  --theme-surface: 28, 28, 28;
  --theme-text: 249, 249, 249;
  --theme-accent: 204, 65, 37;
  --theme-accent-dark: 154, 3, 30;

  &.theme-light {
    --theme-bg: 247, 244, 236;
    --theme-surface: 255, 250, 242;
    --theme-text: 44, 37, 31;
    --theme-accent: 163, 78, 48;
    --theme-accent-dark: 122, 53, 33;
  }

  display: flex;
  height: 100vh;
  overflow: hidden;
  background: rgb(var(--theme-bg));
  color: rgb(var(--theme-text));
  font-family: "IBM Plex Sans", sans-serif;
}

/* ── Sidebar ────────────────────────────────────────── */
.sidebar {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgb(var(--theme-surface));
  border-right: 1px solid rgba(var(--theme-text), 0.07);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--theme-text), 0.15) transparent;
}

.sidebar-header {
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid rgba(var(--theme-text), 0.07);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tool-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgb(var(--theme-text));
}

.back-btn {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: rgba(var(--theme-text), 0.75);
  background: rgba(var(--theme-bg), 0.5);
  border: 1px solid rgba(var(--theme-text), 0.14);
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  white-space: nowrap;
  transition:
    color 0.15s,
    border-color 0.15s;

  &:hover {
    color: rgb(var(--theme-text));
    border-color: rgba(var(--theme-text), 0.3);
  }
}

.btn-primary {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.6rem 1rem;
  border-radius: 0.375rem;
  border: none;
  background: rgb(var(--theme-accent));
  color: #fff;
  cursor: pointer;
  width: 100%;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.88;
  }
}

.sidebar-section {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid rgba(var(--theme-text), 0.07);
}

.section-label {
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(var(--theme-accent), 0.7);
  margin-bottom: 0.6rem;
  display: block;
}

/* ── Audience Mode Toggle ─────────────────────────────── */
.segmented {
  display: flex;
  border: 1px solid rgba(var(--theme-text), 0.1);
  border-radius: 0.375rem;
  overflow: hidden;
}

.seg-btn {
  flex: 1;
  padding: 0.45rem 0.5rem;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  background: transparent;
  color: rgba(var(--theme-text), 0.45);
  border: none;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &:not(:first-child) {
    border-left: 1px solid rgba(var(--theme-text), 0.1);
  }

  &.active {
    background: rgba(var(--theme-accent), 0.12);
    color: rgb(var(--theme-accent));
    font-weight: 600;
  }

  &:hover:not(.active) {
    background: rgba(var(--theme-text), 0.04);
    color: rgba(var(--theme-text), 0.7);
  }
}

/* ── Current Prompt ───────────────────────────────────── */
.prompt-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.nav-btn {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(var(--theme-text), 0.12);
  background: transparent;
  color: rgb(var(--theme-text));
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;

  &:hover:not(:disabled) {
    background: rgba(var(--theme-text), 0.08);
  }

  &:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }
}

.prompt-counter {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.72rem;
  color: rgba(var(--theme-text), 0.45);
  flex: 1;
  text-align: center;
}

.content-textarea {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.85rem;
  background: rgba(var(--theme-text), 0.04);
  border: 1px solid rgba(var(--theme-text), 0.1);
  border-radius: 0.25rem;
  color: rgb(var(--theme-text));
  padding: 0.5rem;
  width: 100%;
  resize: vertical;
  min-height: 4rem;
  outline: none;
  line-height: 1.4;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(var(--theme-text), 0.25);
  }

  &:focus {
    border-color: rgba(var(--theme-accent), 0.5);
  }
}

.subtitle-input {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.78rem;
  font-style: italic;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(var(--theme-text), 0.1);
  color: rgba(var(--theme-text), 0.5);
  padding: 0.4rem 0 0.3rem;
  width: 100%;
  outline: none;
  margin-top: 0.35rem;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(var(--theme-text), 0.2);
  }

  &:focus {
    border-bottom-color: rgba(var(--theme-accent), 0.4);
  }
}

.keyboard-hint {
  font-size: 0.62rem;
  color: rgba(var(--theme-text), 0.28);
  margin-top: 0.5rem;
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;

  kbd {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.55rem;
    background: rgba(var(--theme-text), 0.08);
    border: 1px solid rgba(var(--theme-text), 0.12);
    border-radius: 0.2rem;
    padding: 0.1rem 0.3rem;
  }
}

/* ── Phase Actions ────────────────────────────────────── */
.phase-actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.btn-action {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.4rem 0.75rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.88;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.btn-accent {
  background: rgb(var(--theme-accent));
  color: #fff;
}

.btn-stop {
  background: rgba(var(--theme-text), 0.1);
  color: rgb(var(--theme-text));
  border: 1px solid rgba(var(--theme-text), 0.15);
}

.btn-ghost {
  background: transparent;
  color: rgba(var(--theme-text), 0.45);
  border: 1px solid rgba(var(--theme-text), 0.12);
}

/* ── Timer Readout ────────────────────────────────────── */
.timer-readout {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: 0.6rem;
  padding: 0.4rem 0.5rem;
  background: rgba(var(--theme-text), 0.03);
  border-radius: 0.25rem;
  border: 1px solid rgba(var(--theme-text), 0.07);
}

.timer-phase-name {
  font-size: 0.7rem;
  color: rgba(var(--theme-text), 0.45);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timer-value {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgb(var(--theme-text));
  flex-shrink: 0;
}

/* ── Utility buttons ──────────────────────────────────── */
.utility-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1px solid rgba(var(--theme-text), 0.15);
  background: transparent;
  color: rgb(var(--theme-text));
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: background 0.1s;

  &:hover {
    background: rgba(var(--theme-text), 0.08);
  }
}

.preview-controls {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.25rem;
  z-index: 10;
}

/* ── Preview ──────────────────────────────────────────── */
.preview-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--theme-bg));
  overflow: hidden;
  padding: 1rem;
  box-sizing: border-box;
}

.preview-outer {
  position: relative;
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.preview-inner {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
