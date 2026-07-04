<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import type { Task } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Tag,
  Briefcase,
  Home,
  Code,
  Heart,
  Star,
  Book,
  Coffee,
  Dumbbell,
  Music,
  AlignLeft,
} from "lucide-vue-next";

const IconMap: Record<string, Component> = {
  Tag,
  Briefcase,
  Home,
  Code,
  Heart,
  Star,
  Book,
  Coffee,
  Dumbbell,
  Music,
  AlignLeft,
};

const props = defineProps<{
  tasks: Task[];
}>();

defineEmits(["toggleStatus", "deleteTask", "openTask"]);

const todayTasks = computed(() => {
  const now = new Date();
  return props.tasks.filter((task) => {
    if (!task.dueDate) return false;
    const d = new Date(task.dueDate);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });
});

function formatTime(val: string | Date) {
  const d = new Date(val);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  "bg-red-500": { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-500" },
  "bg-orange-500": {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-500",
  },
  "bg-yellow-500": {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-500",
  },
  "bg-green-500": { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-500" },
  "bg-blue-500": { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-500" },
  "bg-indigo-500": {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-500",
  },
  "bg-purple-500": {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-500",
  },
  "bg-pink-500": { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-500" },
};

function getTaskColors(task: Task) {
  const defaultColors = { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary" };
  if (!task.tags || task.tags.length === 0) return defaultColors;
  const color = task.tags?.[0]?.color;
  return (color ? colorMap[color] : undefined) || defaultColors;
}
</script>

<template>
  <Card class="border-border bg-card/60 backdrop-blur-xl shadow-2xl">
    <CardHeader class="pb-4">
      <CardTitle class="text-2xl font-bold flex items-center gap-2">
        Próximas tareas
        <span class="bg-primary/20 text-primary text-sm px-2.5 py-0.5 rounded-full">{{
          todayTasks.length
        }}</span>
      </CardTitle>
      <CardDescription class="text-base text-muted-foreground"
        >Organiza tu día y mantén tu racha 🔥</CardDescription
      >
    </CardHeader>
    <CardContent class="grid gap-3">
      <div
        v-for="task in todayTasks"
        :key="task.id"
        class="flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md min-w-0"
        :class="[
          getTaskColors(task).bg,
          getTaskColors(task).border,
          task.status === 'COMPLETED' ? 'opacity-50' : '',
        ]"
        @click="$emit('openTask', task)"
      >
        <div class="flex items-center gap-4 w-full min-w-0">
          <button
            @click.stop="$emit('toggleStatus', task)"
            class="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
          >
            <CheckCircle2 v-if="task.status === 'COMPLETED'" class="w-6 h-6 text-green-500" />
            <Circle v-else class="w-6 h-6 text-muted-foreground" />
          </button>

          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center bg-background shadow-sm shrink-0"
            :class="getTaskColors(task).text"
          >
            <component
              :is="IconMap[task.tags && task.tags.length > 0 ? task.tags[0]?.icon || 'Tag' : 'Tag']"
              class="w-6 h-6"
            />
          </div>

          <div class="flex flex-col flex-1 min-w-0">
            <span
              class="font-bold text-lg leading-tight truncate"
              :class="{ 'line-through text-muted-foreground': task.status === 'COMPLETED' }"
            >
              {{ task.title }}
            </span>
            <div
              class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-medium mt-1"
            >
              <span class="flex items-center gap-1.5" v-if="task.dueDate">
                <Clock class="w-4 h-4" />
                {{ formatTime(task.dueDate) }}
              </span>
              <span v-if="task.estimatedTime" class="flex items-center gap-1.5">
                • {{ task.estimatedTime }} min
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 pl-2">
          <button
            class="p-2 rounded-lg hover:bg-destructive/10 text-destructive/50 hover:text-destructive transition-colors shrink-0"
            @click.stop="$emit('deleteTask', task.id)"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        v-if="todayTasks.length === 0"
        class="text-center py-12 text-muted-foreground bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-border mt-2"
      >
        <div class="text-4xl mb-3 opacity-50">☀️</div>
        <h3 class="text-lg font-bold text-foreground">Día libre</h3>
        <p>No tienes tareas pendientes para hoy.</p>
      </div>
    </CardContent>
  </Card>
</template>
