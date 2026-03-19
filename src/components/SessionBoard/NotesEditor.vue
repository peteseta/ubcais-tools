<script setup lang="ts">
defineProps<{
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}>();

const emit = defineEmits<{
  "update:topLeft": [value: string];
  "update:topRight": [value: string];
  "update:bottomLeft": [value: string];
  "update:bottomRight": [value: string];
}>();
</script>

<template>
  <div class="notes-editor">
    <div class="notes-row">
      <div class="note-field">
        <label class="corner-label">Top left</label>
        <textarea
          :value="topLeft"
          @input="(e) => emit('update:topLeft', (e.target as HTMLTextAreaElement).value)"
          placeholder="Empty"
        />
      </div>
      <div class="note-field">
        <label class="corner-label">Top right</label>
        <textarea
          :value="topRight"
          @input="(e) => emit('update:topRight', (e.target as HTMLTextAreaElement).value)"
          placeholder="Empty"
        />
      </div>
    </div>
    <div class="notes-row">
      <div class="note-field">
        <label class="corner-label">Bottom left</label>
        <textarea
          :value="bottomLeft"
          @input="(e) => emit('update:bottomLeft', (e.target as HTMLTextAreaElement).value)"
          placeholder="Empty"
        />
      </div>
      <div class="note-field">
        <label class="corner-label">Bottom right</label>
        <textarea
          :value="bottomRight"
          @input="(e) => emit('update:bottomRight', (e.target as HTMLTextAreaElement).value)"
          placeholder="Empty"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notes-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notes-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.note-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.corner-label {
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(var(--theme-text), 0.4);
}

textarea {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.8rem;
  background: rgba(var(--theme-text), 0.04);
  border: 1px solid rgba(var(--theme-text), 0.1);
  border-radius: 0.25rem;
  color: rgb(var(--theme-text));
  padding: 0.5rem;
  resize: vertical;
  min-height: 4rem;
  outline: none;
  white-space: pre-wrap;
  line-height: 1.4;

  &::placeholder {
    color: rgba(var(--theme-text), 0.2);
  }

  &:focus {
    border-color: rgba(var(--theme-accent), 0.5);
  }
}
</style>
