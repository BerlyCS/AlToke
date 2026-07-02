<template>
  <div class="group bg-slate-50 rounded-3xl p-5 flex items-center justify-between hover:shadow-lg transition">
    <div class="flex items-center gap-5">
      <div class="w-14 h-14 rounded-2xl flex items-center justify-center" :class="taskStyle.bgColor">
        <component :is="taskStyle.icon" class="w-7 h-7" :class="taskStyle.textColor" />
      </div>

      <div>
        <h4 class="font-bold text-lg">
          {{ title }}
        </h4>

        <p class="text-slate-400">
          {{ day }} - {{ time }}
        </p>
      </div>
    </div>

    <button v-if="done" class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-success-400 text-white">
      <Check class="w-6 h-6" />
    </button>
    <button v-else class="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
      <Clock3 class="w-6 h-6" />
    </button>
  </div>
</template>
<script lang="ts" setup>
import { BookOpen, Briefcase, Check, Clock3, Dumbbell } from 'lucide-vue-next';
import { computed } from 'vue';
import type { PropType } from 'vue';

type TaskType = 'work' | 'study' | 'exercise' | 'other'

const props = defineProps({
  title: String,
  day: String,
  time: String,
  type: {
    type: String as PropType<TaskType>,
    required: true,
    validator: (value: string) => ['work', 'study', 'exercise', 'other'].includes(value),
  },
  done: Boolean,
});

const styleTask = (type: TaskType) => {
  switch (type) {
    case 'work':
      return {
        bgColor: 'bg-primary-50',
        textColor: 'text-primary-500',
        buttonColor: 'bg-primary-500 text-white',
        icon: Briefcase,
      };
    case 'study':
      return {
        bgColor: 'bg-warning-50',
        textColor: 'text-warning-500',
        buttonColor: 'bg-warning-500 text-white',
        icon: BookOpen,
      };
    case 'exercise':
      return {
        bgColor: 'bg-success-50',
        textColor: 'text-success-500',
        buttonColor: 'bg-success-400 text-white',
        icon: Dumbbell,
      };
    default:
      return {
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-500',
        buttonColor: 'bg-slate-400 text-white',
        icon: Briefcase,
      };
  }
};

const taskStyle = computed(() => styleTask(props.type));

</script>