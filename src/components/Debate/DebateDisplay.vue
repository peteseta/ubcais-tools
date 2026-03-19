<script setup lang="ts">
import { computed } from "vue";
import { formatPhaseTime } from "@/lib/spectrumTimer.js";

type Phase = { name: string; short?: string; duration: number; side?: "disagree" | "agree" };
type Prompt = { text: string; subtitle: string };

const props = defineProps<{
  prompts: Prompt[];
  currentPromptIndex: number;
  phases: Phase[];
  currentPhaseIndex: number;
  timerState: "idle" | "running" | "stopped" | "finished";
  timeRemaining: number;
  isLightTheme: boolean;
}>();

const currentPrompt = computed(
  () => props.prompts[props.currentPromptIndex] ?? { text: "", subtitle: "" }
);

const timerText = computed(() => {
  if (props.currentPhaseIndex < 0) return "00:00";
  const phase = props.phases[props.currentPhaseIndex];
  if (!phase) return "00:00";
  if (phase.duration === 0) return "—";
  return formatPhaseTime(props.timeRemaining);
});

const isWarning = computed(
  () =>
    props.timeRemaining <= 10 &&
    props.timerState === "running" &&
    props.currentPhaseIndex >= 0
);

const activeSide = computed(() => {
  if (props.currentPhaseIndex < 0) return null;
  return props.phases[props.currentPhaseIndex]?.side ?? null;
});

const sideIndicatorText = computed(() => {
  if (!activeSide.value) return "";
  return activeSide.value === "disagree" ? "DISAGREE SPEAKS" : "AGREE SPEAKS";
});

const getStepClasses = (i: number) => ({
  "phase-step": true,
  "side-disagree": props.phases[i]?.side === "disagree",
  "side-agree": props.phases[i]?.side === "agree",
  done: i < props.currentPhaseIndex,
  active: i === props.currentPhaseIndex,
});

const getStepLabel = (i: number) => {
  const phase = props.phases[i];
  if (!phase) return "";
  return i === props.currentPhaseIndex ? phase.name : (phase.short ?? phase.name);
};

const getStepDur = (phase: Phase) => {
  if (phase.duration === 0) return "—";
  return formatPhaseTime(phase.duration);
};
</script>

<template>
  <div
    :class="[
      'debate-display',
      { 'theme-light': isLightTheme },
      activeSide === 'disagree' ? 'disagree-active' : '',
      activeSide === 'agree' ? 'agree-active' : '',
    ]"
  >
    <div :class="['side-label', 'left', { highlight: activeSide === 'disagree' }]">DISAGREE</div>
    <div :class="['side-label', 'right', { highlight: activeSide === 'agree' }]">AGREE</div>

    <div class="display-content">
      <div class="phase-stepper">
        <div v-for="(phase, i) in phases" :key="i" :class="getStepClasses(i)">
          <div class="step-dot"></div>
          <div class="step-label">{{ getStepLabel(i) }}</div>
          <div class="step-dur">{{ getStepDur(phase) }}</div>
        </div>
      </div>

      <div class="prompt-display">
        <div class="current-prompt">{{ currentPrompt.text }}</div>
        <div v-if="currentPrompt.subtitle" class="current-subtitle">
          {{ currentPrompt.subtitle }}
        </div>
      </div>

      <div class="timer-container">
        <div :class="['timer-display', { warning: isWarning }]">{{ timerText }}</div>
        <div v-if="activeSide" :class="['side-indicator', activeSide]">
          {{ sideIndicatorText }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$disagree-color: #dc2626;
$agree-color: #16a34a;

.debate-display {
  --theme-bg: 17, 17, 17;
  --theme-surface: 34, 34, 34;
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

  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgb(var(--theme-bg));
  color: rgb(var(--theme-text));
  font-family: "IBM Plex Sans", sans-serif;
  overflow: hidden;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3px;
    transition: opacity 0.4s ease;
  }

  &::before {
    left: 0;
    background: $disagree-color;
    opacity: 0.18;
  }

  &::after {
    right: 0;
    background: $agree-color;
    opacity: 0.18;
  }

  &.disagree-active::before {
    opacity: 0.7;
  }

  &.agree-active::after {
    opacity: 0.7;
  }
}

