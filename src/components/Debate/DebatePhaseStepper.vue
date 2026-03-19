<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { formatPhaseTime } from "@/lib/spectrumTimer.js";

type Phase = { name: string; short?: string; duration: number; side?: "disagree" | "agree" };

const props = defineProps<{
  phases: Phase[];
  currentPhaseIndex: number;
  timerState: "idle" | "ready" | "running" | "stopped" | "finished";
}>();

const emit = defineEmits<{
  jump: [index: number];
  "update:phases": [Phase[]];
  delete: [index: number];
  add: [];
}>();

const containerRef = ref<HTMLElement | null>(null);
const editingIndex = ref(-1);
const dragFromIndex = ref(-1);
const dragToIndex = ref(-1);

const getDotStyle = (phase: Phase) => {
  if (phase.side === "disagree") return { background: "#dc2626" };
  if (phase.side === "agree") return { background: "#16a34a" };
  return { background: "#888" };
};

const formatDur = (duration: number) => {
  if (duration === 0) return "—";
  return formatPhaseTime(duration);
};

// ── Inline edit ───────────────────────────────────────────
const toggleEdit = (i: number, e: Event) => {
  e.stopPropagation();
  editingIndex.value = editingIndex.value === i ? -1 : i;
};

const updateName = (i: number, name: string) => {
  emit(
    "update:phases",
    props.phases.map((p, idx) => (idx === i ? { ...p, name } : p))
  );
};

const updateDuration = (i: number, minutes: number, seconds: number) => {
  const duration = Math.max(0, minutes * 60 + seconds);
  emit(
    "update:phases",
    props.phases.map((p, idx) => (idx === i ? { ...p, duration } : p))
  );
};

const updateSide = (i: number, side: "disagree" | "agree" | undefined) => {
  emit(
    "update:phases",
    props.phases.map((p, idx) => (idx === i ? { ...p, side } : p))
  );
};

// ── Drag-to-reorder ───────────────────────────────────────
const dragStart = (i: number) => {
  dragFromIndex.value = i;
};

const dragOver = (i: number) => {
  dragToIndex.value = i;
};

const drop = () => {
  const from = dragFromIndex.value;
  const to = dragToIndex.value;
  if (from === -1 || to === -1 || from === to) {
    clearDrag();
    return;
  }
  const newPhases = [...props.phases];
  const [removed] = newPhases.splice(from, 1);
  newPhases.splice(to, 0, removed);
  emit("update:phases", newPhases);
  clearDrag();
};

const clearDrag = () => {
  dragFromIndex.value = -1;
  dragToIndex.value = -1;
};

// ── Click-outside to close edit ───────────────────────────
const handleDocumentClick = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    editingIndex.value = -1;
  }
};

onMounted(() => document.addEventListener("click", handleDocumentClick));
onUnmounted(() => document.removeEventListener("click", handleDocumentClick));
</script>

<template>
  <div class="phase-stepper-list" ref="containerRef">
    <div v-for="(phase, i) in phases" :key="i" class="phase-item">
      <div
        :class="[
          'phase-row',
          {
            active: i === currentPhaseIndex,
            done: i < currentPhaseIndex,
            dragging: i === dragFromIndex,
            dragover: i === dragToIndex,
          },
        ]"
        :draggable="true"
        @dragstart="dragStart(i)"
        @dragover.prevent="dragOver(i)"
        @drop="drop()"
        @dragend="clearDrag()"
        @click="emit('jump', i)"
      >
        <span class="drag-handle" @click.stop>⠿</span>
        <div class="phase-dot" :style="getDotStyle(phase)"></div>
        <div class="phase-info">
          <span class="phase-name">{{ phase.name }}</span>
          <span class="phase-dur">{{ formatDur(phase.duration) }}</span>
        </div>
        <button
          class="btn-row-action"
          :class="{ active: editingIndex === i }"
          title="Edit phase"
          @click.stop="toggleEdit(i, $event)"
        >
          ✎
        </button>
        <button
          class="btn-row-action btn-delete"
          title="Delete phase"
          :disabled="phases.length === 1"
          @click.stop="emit('delete', i)"
        >
          ×
        </button>
      </div>

      <div v-if="editingIndex === i" class="phase-edit-popover" @click.stop>
        <input
          class="edit-input"
          :value="phase.name"
          placeholder="Phase name"
          @input="updateName(i, ($event.target as HTMLInputElement).value)"
        />
        <div class="duration-row">
          <input
            type="number"
            class="edit-input dur-input"
            :value="Math.floor(phase.duration / 60)"
            min="0"
            @change="
              updateDuration(i, +($event.target as HTMLInputElement).value, phase.duration % 60)
            "
          />
          <span class="dur-sep">m</span>
          <input
            type="number"
            class="edit-input dur-input"
            :value="phase.duration % 60"
            min="0"
            max="59"
            @change="
              updateDuration(i, Math.floor(phase.duration / 60), +($event.target as HTMLInputElement).value)
            "
          />
          <span class="dur-sep">s</span>
        </div>
        <div class="side-selector">
          <button
            :class="['side-btn', { active: !phase.side }]"
            @click="updateSide(i, undefined)"
          >
            Neutral
          </button>
          <button
            :class="['side-btn', 'disagree', { active: phase.side === 'disagree' }]"
            @click="updateSide(i, 'disagree')"
          >
            Disagree
          </button>
          <button
            :class="['side-btn', 'agree', { active: phase.side === 'agree' }]"
            @click="updateSide(i, 'agree')"
          >
            Agree
          </button>
        </div>
      </div>
    </div>

    <button class="btn-add-phase" @click="emit('add')">+ Add Phase</button>
  </div>
