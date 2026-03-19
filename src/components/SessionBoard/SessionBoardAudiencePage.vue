<script setup lang="ts">
import { computed } from "vue";
import { shouldPlayTimerEndJingle } from "@/lib/sessionBoardUiState.js";
import SessionBoardDisplay from "./SessionBoardDisplay.vue";
import { useDisplaySync } from "./useBroadcastSync";

const { displayState } = useDisplaySync();

const state = computed(
  () =>
    displayState.value ?? {
      stageIndex: 0,
      topLeftText: ":time:",
      topRightText: "",
      bottomLeftText: "",
      bottomRightText: "",
      mainContentState: "qotd" as const,
      qotd: "",
      qotdLocation: "",
      countdownTitle: "",
      countdownToTime: { hour: 13, minute: 20 },
      centerText: "",
      topLeftNotes: "",
      topRightNotes: "",
      bottomLeftNotes: "",
      bottomRightNotes: "",
    }
);

const playJingleOnEnd = computed(() =>
  shouldPlayTimerEndJingle({
    mainContentState: state.value.mainContentState,
    role: "audience",
  })
);
</script>

<template>
  <SessionBoardDisplay
    :topLeftText="state.topLeftText"
    :topRightText="state.topRightText"
    :bottomLeftText="state.bottomLeftText"
    :bottomRightText="state.bottomRightText"
    :mainContentState="state.mainContentState"
    :qotd="state.qotd"
    :countdownTitle="state.countdownTitle"
    :countdownToTime="state.countdownToTime"
    :centerText="state.centerText"
    :topLeftNotes="state.topLeftNotes"
    :topRightNotes="state.topRightNotes"
    :bottomLeftNotes="state.bottomLeftNotes"
    :bottomRightNotes="state.bottomRightNotes"
    :playJingleOnEnd="playJingleOnEnd"
  >
    <template #grain><slot name="grain" /></template>
    <template #light><slot name="light" /></template>
  </SessionBoardDisplay>
</template>
