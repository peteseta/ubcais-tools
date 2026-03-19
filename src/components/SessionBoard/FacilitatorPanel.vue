<script setup lang="ts">
import { useElementSize } from "@vueuse/core";
import { computed, onMounted, onUnmounted, ref } from "vue";
import QotdGenerator from "./QotdGenerator.vue";
import SessionBoardDisplay from "./SessionBoardDisplay.vue";
import StagesStepper from "./StagesStepper.vue";
import TimerControls from "./TimerControls.vue";
import NotesEditor from "./NotesEditor.vue";
import { useFacilitatorSync } from "./useBroadcastSync";
import { applyFirstStage, applyStage, stages } from "./useSessionConfig";
import {
  bottomLeftNotes,
  bottomLeftText,
  bottomRightNotes,
  bottomRightText,
  centerText,
  countdownTitle,
  countdownToTime,
  isParamsEmpty,
  mainContentState,
  qotd,
  qotdLocation,
  reset,
  stageIndex,
  state,
  topLeftNotes,
  topLeftText,
  topRightNotes,
  topRightText,
} from "./useSessionBoardState";

// Theme
const isLight = ref(false);
const toggleTheme = () => (isLight.value = !isLight.value);

// Fullscreen
const toggleFullscreen = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
};

// Audience view
const openAudienceView = () => {
  window.open("/session/display", "session-board-display");
};

// Stage selection
const currentStageId = computed(() => stages[stageIndex.value]?.id ?? "");
const handleStageSelect = (id: string) => {
  const index = stages.findIndex((s) => s.id === id);
  if (index >= 0) applyStage(index);
};

// Keyboard nav
onMounted(() => {
  function onKeyDown(e: KeyboardEvent) {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    )
      return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      applyStage(Math.min(stageIndex.value + 1, stages.length - 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      applyStage(Math.max(stageIndex.value - 1, 0));
    }
  }
  window.addEventListener("keydown", onKeyDown);
  onUnmounted(() => window.removeEventListener("keydown", onKeyDown));
});

// BroadcastChannel sync
useFacilitatorSync(state);

// Preview scaling
const previewContainer = ref<HTMLElement | null>(null);
const { width: containerW, height: containerH } =
  useElementSize(previewContainer);
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

// Current stage content type
const contentType = computed(
  () => stages[stageIndex.value]?.content?.type ?? "qotd"
);

// countdownToTime string binding
const countdownToTimeString = computed({
  get() {
    return `${countdownToTime.value.hour}:${String(countdownToTime.value.minute).padStart(2, "0")}`;
  },
  set(value: string) {
    const [hour, minute] = value.split(":").map(Number);
    countdownToTime.value = { hour, minute };
  },
});

// Reset with two-click confirmation
const resetPending = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | undefined;
function handleReset() {
  if (resetPending.value) {
    clearTimeout(resetTimer);
    resetPending.value = false;
    applyFirstStage();
  } else {
    resetPending.value = true;
    resetTimer = setTimeout(() => {
      resetPending.value = false;
    }, 3000);
  }
}

// Init
onMounted(() => {
  if (isParamsEmpty.value) {
    applyFirstStage();
  }
});
</script>

