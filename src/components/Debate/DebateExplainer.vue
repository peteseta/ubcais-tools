<script setup lang="ts">
type Phase = { name: string; short?: string; duration: number; side?: "disagree" | "agree" };

const props = defineProps<{
  phases: Phase[];
  isLightTheme: boolean;
}>();

const formatTime = (seconds: number) => {
  if (seconds === 0) return "—";
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};
</script>

<template>
  <div :class="['debate-explainer', { 'theme-light': isLightTheme }]">
    <h1 class="explainer-title">
      <span>How it works</span>
    </h1>

    <!-- Room Layout -->
    <section class="exp-section">
      <h2 class="exp-label">Room Layout</h2>
      <div class="room-diagram">
        <div class="room-side room-disagree">
          <span class="room-side-label">Disagree</span>
        </div>
        <div class="room-aisle"></div>
        <div class="room-side room-agree">
          <span class="room-side-label">Agree</span>
        </div>
      </div>
      <p class="room-hint">Stand on the side that matches your view. Move if you change your mind.</p>
    </section>

    <!-- Screen Preview -->
    <section class="exp-section">
      <h2 class="exp-label">On Screen</h2>
      <div class="screen-preview">
        <div class="sp-side sp-left">DISAGREE</div>
        <div class="sp-center">
          <div class="sp-stepper">
            <div class="sp-dot"></div>
            <div class="sp-line"></div>
            <div class="sp-dot sp-dot-active"></div>
            <div class="sp-line"></div>
            <div class="sp-dot"></div>
            <div class="sp-line"></div>
            <div class="sp-dot"></div>
          </div>
          <div class="sp-prompt-block">
            <div class="sp-prompt-line sp-line-long"></div>
            <div class="sp-prompt-line sp-line-med"></div>
          </div>
          <div class="sp-timer">00:00</div>
        </div>
        <div class="sp-side sp-right">AGREE</div>
      </div>
    </section>

    <!-- Debate Format -->
    <section class="exp-section">
      <h2 class="exp-label">Debate Format</h2>
      <div class="phase-stepper explainer-stepper">
        <div
          v-for="(phase, i) in phases"
          :key="i"
          :class="['phase-step', phase.side ? `side-${phase.side}` : '']"
        >
          <div class="step-dot"></div>
          <div class="step-label">{{ phase.short ?? phase.name }}</div>
          <div class="step-dur">{{ formatTime(phase.duration) }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
$disagree-color: #dc2626;
$agree-color: #16a34a;

.debate-explainer {
  --theme-bg: 17, 17, 17;
  --theme-surface: 34, 34, 34;
  --theme-text: 249, 249, 249;
  --theme-accent: 204, 65, 37;

  &.theme-light {
    --theme-bg: 247, 244, 236;
    --theme-surface: 255, 250, 242;
    --theme-text: 44, 37, 31;
    --theme-accent: 163, 78, 48;
  }

  width: 100%;
  height: 100%;
  background: rgb(var(--theme-bg));
  color: rgb(var(--theme-text));
  font-family: "IBM Plex Sans", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  padding: 3rem 4rem 4rem;
  overflow-y: auto;
  box-sizing: border-box;
}

.explainer-title {
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(var(--theme-text), 0.3);
  text-align: center;
  margin: 0;

  span {
    display: block;
    font-family: "IBM Plex Serif", serif;
    font-style: italic;
    font-size: 2.4rem;
    font-weight: 400;
    letter-spacing: -0.01em;
    text-transform: none;
    color: rgb(var(--theme-text));
    margin-top: 0.2rem;
  }
}

.exp-section {
  width: 100%;
  max-width: 860px;
}

.exp-label {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgb(var(--theme-accent));
  opacity: 0.6;
  margin-bottom: 0.75rem;
  margin-top: 0;
}

.room-diagram {
  display: flex;
  align-items: stretch;
  height: 6rem;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.6rem;
}

.room-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-disagree {
  background: rgba($disagree-color, 0.08);
  border: 1px solid rgba($disagree-color, 0.2);
  border-right: none;
  border-radius: 0.25rem 0 0 0.25rem;
}

.room-agree {
  background: rgba($agree-color, 0.06);
  border: 1px solid rgba($agree-color, 0.16);
  border-left: none;
  border-radius: 0 0.25rem 0.25rem 0;
}

.room-aisle {
  width: 1px;
  background: rgba(var(--theme-text), 0.06);
  border-left: 1px dashed rgba(var(--theme-text), 0.1);
  flex-shrink: 0;
}

.room-side-label {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;

  .room-disagree & {
    color: $disagree-color;
    opacity: 0.7;
  }

  .room-agree & {
    color: $agree-color;
    opacity: 0.7;
  }
}

.room-hint {
  font-size: 0.78rem;
  color: rgba(var(--theme-text), 0.28);
  margin: 0;
  font-style: italic;
}

.screen-preview {
  height: 220px;
  width: auto;
  aspect-ratio: 16 / 9;
  max-width: 100%;
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(var(--theme-text), 0.07);
  border-radius: 0.3rem;
  overflow: hidden;
  background: rgba(var(--theme-text), 0.015);
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
  }

  &::before {
    left: 0;
    background: $disagree-color;
    opacity: 0.25;
  }

  &::after {
    right: 0;
    background: $agree-color;
    opacity: 0.25;
  }
}

.sp-side {
  width: 2.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  user-select: none;
  opacity: 0.18;
}

.sp-left {
  color: $disagree-color;
  transform: rotate(180deg);
}

.sp-right {
  color: $agree-color;
}

.sp-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.4rem;
  padding: 1.5rem 3rem;
}

.sp-stepper {
  display: flex;
  align-items: center;
  gap: 0;
  opacity: 0.2;
}

.sp-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: rgba(var(--theme-text), 0.35);
  flex-shrink: 0;

  &.sp-dot-active {
    background: rgb(var(--theme-accent));
    opacity: 1;
    box-shadow: 0 0 0 3px rgba(var(--theme-accent), 0.15);
  }
}

.sp-stepper .sp-line {
  width: 3rem;
  height: 1px;
  background: rgba(var(--theme-text), 0.15);
}

.sp-prompt-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
}

.sp-prompt-line {
  height: 0.6rem;
  border-radius: 0.3rem;
  background: rgba(var(--theme-text), 0.12);

  &.sp-line-long {
    width: 72%;
  }

  &.sp-line-med {
    width: 50%;
  }
}

.sp-timer {
  font-family: "IBM Plex Mono", monospace;
  font-size: 2.8rem;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: rgba(var(--theme-text), 0.12);
  line-height: 1;
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
    top: 0.35rem;
    right: 50%;
    width: 100%;
    height: 1px;
    background: rgba(var(--theme-text), 0.08);
    z-index: 0;
  }
}

.explainer-stepper {
  pointer-events: none;

  .step-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: rgba(var(--theme-text), 0.12);
    z-index: 1;
    position: relative;
    flex-shrink: 0;
  }

  .step-label {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.72rem;
    color: rgba(var(--theme-text), 0.35);
    text-align: center;
    line-height: 1.2;
  }

  .step-dur {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.65rem;
    color: rgba(var(--theme-text), 0.2);
    text-align: center;
  }

  .phase-step.side-agree .step-dot {
    background: rgba($agree-color, 0.5);
  }

  .phase-step.side-disagree .step-dot {
    background: rgba($disagree-color, 0.5);
  }

  .phase-step.side-agree .step-label {
    color: rgba($agree-color, 0.6);
  }

  .phase-step.side-disagree .step-label {
    color: rgba($disagree-color, 0.7);
  }
}
</style>
