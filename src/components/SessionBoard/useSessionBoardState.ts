import { useUrlSearchParams } from "@vueuse/core";
import { computed, type WritableComputedRef } from "vue";

const rawParams = useUrlSearchParams<{
  stageIndex?: string;
  topLeftText?: string;
  topRightText?: string;
  bottomLeftText?: string;
  bottomRightText?: string;
  mainContentState?: "timer" | "text" | "qotd";
  qotd?: string;
  qotdLocation?: string;
  countdownTitle?: string;
  countdownToTime?: string;
  centerText?: string;
  topLeftNotes?: string;
  topRightNotes?: string;
  bottomLeftNotes?: string;
  bottomRightNotes?: string;
}>("hash-params", {
  writeMode: "push",
});

export const isParamsEmpty = computed(() => Object.keys(rawParams).length === 0);

function paramToRef<Key extends keyof typeof rawParams>(
  key: Key,
  config: NonNullable<(typeof rawParams)[Key]>
): WritableComputedRef<
  NonNullable<(typeof rawParams)[Key]>,
  (typeof rawParams)[Key]
>;
function paramToRef<Key extends keyof typeof rawParams>(
  key: Key
): WritableComputedRef<(typeof rawParams)[Key] | undefined>;
function paramToRef<Key extends keyof typeof rawParams, Cooked>(
  key: Key,
  config: {
    default: Cooked;
    fromRaw: (
      rawValue: (typeof rawParams)[Key] | undefined
    ) => Cooked | undefined;
    toRaw?: (value: Cooked | undefined) => (typeof rawParams)[Key] | undefined;
  }
): WritableComputedRef<Cooked, Cooked | undefined>;
function paramToRef<
  Key extends keyof typeof rawParams,
  Cooked = (typeof rawParams)[Key],
>(
  key: Key,
  config?:
    | (typeof rawParams)[Key]
    | {
        default?: Cooked;
        fromRaw: (
          rawValue: (typeof rawParams)[Key] | undefined
        ) => Cooked | undefined;
        toRaw?: (
          value: Cooked | undefined
        ) => (typeof rawParams)[Key] | undefined;
      }
) {
  return computed({
    get() {
      if (typeof config === "object") {
        if (rawParams[key] === undefined) {
          return config.default;
        }
        return config?.fromRaw?.(rawParams[key]) ?? config?.default;
      }
      return rawParams[key] ?? config;
    },
    set(value) {
      if (typeof config === "object") {
        if (value === config.default) {
          rawParams[key] = undefined;
          return;
        }
      } else if (value === config) {
        rawParams[key] = undefined;
        return;
      }
      // @ts-ignore
      rawParams[key] = config?.toRaw?.(value) ?? String(value);
    },
  });
}

export const stageIndex = paramToRef("stageIndex", {
  default: 0,
  fromRaw: (v) => (v !== undefined ? parseInt(v, 10) : undefined),
  toRaw: (v) => (v !== undefined ? String(v) : undefined),
});

export const topLeftText = paramToRef("topLeftText", ":time:");
export const topRightText = paramToRef("topRightText", "");
export const bottomLeftText = paramToRef("bottomLeftText", "");
export const bottomRightText = paramToRef("bottomRightText", "");

export const mainContentState = paramToRef("mainContentState", "qotd");

export const qotd = paramToRef("qotd", "");
export const qotdLocation = paramToRef(
  "qotdLocation",
  "UBC, Vancouver, BC, Canada"
);

export const countdownTitle = paramToRef("countdownTitle", "Break Starts");
export const countdownToTime = paramToRef("countdownToTime", {
  default: { hour: 13, minute: 20 },
  fromRaw(rawValue) {
    if (!rawValue) return undefined;
    const [hour, minute] = rawValue.split(":").map((part) => {
      const num = Number(part);
      return isNaN(num) ? 0 : num;
    });
    return { hour, minute };
  },
  toRaw(value) {
    if (!value) return undefined;
    let hour = value.hour;
    let minute = value.minute;
    const extraMinutes = minute - 60;
    if (extraMinutes >= 0) {
      hour += Math.floor(extraMinutes / 60);
      minute = extraMinutes % 60;
    }
    return `${hour}:${String(minute).padStart(2, "0")}`;
  },
});

export const centerText = paramToRef("centerText", "");

export const topLeftNotes = paramToRef("topLeftNotes", "");
export const topRightNotes = paramToRef("topRightNotes", "");
export const bottomLeftNotes = paramToRef("bottomLeftNotes", "");
export const bottomRightNotes = paramToRef("bottomRightNotes", "");

export function reset() {
  for (const key of Object.keys(rawParams)) {
    // @ts-ignore
    rawParams[key] = undefined;
  }
}

export const state = computed(() => ({
  stageIndex: stageIndex.value,
  topLeftText: topLeftText.value,
  topRightText: topRightText.value,
  bottomLeftText: bottomLeftText.value,
  bottomRightText: bottomRightText.value,
  mainContentState: mainContentState.value,
  qotd: qotd.value,
  qotdLocation: qotdLocation.value,
  countdownTitle: countdownTitle.value,
  countdownToTime: countdownToTime.value,
  centerText: centerText.value,
  topLeftNotes: topLeftNotes.value,
  topRightNotes: topRightNotes.value,
  bottomLeftNotes: bottomLeftNotes.value,
  bottomRightNotes: bottomRightNotes.value,
}));

export type SessionState = typeof state.value;
