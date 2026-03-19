<script setup lang="ts">
defineProps<{
  stages: { id: string; label: string }[];
  currentStageId: string;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();
</script>

<template>
  <div class="stages-stepper">
    <button
      v-for="stage in stages"
      :key="stage.id"
      :class="['stage-chip', { active: stage.id === currentStageId }]"
      @click="emit('select', stage.id)"
    >
      {{ stage.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.stages-stepper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.stage-chip {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  border: 1px solid rgba(var(--theme-text), 0.18);
  background: transparent;
  color: rgb(var(--theme-text));
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
  white-space: nowrap;

  &:hover {
    background: rgba(var(--theme-text), 0.08);
    border-color: rgba(var(--theme-text), 0.3);
  }

  &.active {
    background: rgb(var(--theme-accent));
    border-color: rgb(var(--theme-accent));
    color: #fff;
  }
}
</style>
