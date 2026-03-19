import { type ComputedRef, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { SessionState } from "./useSessionBoardState";

const CHANNEL_NAME = "session-board";

type Message =
  | { type: "STATE_UPDATE"; state: SessionState }
  | { type: "REQUEST_STATE" };

export function useFacilitatorSync(state: ComputedRef<SessionState>) {
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
  const displayState = ref<SessionState | null>(null);
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
