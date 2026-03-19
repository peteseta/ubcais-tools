<script setup lang="ts">
const props = defineProps<{
  countdownToTime: { hour: number; minute: number };
  countdownTitle: string;
}>();

const emit = defineEmits<{
  "update:countdownToTime": [value: { hour: number; minute: number }];
  "update:countdownTitle": [value: string];
}>();

function adjustMinutes(delta: number) {
  const totalMinutes =
    props.countdownToTime.hour * 60 + props.countdownToTime.minute + delta;
  const hour = Math.floor(((totalMinutes % 1440) + 1440) % 1440 / 60);
  const minute = ((totalMinutes % 60) + 60) % 60;
  emit("update:countdownToTime", { hour, minute });
}

const timeString = {
  get() {
    return `${props.countdownToTime.hour}:${String(props.countdownToTime.minute).padStart(2, "0")}`;
  },
  set(value: string) {
    const [hour, minute] = value.split(":").map(Number);
    emit("update:countdownToTime", { hour, minute });
  },
};
</script>

<template>
  <div class="timer-controls">
    <div class="timer-display tnum">
      {{ props.countdownToTime.hour % 12 || 12 }}:{{
        String(props.countdownToTime.minute).padStart(2, "0")
      }}
      <span class="ampm">{{ props.countdownToTime.hour < 12 ? "AM" : "PM" }}</span>
    </div>

    <div class="quick-adjust">
      <button @click="adjustMinutes(-15)">−15</button>
      <button @click="adjustMinutes(-5)">−5</button>
      <button @click="adjustMinutes(5)">+5</button>
      <button @click="adjustMinutes(15)">+15</button>
    </div>

    <div class="time-input-row">
      <label class="field-label">Time</label>
      <input
        type="time"
        :value="timeString.get()"
        @change="(e) => timeString.set((e.target as HTMLInputElement).value)"
        class="time-input"
      />
    </div>

    <div class="title-input-row">
      <label class="field-label">Title</label>
      <input
        type="text"
        :value="props.countdownTitle"
        @input="(e) => emit('update:countdownTitle', (e.target as HTMLInputElement).value)"
        class="title-input"
        placeholder="e.g. Break Starts"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.timer-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.timer-display {
  font-family: "IBM Plex Mono", monospace;
  font-size: 2.5rem;
  font-weight: 400;
  color: rgb(var(--theme-text));
  letter-spacing: -0.02em;

  .ampm {
    font-size: 1rem;
    opacity: 0.5;
    margin-left: 0.25rem;
  }
}

.tnum {
  font-feature-settings: "tnum";
}

.quick-adjust {
  display: flex;
  gap: 0.4rem;

  button {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    border-radius: 0.25rem;
    border: 1px solid rgba(var(--theme-text), 0.18);
    background: transparent;
    color: rgb(var(--theme-text));
    cursor: pointer;
    transition: background 0.1s;

    &:hover {
      background: rgba(var(--theme-text), 0.08);
    }
  }
}

.time-input-row,
.title-input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.field-label {
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(var(--theme-accent), 0.7);
  min-width: 2.5rem;
}

.time-input,
.title-input {
  flex: 1;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.85rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(var(--theme-text), 0.15);
  color: rgb(var(--theme-text));
  padding: 0.25rem 0;
  outline: none;

  &::placeholder {
    color: rgba(var(--theme-text), 0.3);
  }

  &:focus {
    border-bottom-color: rgba(var(--theme-accent), 0.6);
  }
}

.time-input {
  font-family: "IBM Plex Mono", monospace;
}
</style>
