import { type ComputedRef, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

const CHANNEL_NAME = "debate";

export interface DebateState {
  audienceMode: "explainer" | "debate";
  prompts: Array<{ text: string; subtitle: string }>;
  currentPromptIndex: number;
  currentPhaseIndex: number;
  timerState: "idle" | "running" | "stopped" | "finished";
  timeRemaining: number;
  isLightTheme: boolean;
}

type Message =
  | { type: "STATE_UPDATE"; state: DebateState }
  | { type: "REQUEST_STATE" };

export function useFacilitatorSync(state: ComputedRef<DebateState>) {
  let channel: BroadcastChannel | null = null;

  onMounted(() => {
    channel = new BroadcastChannel(CHANNEL_NAME);

    channel.addEventListener("message", (event: MessageEvent<Message>) => {
      if (event.data.type === "REQUEST_STATE") {
        channel?.postMessage({ type: "STATE_UPDATE", state: state.value });
      }
    });

    watch(
      state,
      (newState) => {
        nextTick(() => {
          channel?.postMessage({ type: "STATE_UPDATE", state: newState });
        });
      },
      { deep: true }
    );

    // Post initial state
    nextTick(() => {
      channel?.postMessage({ type: "STATE_UPDATE", state: state.value });
    });
  });

  onUnmounted(() => {
    channel?.close();
    channel = null;
  });
}

export function useDisplaySync() {
  const displayState = ref<DebateState | null>(null);
  let channel: BroadcastChannel | null = null;
  let requestAttempts = 0;
  let requestInterval: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    channel = new BroadcastChannel(CHANNEL_NAME);

    channel.addEventListener("message", (event: MessageEvent<Message>) => {
      if (event.data.type === "STATE_UPDATE") {
        displayState.value = event.data.state;
        if (requestInterval) {
          clearInterval(requestInterval);
          requestInterval = null;
        }
      }
    });

    const request = () => {
      if (requestAttempts >= 5) {
        if (requestInterval) clearInterval(requestInterval);
        return;
      }
      channel?.postMessage({ type: "REQUEST_STATE" });
      requestAttempts++;
    };

    request();
    requestInterval = setInterval(request, 2000);
  });

  onUnmounted(() => {
    channel?.close();
    channel = null;
    if (requestInterval) clearInterval(requestInterval);
  });

  return { displayState };
}