</template>

<style lang="scss" scoped>
.phase-stepper-list {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.phase-item {
  display: flex;
  flex-direction: column;
}

.phase-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.4rem;
  border-radius: 0.25rem;
  background: none;
  border: 1px solid transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.1s;
  font-family: "IBM Plex Sans", sans-serif;
  color: rgba(var(--theme-text), 0.45);
  box-sizing: border-box;

  &:hover {
    background: rgba(var(--theme-text), 0.05);
    color: rgba(var(--theme-text), 0.7);

    .drag-handle {
      opacity: 0.5;
    }

    .btn-row-action {
      color: rgba(var(--theme-text), 0.55);

      &.active {
        color: rgb(var(--theme-accent));
      }
    }
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

  &.dragging {
    opacity: 0.4;
  }

  &.dragover {
    border-color: rgba(var(--theme-accent), 0.4);
    background: rgba(var(--theme-accent), 0.05);
  }
}

.drag-handle {
  font-size: 0.85rem;
  opacity: 0.2;
  cursor: grab;
  flex-shrink: 0;
  color: rgba(var(--theme-text), 0.4);
  transition: opacity 0.1s;
  user-select: none;
  line-height: 1;
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
  overflow: hidden;
}

.phase-name {
  font-size: 0.8rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.phase-dur {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.65rem;
  opacity: 0.6;
  flex-shrink: 0;
}

.btn-row-action {
  background: none;
  border: none;
  color: rgba(var(--theme-text), 0.3);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0 0.15rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  transition: color 0.1s;
  font-family: "IBM Plex Sans", sans-serif;
  line-height: 1;

  &.active {
    color: rgb(var(--theme-accent));
  }

  &:hover {
    color: rgb(var(--theme-accent));
  }

  &.btn-delete:hover {
    color: #dc2626;
  }

  &:disabled {
    opacity: 0.15 !important;
    cursor: not-allowed;
  }
}

// ── Edit popover ─────────────────────────────────────────
.phase-edit-popover {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem 0.6rem;
  margin: 0.1rem 0 0.25rem;
  background: rgba(var(--theme-bg), 0.6);
  border: 1px solid rgba(var(--theme-text), 0.1);
  border-radius: 0.3rem;
}

.edit-input {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.8rem;
  background: rgba(var(--theme-text), 0.05);
  border: 1px solid rgba(var(--theme-text), 0.1);
  border-radius: 0.2rem;
  color: rgb(var(--theme-text));
  padding: 0.3rem 0.4rem;
  width: 100%;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(var(--theme-text), 0.25);
  }

  &:focus {
    border-color: rgba(var(--theme-accent), 0.4);
  }
}

.duration-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dur-input {
  width: 3.5rem;
  text-align: center;
}

.dur-sep {
  font-size: 0.72rem;
  color: rgba(var(--theme-text), 0.4);
}

.side-selector {
  display: flex;
  gap: 0.25rem;
}

.side-btn {
  flex: 1;
  padding: 0.25rem 0.35rem;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  background: transparent;
  color: rgba(var(--theme-text), 0.4);
  border: 1px solid rgba(var(--theme-text), 0.1);
  border-radius: 0.2rem;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    color: rgba(var(--theme-text), 0.7);
    border-color: rgba(var(--theme-text), 0.2);
  }

  &.active {
    background: rgba(128, 128, 128, 0.14);
    color: #888;
    border-color: rgba(128, 128, 128, 0.3);
  }

  &.disagree.active {
    background: rgba(220, 38, 38, 0.12);
    color: #dc2626;
    border-color: rgba(220, 38, 38, 0.3);
  }

  &.agree.active {
    background: rgba(22, 163, 74, 0.12);
    color: #16a34a;
    border-color: rgba(22, 163, 74, 0.3);
  }
}

// ── Add phase ─────────────────────────────────────────────
.btn-add-phase {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 500;
  background: none;
  color: rgba(var(--theme-text), 0.35);
  border: none;
  cursor: pointer;
  font-family: "IBM Plex Sans", sans-serif;
  transition: color 0.15s;
  margin-top: 0.1rem;

  &:hover {
    color: rgb(var(--theme-accent));
  }
}
</style>
