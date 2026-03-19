<script setup lang="ts">
import logo from "@/assets/images/session-board/logo.png?url";
import { onMounted, onUnmounted, ref } from "vue";
import CountDownText from "./CountDownText.vue";
import Lines from "./Lines.vue";
import Pill from "./Pill.vue";

const props = withDefaults(
  defineProps<{
    topLeftText?: string;
    topRightText?: string;
    bottomLeftText?: string;
    bottomRightText?: string;
    mainContentState?: "qotd" | "timer" | "text";
    qotd?: string;
    countdownTitle?: string;
    countdownToTime?: { hour: number; minute: number };
    centerText?: string;
    topLeftNotes?: string;
    topRightNotes?: string;
    bottomLeftNotes?: string;
    bottomRightNotes?: string;
    playJingleOnEnd?: boolean;
  }>(),
  {
    topLeftText: "",
    topRightText: "",
    bottomLeftText: "",
    bottomRightText: "",
    mainContentState: "qotd",
    qotd: "",
    countdownTitle: "",
    countdownToTime: () => ({ hour: 13, minute: 20 }),
    centerText: "",
    topLeftNotes: "",
    topRightNotes: "",
    bottomLeftNotes: "",
    bottomRightNotes: "",
    playJingleOnEnd: false,
  }
);

// Cursor auto-hide
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

// Screen wake lock
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
  <div :class="['session-board-content', { 'no-cursor': !isCursorVisible }]">
    <Lines />

    <Pill position="top-left" :text="props.topLeftText" />
    <Pill position="top-right" :text="props.topRightText" />
    <Pill position="bottom-left" :text="props.bottomLeftText" />
    <Pill position="bottom-right" :text="props.bottomRightText" />

    <div class="logo-container">
      <div class="logo-wrapper">
        <img class="logo" :src="logo" alt="" aria-hidden="true" />
      </div>
    </div>

    <div class="grain-container">
      <slot name="grain" />
    </div>
    <div class="light-container">
      <slot name="light" />
    </div>

    <div class="main-content">
      <div class="qotd" v-if="props.mainContentState === 'qotd'">
        <h1>QUESTION OF THE DAY</h1>
        <p>{{ props.qotd }}</p>
      </div>
      <div class="timer" v-else-if="props.mainContentState === 'timer'">
        <h1>{{ props.countdownTitle }}</h1>
        <div class="countdown">
          <span class="tnum">
            <CountDownText
              :hour="props.countdownToTime.hour"
              :minute="props.countdownToTime.minute"
              :playJingleOnEnd="props.playJingleOnEnd"
            />
          </span>
        </div>
        <div class="countdown-to">
          at
          <span class="tnum"
            >{{ props.countdownToTime.hour % 12 || 12 }}:{{
              props.countdownToTime.minute.toString().padStart(2, "0")
            }}</span
          >
        </div>
      </div>
      <div class="text" v-else-if="props.mainContentState === 'text'">
        <p>{{ props.centerText }}</p>
      </div>
    </div>

    <div class="notes">
      <div
        v-if="props.topLeftNotes"
        class="note top left"
      >{{ props.topLeftNotes }}</div>
      <div
        v-if="props.topRightNotes"
        class="note top right"
      >{{ props.topRightNotes }}</div>
      <div
        v-if="props.bottomLeftNotes"
        class="note bottom left"
      >{{ props.bottomLeftNotes }}</div>
      <div
        v-if="props.bottomRightNotes"
        class="note bottom right"
      >{{ props.bottomRightNotes }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.session-board-content {
  position: relative;
  height: 100%;

  &.no-cursor {
    cursor: none;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #202020ff;
    font-weight: 500;
  }

  p,
  ol {
    margin: 0;
    font-size: 2.5rem;
    color: #000;
    letter-spacing: -0.02em;
    font-weight: 400;
  }

  .tnum {
    font-feature-settings: "tnum";
  }

  .main-content {
    height: 100%;
    text-align: center;
    align-content: center;

    h1 {
      margin-bottom: 3rem;
    }

    .qotd,
    .text {
      p {
        white-space: pre-wrap;
      }
    }

    & > div:not(.text) {
      margin-top: -5rem;
    }

    .countdown {
      font-size: 7rem;
      font-weight: 600;
      color: #202020ff;
    }

    .countdown-to {
      margin-top: 1rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: rgba(68, 68, 68, 0.25);
    }
  }

  .notes {
    .note {
      position: absolute;
      white-space: pre-wrap;
      font-size: 1.7rem;
      font-weight: 500;
      color: rgba(68, 68, 68, 0.25);
      text-box: trim-both cap alphabetic;
    }

    .top {
      top: 5rem;
    }

    .bottom {
      bottom: 4rem;
    }

    .left {
      left: 4rem;
    }

    .right {
      right: 4rem;
    }
  }

  .grain-container,
  .light-container {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;

    :deep(img) {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .light-container {
    mix-blend-mode: exclusion;
    opacity: 0.9;

    :deep(img) {
      object-position: left top;
    }
  }

  .grain-container {
    mix-blend-mode: soft-light;

    :deep(img) {
      object-position: center;
      mix-blend-mode: soft-light;
    }
  }

  .logo-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;

    .logo-wrapper {
      position: relative;
      width: fit-content;
      margin: 0 auto;

      .logo {
        display: block;
        height: 5rem;
      }

      &::after {
        content: "";
        position: absolute;
        inset: -1rem;
        z-index: -1;
        background: radial-gradient(#f6f2ee 60%, transparent);
      }
    }
  }
}
</style>
