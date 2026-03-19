<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import debateConfig from "@/data/debate-config.json";
import DebateDisplay from "./DebateDisplay.vue";
import DebateExplainer from "./DebateExplainer.vue";
import { useDisplaySync, type DebateState } from "./useDebateBroadcastSync";

const DEFAULT_STATE: DebateState = {
  audienceMode: "debate",
  prompts: [{ text: "", subtitle: "" }],
  currentPromptIndex: 0,
  currentPhaseIndex: -1,
  timerState: "idle",
  timeRemaining: 0,
  isLightTheme: false,
  phases: (debateConfig.phases as Array<Record<string, unknown>>).map((p) => ({
    name: typeof p.name === "string" ? p.name : "",
    short: typeof p.short === "string" ? p.short : typeof p.name === "string" ? p.name : "",
    duration: typeof p.duration === "number" ? p.duration : 0,
    side:
      p.side === "agree" || p.side === "disagree"
        ? (p.side as "agree" | "disagree")
        : undefined,
  })),
};

const { displayState } = useDisplaySync();
const effectiveState = computed(() => displayState.value ?? DEFAULT_STATE);

// ── Cursor auto-hide ──────────────────────────────────────
const isCursorVisible = ref(true);
const CURSOR_TIMEOUT = 5_000;

onMounted(() => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  window.addEventListener("pointermove", () => {
    if (timeout) clearTimeout(timeout);
    isCursorVisible.value = true;
    timeout = setTimeout(() => {
      isCursorVisible.value = false;
    }, CURSOR_TIMEOUT);
  });
});

// ── Screen wake lock ──────────────────────────────────────
onMounted(() => {
  let screenLock: WakeLockSentinel | undefined;
  let retryInterval: ReturnType<typeof setInterval>;

  retryInterval = setInterval(async () => {
    if (screenLock && !screenLock.released) return;
    if (document.hidden) return;
    try {
      screenLock = await navigator.wakeLock.request("screen");
    } catch {}
  }, 10_000);

  onUnmounted(async () => {
    clearInterval(retryInterval);
    await screenLock?.release();
    screenLock = undefined;
  });
});
</script>

<template>
  <div
    class="audience-wrapper"
    :style="{ cursor: isCursorVisible ? 'auto' : 'none' }"
  >
    <DebateExplainer
      v-if="effectiveState.audienceMode === 'explainer'"
      :phases="effectiveState.phases"
      :isLightTheme="effectiveState.isLightTheme"
    />
    <DebateDisplay
      v-else
      :prompts="effectiveState.prompts"
      :currentPromptIndex="effectiveState.currentPromptIndex"
      :phases="effectiveState.phases"
      :currentPhaseIndex="effectiveState.currentPhaseIndex"
      :timerState="effectiveState.timerState"
      :timeRemaining="effectiveState.timeRemaining"
      :isLightTheme="effectiveState.isLightTheme"
    />
  </div>
</template>

<style scoped>
.audience-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