<template>
  <div :class="['facilitator-panel', { 'theme-light': isLight }]">
    <!-- Sidebar -->
    <div class="sidebar">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="header-top">
          <span class="tool-title">Session Board</span>
          <div class="header-actions">
            <button class="utility-btn" @click="toggleTheme" title="Toggle theme">◐</button>
            <button class="utility-btn" @click="toggleFullscreen" title="Toggle fullscreen">⛶</button>
          </div>
        </div>
        <button class="btn-primary" @click="openAudienceView">
          Open Audience View
        </button>
      </div>

      <!-- Stage stepper -->
      <div class="sidebar-section">
        <div class="section-label">Stages</div>
        <StagesStepper
          :stages="stages"
          :currentStageId="currentStageId"
          @select="handleStageSelect"
        />
        <div class="keyboard-hint">← → arrow keys to navigate</div>
      </div>

      <!-- Content -->
      <div class="sidebar-section">
        <div class="section-label">Content</div>

        <!-- Timer content -->
        <template v-if="contentType === 'timer'">
          <TimerControls
            :countdownToTime="countdownToTime"
            :countdownTitle="countdownTitle"
            @update:countdownToTime="(v) => (countdownToTime = v)"
            @update:countdownTitle="(v) => (countdownTitle = v)"
          />
        </template>

        <!-- QOTD content -->
        <template v-else-if="contentType === 'qotd'">
          <div class="qotd-section">
            <textarea
              v-model="qotd"
              class="content-textarea"
              placeholder="Question of the day..."
            />
            <QotdGenerator v-model:question="qotd" v-model:location="qotdLocation" />
          </div>
        </template>

        <!-- Text content -->
        <template v-else-if="contentType === 'text'">
          <textarea
            v-model="centerText"
            class="content-textarea"
            placeholder="Center text..."
          />
        </template>

        <!-- Advanced override -->
        <details class="advanced-details">
          <summary class="advanced-summary">Advanced</summary>
          <div class="mode-selector">
            <label>
              <input type="radio" :checked="mainContentState === 'qotd'" @change="mainContentState = 'qotd'" />
              QOTD
            </label>
            <label>
              <input type="radio" :checked="mainContentState === 'timer'" @change="mainContentState = 'timer'" />
              Timer
            </label>
            <label>
              <input type="radio" :checked="mainContentState === 'text'" @change="mainContentState = 'text'" />
              Text
            </label>
          </div>
        </details>
      </div>

      <!-- Notes -->
      <div class="sidebar-section">
        <div class="section-label">Notes</div>
        <NotesEditor
          :topLeft="topLeftNotes"
          :topRight="topRightNotes"
          :bottomLeft="bottomLeftNotes"
          :bottomRight="bottomRightNotes"
          @update:topLeft="(v) => (topLeftNotes = v)"
          @update:topRight="(v) => (topRightNotes = v)"
          @update:bottomLeft="(v) => (bottomLeftNotes = v)"
          @update:bottomRight="(v) => (bottomRightNotes = v)"
        />
      </div>

      <!-- Decoration (collapsed by default) -->
      <div class="sidebar-section">
        <details>
          <summary class="section-label decoration-summary">Decoration</summary>
          <div class="decoration-grid">
            <div class="deco-field">
              <label class="corner-label">Top left</label>
              <input v-model="topLeftText" class="deco-input" placeholder=":time:" />
            </div>
            <div class="deco-field">
              <label class="corner-label">Top right</label>
              <input v-model="topRightText" class="deco-input" placeholder="UBC AI Safety" />
            </div>
            <div class="deco-field">
              <label class="corner-label">Bottom left</label>
              <input v-model="bottomLeftText" class="deco-input" />
            </div>
            <div class="deco-field">
              <label class="corner-label">Bottom right</label>
              <input v-model="bottomRightText" class="deco-input" />
            </div>
          </div>
          <p class="deco-hint">Use <code>:time:</code> for a live clock.</p>
        </details>
      </div>

      <!-- Reset -->
      <div class="sidebar-section sidebar-footer">
        <button
          :class="['btn-reset', { confirming: resetPending }]"
          @click="handleReset"
        >
          {{ resetPending ? "Click again to confirm" : "Reset" }}
        </button>
      </div>
    </div>

    <!-- Preview -->
    <div class="preview-area" ref="previewContainer">
      <div class="preview-outer" :style="previewOuterStyle">
        <div class="preview-inner" :style="previewInnerStyle">
          <SessionBoardDisplay
            :topLeftText="topLeftText"
            :topRightText="topRightText"
            :bottomLeftText="bottomLeftText"
            :bottomRightText="bottomRightText"
            :mainContentState="mainContentState"
            :qotd="qotd"
            :countdownTitle="countdownTitle"
            :countdownToTime="countdownToTime"
            :centerText="centerText"
            :topLeftNotes="topLeftNotes"
            :topRightNotes="topRightNotes"
            :bottomLeftNotes="bottomLeftNotes"
            :bottomRightNotes="bottomRightNotes"
            :playJingleOnEnd="false"
          >
            <template #grain><slot name="grain" /></template>
            <template #light><slot name="light" /></template>
          </SessionBoardDisplay>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.facilitator-panel {
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
  justify-content: space-between;
}

.tool-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgb(var(--theme-text));
}

.header-actions {
  display: flex;
  gap: 0.25rem;
}

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

.keyboard-hint {
  font-size: 0.65rem;
  color: rgba(var(--theme-text), 0.3);
  margin-top: 0.4rem;
}

/* ── Content section ─────────────────────────────────── */
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
  min-height: 5rem;
  outline: none;
  white-space: pre-wrap;
  line-height: 1.4;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(var(--theme-text), 0.25);
  }

  &:focus {
    border-color: rgba(var(--theme-accent), 0.5);
  }
}

.qotd-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.advanced-details {
  margin-top: 0.6rem;
}

.advanced-summary {
  font-size: 0.65rem;
  color: rgba(var(--theme-text), 0.35);
  cursor: pointer;
  user-select: none;

  &:hover {
    color: rgba(var(--theme-text), 0.6);
  }
}

.mode-selector {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    color: rgb(var(--theme-text));
    cursor: pointer;
  }
}

/* ── Decoration ───────────────────────────────────────── */
.decoration-summary {
  cursor: pointer;
  user-select: none;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }
}

.decoration-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.deco-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.corner-label {
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(var(--theme-text), 0.35);
}

.deco-input {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.8rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(var(--theme-text), 0.12);
  color: rgb(var(--theme-text));
  padding: 0.2rem 0;
  outline: none;
  width: 100%;

  &::placeholder {
    color: rgba(var(--theme-text), 0.2);
  }

  &:focus {
    border-bottom-color: rgba(var(--theme-accent), 0.5);
  }
}

.deco-hint {
  font-size: 0.65rem;
  color: rgba(var(--theme-text), 0.3);
  margin-top: 0.5rem;
  margin-bottom: 0;

  code {
    font-family: "IBM Plex Mono", monospace;
    background: rgba(var(--theme-text), 0.08);
    padding: 0.1em 0.3em;
    border-radius: 0.2rem;
  }
}

/* ── Reset ────────────────────────────────────────────── */
.sidebar-footer {
  margin-top: auto;
  border-bottom: none;
}

.btn-reset {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.75rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(var(--theme-text), 0.18);
  background: transparent;
  color: rgba(var(--theme-text), 0.5);
  cursor: pointer;
  transition:
    background 0.1s,
    color 0.1s,
    border-color 0.1s;

  &:hover {
    background: rgba(var(--theme-text), 0.06);
    color: rgb(var(--theme-text));
  }

  &.confirming {
    border-color: rgba(var(--theme-accent), 0.6);
    color: rgb(var(--theme-accent));
    background: rgba(var(--theme-accent), 0.08);
  }
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
  background: #f6f2ee;
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.preview-inner {
  position: absolute;
  top: 0;
  left: 0;
  background: #f6f2ee;
  font-family: "InterVariable", system-ui, sans-serif;
}
</style>