.side-label {
  position: absolute;
  font-size: 3.5rem;
  font-weight: 800;
  font-family: "IBM Plex Sans", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transition:
    opacity 0.4s ease,
    font-size 0.3s ease;
  user-select: none;

  &.left {
    left: 1.25rem;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    color: $disagree-color;
    opacity: 0.2;

    &.highlight {
      opacity: 0.85;
      font-size: 4rem;
    }
  }

  &.right {
    right: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    color: $agree-color;
    opacity: 0.2;

    &.highlight {
      opacity: 0.85;
      font-size: 4rem;
    }
  }
}

.display-content {
  width: 100%;
  max-width: 800px;
  padding: 2rem 5rem 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

.phase-stepper {
  width: 100%;
  display: flex;
  align-items: flex-start;
}

.phase-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  position: relative;

  &:not(:first-child)::before {
    content: "";
    position: absolute;
    top: 0.3rem;
    right: 50%;
    width: 100%;
    height: 1px;
    background: rgba(var(--theme-text), 0.08);
    z-index: 0;
    transition: background 0.4s;
  }

  &.done:not(:first-child)::before,
  &.active:not(:first-child)::before {
    background: rgba(var(--theme-accent), 0.25);
  }

  .step-dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: rgba(var(--theme-text), 0.12);
    z-index: 1;
    position: relative;
    flex-shrink: 0;
    transition:
      background 0.3s,
      box-shadow 0.3s;
  }

  .step-label {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.65rem;
    letter-spacing: 0.04em;
    color: rgba(var(--theme-text), 0.25);
    text-align: center;
    line-height: 1.2;
    transition: color 0.3s;
  }

  .step-dur {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.58rem;
    color: rgba(var(--theme-text), 0.12);
    text-align: center;
    transition: color 0.3s;
  }

  &.active {
    .step-dot {
      background: rgb(var(--theme-accent));
      box-shadow: 0 0 0 4px rgba(var(--theme-accent), 0.15);
    }

    .step-label {
      color: rgb(var(--theme-accent));
      font-size: 0.72rem;
      font-weight: 600;
    }

    .step-dur {
      color: rgb(var(--theme-accent));
    }
  }

  &.done {
    .step-dot {
      background: rgba(var(--theme-text), 0.2);
    }

    .step-label,
    .step-dur {
      color: rgba(var(--theme-text), 0.2);
    }
  }

  &.side-disagree.active {
    .step-dot {
      background: $disagree-color;
      box-shadow: 0 0 0 4px rgba($disagree-color, 0.15);
    }

    .step-label,
    .step-dur {
      color: $disagree-color;
    }
  }

  &.side-agree.active {
    .step-dot {
      background: $agree-color;
      box-shadow: 0 0 0 4px rgba($agree-color, 0.15);
    }

    .step-label,
    .step-dur {
      color: $agree-color;
    }
  }
}

.prompt-display {
  width: 100%;
}

.current-prompt {
  font-size: 2.5rem;
  font-weight: 400;
  font-family: "IBM Plex Serif", serif;
  font-style: italic;
  text-align: center;
  text-wrap: balance;
  color: rgb(var(--theme-text));
  line-height: 1.1;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-subtitle {
  font-size: 1rem;
  font-family: "IBM Plex Sans", sans-serif;
  text-align: center;
  text-wrap: balance;
  color: rgba(var(--theme-text), 0.38);
  line-height: 1.55;
  margin-top: 2.5rem;
}

.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.timer-display {
  font-size: 7rem;
  font-weight: 300;
  text-align: center;
  color: rgb(var(--theme-text));
  font-family: "IBM Plex Mono", monospace;
  line-height: 1;
  letter-spacing: -0.02em;

  &.warning {
    color: rgb(var(--theme-accent));
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

.side-indicator {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-align: center;
  padding: 0.35rem 1.1rem;
  border-radius: 2rem;
  color: white;
  text-transform: uppercase;

  &.disagree {
    background: $disagree-color;
  }

  &.agree {
    background: $agree-color;
  }
}
</style>
