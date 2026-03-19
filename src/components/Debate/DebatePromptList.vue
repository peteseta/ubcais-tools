<script setup lang="ts">
import { ref } from "vue";
import { removePromptAtIndex } from "@/lib/debatePrompts.js";

type Prompt = { text: string; subtitle: string };
type Preset = { name: string; prompts: Array<{ text: string; subtitle?: string }> };

const props = defineProps<{
  prompts: Prompt[];
  currentPromptIndex: number;
  presets: Preset[];
}>();

const emit = defineEmits<{
  "update:prompts": [Prompt[]];
  "update:currentPromptIndex": [number];
}>();

const loadPreset = (preset: Preset) => {
  emit(
    "update:prompts",
    preset.prompts.map((p) => ({ text: p.text, subtitle: p.subtitle ?? "" }))
  );
  emit("update:currentPromptIndex", 0);
};

const addPrompt = () => {
  emit("update:prompts", [...props.prompts, { text: "", subtitle: "" }]);
};

const removePrompt = (i: number) => {
  const next = removePromptAtIndex(props.prompts, props.currentPromptIndex, i);
  emit("update:prompts", next.prompts);
  emit("update:currentPromptIndex", next.currentPromptIndex);
};

const updatePromptText = (i: number, text: string) => {
  emit(
    "update:prompts",
    props.prompts.map((p, idx) => (idx === i ? { ...p, text } : p))
  );
};

const updatePromptSubtitle = (i: number, subtitle: string) => {
  emit(
    "update:prompts",
    props.prompts.map((p, idx) => (idx === i ? { ...p, subtitle } : p))
  );
};

// ── Drag-to-reorder ───────────────────────────────────────
const dragFromIndex = ref(-1);
const dragToIndex = ref(-1);

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
  const newPrompts = [...props.prompts];
  const [removed] = newPrompts.splice(from, 1);
  newPrompts.splice(to, 0, removed);

  let newIndex = props.currentPromptIndex;
  if (props.currentPromptIndex === from) {
    newIndex = to;
  } else if (from < props.currentPromptIndex && to >= props.currentPromptIndex) {
    newIndex--;
  } else if (from > props.currentPromptIndex && to <= props.currentPromptIndex) {
    newIndex++;
  }

  emit("update:prompts", newPrompts);
  emit("update:currentPromptIndex", newIndex);
  clearDrag();
};

const clearDrag = () => {
  dragFromIndex.value = -1;
  dragToIndex.value = -1;
};
</script>

<template>
  <div class="prompt-list">
    <!-- Presets -->
    <div class="presets-row">
      <button
        v-for="preset in presets"
        :key="preset.name"
        class="btn-preset"
        @click="loadPreset(preset)"
      >
        {{ preset.name }}
      </button>
    </div>

    <!-- Prompt items -->
    <div class="prompts-scroll">
      <div
        v-for="(prompt, i) in prompts"
        :key="i"
        :class="[
          'prompt-item',
          { current: i === currentPromptIndex, dragging: i === dragFromIndex, dragover: i === dragToIndex },
        ]"
        :draggable="true"
        @dragstart="dragStart(i)"
        @dragover.prevent="dragOver(i)"
        @drop="drop()"
        @dragend="clearDrag()"
        @click="emit('update:currentPromptIndex', i)"
      >
        <span class="drag-handle" @click.stop>⠿</span>
        <span class="prompt-index">{{ i + 1 }}</span>
        <div class="prompt-texts">
          <input
            class="prompt-text-input"
            :value="prompt.text"
            placeholder="Debate prompt…"
            @input="updatePromptText(i, ($event.target as HTMLInputElement).value)"
            @click.stop
          />
          <input
            class="prompt-subtitle-input"
            :value="prompt.subtitle"
            placeholder="Subtitle (optional)…"
            @input="updatePromptSubtitle(i, ($event.target as HTMLInputElement).value)"
            @click.stop
          />
        </div>
        <button class="btn-remove" aria-label="Remove prompt" @click.stop="removePrompt(i)">
          ×
        </button>
      </div>
    </div>

    <button class="btn-add" @click="addPrompt">+ Add Prompt</button>
  </div>
</template>

<style lang="scss" scoped>
.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.presets-row {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.btn-preset {
  padding: 0.2rem 0.55rem;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  background: transparent;
  color: rgba(var(--theme-text), 0.4);
  border: 1px solid rgba(var(--theme-text), 0.12);
  border-radius: 2rem;
  cursor: pointer;
  font-family: "IBM Plex Sans", sans-serif;
  transition: all 0.15s;

  &:hover {
    background: rgb(var(--theme-accent));
    border-color: rgb(var(--theme-accent));
    color: white;
  }
}

.prompts-scroll {
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--theme-text), 0.15) transparent;
}

.prompt-item {
  display: grid;
  grid-template-columns: auto 1.25rem 1fr 1.25rem;
  align-items: start;
  gap: 0.25rem;
  padding: 0.35rem 0.4rem;
  border-radius: 0.2rem;
  cursor: pointer;
  transition: background 0.1s;
  border: 1px solid transparent;

  &:hover {
    background: rgba(var(--theme-text), 0.04);

    .drag-handle {
      opacity: 0.5;
    }

    .btn-remove {
      color: rgba(var(--theme-text), 0.4);
    }
  }

  &.current {
    border-color: rgba(var(--theme-accent), 0.35);
    background: rgba(var(--theme-accent), 0.05);
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
  font-size: 0.8rem;
  opacity: 0.2;
  cursor: grab;
  color: rgba(var(--theme-text), 0.4);
  transition: opacity 0.1s;
  user-select: none;
  padding-top: 0.2rem;
  line-height: 1;
}

.prompt-index {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.6rem;
  color: rgba(var(--theme-accent), 0.55);
  padding-top: 0.25rem;
  text-align: right;
}

.prompt-texts {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.prompt-text-input,
.prompt-subtitle-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: "IBM Plex Sans", sans-serif;
  color: rgb(var(--theme-text));
  box-sizing: border-box;
}

.prompt-text-input {
  font-size: 0.82rem;
  padding: 0.1rem 0;

  &::placeholder {
    color: rgba(var(--theme-text), 0.2);
  }
}

.prompt-subtitle-input {
  font-size: 0.7rem;
  font-style: italic;
  color: rgba(var(--theme-text), 0.4);
  padding: 0 0 0.1rem;

  &::placeholder {
    color: rgba(var(--theme-text), 0.15);
  }
}

.btn-remove {
  background: none;
  border: none;
  color: rgba(var(--theme-text), 0.15);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.1rem 0;
  transition: color 0.15s;
  text-align: center;

  &:hover {
    color: rgb(var(--theme-accent));
  }
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0;
  font-size: 0.72rem;
  font-weight: 500;
  background: none;
  color: rgba(var(--theme-text), 0.35);
  border: none;
  cursor: pointer;
  font-family: "IBM Plex Sans", sans-serif;
  transition: color 0.15s;

  &:hover {
    color: rgb(var(--theme-accent));
  }
}
</style>
