<script setup lang="ts">
import { ref, onMounted } from "vue";
import { taskService } from "@/services/task.service";
import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlignJustify } from "lucide-vue-next";
import ViewTaskDialog from "@/components/ViewTaskDialog.vue";

import CalendarWeekView from "@/components/calendar/CalendarWeekView.vue";
import CalendarDayView from "@/components/calendar/CalendarDayView.vue";
import CalendarMonthView from "@/components/calendar/CalendarMonthView.vue";

const currentDate = ref(new Date());
const viewMode = ref<'day' | 'week' | 'month'>('week');

const tasks = ref<Task[]>([]);
const loading = ref(true);
const selectedTask = ref<Task | null>(null);
const showViewModal = ref(false);

const dfMonth = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });

onMounted(async () => {
  await fetchTasks();
});

async function fetchTasks() {
  try {
    loading.value = true;
    tasks.value = await taskService.getAllTasks();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function nextDateRange() {
  const next = new Date(currentDate.value);
  if (viewMode.value === 'week') next.setDate(next.getDate() + 7);
  else if (viewMode.value === 'day') next.setDate(next.getDate() + 1);
  else if (viewMode.value === 'month') next.setMonth(next.getMonth() + 1);
  currentDate.value = next;
}

function prevDateRange() {
  const prev = new Date(currentDate.value);
  if (viewMode.value === 'week') prev.setDate(prev.getDate() - 7);
  else if (viewMode.value === 'day') prev.setDate(prev.getDate() - 1);
  else if (viewMode.value === 'month') prev.setMonth(prev.getMonth() - 1);
  currentDate.value = prev;
}

function goToToday() {
  currentDate.value = new Date();
}

function openTask(task: Task) {
  selectedTask.value = task;
  showViewModal.value = true;
}

function handleSelectDay(day: Date) {
  currentDate.value = day;
  viewMode.value = 'day';
}

async function toggleStatus(task: Task) {
  try {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    const updated = await taskService.updateTask(task.id, { status: newStatus });
    const index = tasks.value.findIndex((t) => t.id === task.id);
    if (index !== -1) tasks.value[index] = updated;
  } catch (e) {
    console.error(e);
  }
}

async function deleteTask(id: string) {
  if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;
  try {
    await taskService.deleteTask(id);
    tasks.value = tasks.value.filter((t) => t.id !== id);
    showViewModal.value = false;
  } catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-2rem)] w-full max-w-7xl mx-auto gap-4">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row items-center justify-between gap-4">
      <div class="text-center lg:text-left w-full lg:w-auto">
        <h2 class="text-3xl font-black capitalize">{{ dfMonth.format(currentDate) }}</h2>
        <p class="text-muted-foreground font-semibold">Organiza tu tiempo de manera visual</p>
      </div>
      
      <div class="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
        <!-- View Mode Switcher -->
        <div class="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
          <Button 
            :variant="viewMode === 'day' ? 'default' : 'ghost'" 
            class="rounded-lg h-9 px-4 font-bold" 
            @click="viewMode = 'day'"
          >
            Día
          </Button>
          <Button 
            :variant="viewMode === 'week' ? 'default' : 'ghost'" 
            class="rounded-lg h-9 px-4 font-bold" 
            @click="viewMode = 'week'"
          >
            Semana
          </Button>
          <Button 
            :variant="viewMode === 'month' ? 'default' : 'ghost'" 
            class="rounded-lg h-9 px-4 font-bold" 
            @click="viewMode = 'month'"
          >
            Mes
          </Button>
        </div>

        <div class="flex items-center gap-2">
          <Button variant="outline" class="font-bold rounded-xl h-10" @click="goToToday">Hoy</Button>
          <div class="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-sm">
            <Button variant="ghost" size="icon" class="rounded-lg h-8 w-8" @click="prevDateRange">
              <ChevronLeft class="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" class="rounded-lg h-8 w-8" @click="nextDateRange">
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active View Component -->
    <CalendarDayView 
      v-if="viewMode === 'day'" 
      :current-date="currentDate" 
      :tasks="tasks" 
      @open-task="openTask" 
    />
    <CalendarWeekView 
      v-else-if="viewMode === 'week'" 
      :current-date="currentDate" 
      :tasks="tasks" 
      @open-task="openTask" 
      @select-day="handleSelectDay"
    />
    
    <!-- Month View -->
    <CalendarMonthView 
      v-else-if="viewMode === 'month'" 
      :current-date="currentDate" 
      :tasks="tasks" 
      @open-task="openTask" 
      @select-day="handleSelectDay"
    />

    <!-- Task Dialog reused for all views -->
    <ViewTaskDialog
      v-model:open="showViewModal"
      :task="selectedTask"
      @delete-task="deleteTask"
      @toggle-status="toggleStatus"
      @edit-task="() => {}"
    />
  </div>
</template>
