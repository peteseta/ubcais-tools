<script setup lang="ts">
import { formatPhaseTime } from "@/lib/spectrumTimer.js";

type Phase = { name: string; short?: string; duration: number; side?: "disagree" | "agree" };

const props = defineProps<{
  phases: Phase[];
  currentPhaseIndex: number;
  timerState: "idle" | "running" | "stopped" | "finished";
}>();

const emit = defineEmits<{
  jump: [index: number];
}>();

const getDotStyle = (phase: Phase) => {
  if (phase.side === "disagree") return { background: "#dc2626" };
  if (phase.side === "agree") return { background: "#16a34a" };
  return {};
};

const formatDur = (duration: number) => {
  if (duration === 0) return "—";
  return formatPhaseTime(duration);
};
</script>

<template>
  <div class="phase-stepper-list">
    <button
      v-for="(phase, i) in phases"
      :key="i"
      :class="[
        'phase-row',
        { active: i === currentPhaseIndex, done: i < currentPhaseIndex },
      ]"
      @click="emit('jump', i)"
    >
      <div class="phase-dot" :style="getDotStyle(phase)"></div>
      <div class="phase-info">
        <span class="phase-name">{{ phase.name }}</span>
        <span class="phase-dur">{{ formatDur(phase.duration) }}</span>
      </div>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.phase-stepper-list {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.phase-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.1s;
  font-family: "IBM Plex Sans", sans-serif;
  color: rgba(var(--theme-text), 0.45);

  &:hover {
    background: rgba(var(--theme-text), 0.05);
    color: rgba(var(--theme-text), 0.7);
  }

  &.active {
    background: rgba(var(--theme-accent), 0.08);
    color: rgb(var(--theme-text));

    .phase-dot {
      box-shadow: 0 0 0 3px rgba(var(--theme-accent), 0.2);
    }
  }

  &.done {
    opacity: 0.45;
  }
}

.phase-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(var(--theme-accent), 0.5);
  transition: box-shadow 0.2s;
}

.phase-info {
  display: flex;
  flex: 1;
  align-items: baseline;
  gap: 0.4rem;
  justify-content: space-between;
}

.phase-name {
  font-size: 0.8rem;
  font-weight: 500;
}

.phase-dur {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.65rem;
  opacity: 0.6;
  flex-shrink: 0;
}
</style>
