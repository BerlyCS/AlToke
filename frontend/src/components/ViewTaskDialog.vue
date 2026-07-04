<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarIcon,
  Clock,
  Leaf,
  Flame,
  Rocket,
  Tag,
  AlignLeft,
  RefreshCw,
  Trash2,
  Edit,
  CheckCircle,
} from "lucide-vue-next";
import { DateFormatter } from "@internationalized/date";
import type { Component } from "vue";
import type { Task } from "@/types";
import * as icons from "lucide-vue-next";

const IconMap: Record<string, Component> = icons as unknown as Record<string, Component>;

defineProps<{
  open: boolean;
  task: Task | null;
}>();

defineEmits(["update:open", "delete-task", "edit-task", "toggle-status"]);

const df = new DateFormatter("es-ES", { dateStyle: "long", timeStyle: "short" });

function formatDueDate(val: string | Date) {
  const date = new Date(val);
  return df.format(date);
}

function getPriorityIcon(priority: string) {
  if (priority === "LOW") return Leaf;
  if (priority === "HIGH") return Rocket;
  return Flame;
}

function getPriorityColor(priority: string) {
  if (priority === "LOW")
    return "text-green-500 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20";
  if (priority === "HIGH")
    return "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20";
  return "text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20";
}

function getPriorityLabel(priority: string) {
  if (priority === "LOW") return "Baja";
  if (priority === "HIGH") return "Alta";
  return "Media";
}

function getRecurrenceLabel(recurrence: string) {
  const map: Record<string, string> = {
    NONE: "Una vez",
    DAILY: "Diariamente",
    WEEKLY: "Semanalmente",
    MONTHLY: "Mensualmente",
  };
  return map[recurrence] || "Una vez";
}

function getTypeLabel(type: string) {
  const map: Record<string, string> = {
    TASK: "Tarea",
    MEETING: "Reunión",
    EVENT: "Evento",
  };
  return map[type] || "Tarea";
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent v-if="task" class="sm:max-w-130 border-border bg-background p-0 overflow-hidden">
      <DialogHeader class="px-6 py-6 border-b border-border bg-muted/10 overflow-hidden w-full">
        <div class="flex items-start justify-between pr-4 w-full min-w-0">
          <div class="space-y-3 w-full min-w-0">
            <DialogTitle
              class="text-2xl font-bold leading-tight text-foreground break-all max-h-24 overflow-y-auto pr-2"
              >{{ task.title }}</DialogTitle
            >
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" class="font-bold border-muted-foreground/30">{{
                getTypeLabel(task.type)
              }}</Badge>
              <div
                v-if="task.status === 'COMPLETED'"
                class="flex items-center text-green-600 dark:text-green-400 font-bold bg-green-500/10 px-2.5 py-0.5 rounded-full text-xs"
              >
                <CheckCircle class="w-3.5 h-3.5 mr-1.5" />
                Completada
              </div>
              <div
                v-else
                class="flex items-center text-orange-600 dark:text-orange-400 font-bold bg-orange-500/10 px-2.5 py-0.5 rounded-full text-xs"
              >
                <Clock class="w-3.5 h-3.5 mr-1.5" />
                Pendiente
              </div>
            </div>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea class="max-h-[60vh] px-6 py-2">
        <div class="grid gap-6 py-4">
          <Card
            v-if="task.description"
            class="shadow-sm hover:shadow-md transition-shadow duration-300 border-border"
          >
            <CardHeader class="pb-3">
              <CardTitle
                class="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-wider"
              >
                <AlignLeft class="w-4 h-4" />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent class="p-0">
              <div
                class="max-h-40 overflow-y-auto px-6 py-4 border-t border-border bg-muted/10 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-all"
              >
                {{ task.description }}
              </div>
            </CardContent>
          </Card>

          <div class="grid grid-cols-2 gap-4">
            <Card
              v-if="task.dueDate"
              class="shadow-sm hover:bg-muted/30 transition-colors border-border"
            >
              <CardHeader class="pb-3">
                <CardTitle
                  class="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-wider"
                >
                  <CalendarIcon class="w-4 h-4" />
                  Fecha Limite
                </CardTitle>
              </CardHeader>
              <CardContent class="">
                <div class="text-sm font-bold text-foreground">
                  {{ formatDueDate(task.dueDate) }}
                </div>
              </CardContent>
            </Card>

            <Card class="shadow-sm hover:bg-muted/30 transition-colors border-border">
              <CardHeader class="pb-3">
                <CardTitle
                  class="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-wider"
                >
                  <Flame class="w-4 h-4" />
                  Prioridad
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                  :class="getPriorityColor(task.priority)"
                >
                  <component :is="getPriorityIcon(task.priority)" class="w-3.5 h-3.5" />
                  {{ getPriorityLabel(task.priority) }}
                </div>
              </CardContent>
            </Card>

            <Card
              v-if="task.estimatedTime"
              class="shadow-sm hover:bg-muted/30 transition-colors border-border"
            >
              <CardContent class="p-4 space-y-2">
                <div
                  class="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-wider"
                >
                  <Clock class="w-4 h-4" />
                  Tiempo Estimado
                </div>
                <div class="text-sm font-bold text-foreground">{{ task.estimatedTime }} min</div>
              </CardContent>
            </Card>

            <Card class="shadow-sm hover:bg-muted/30 transition-colors border-border">
              <CardContent class="p-4 space-y-2">
                <div
                  class="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-wider"
                >
                  <RefreshCw class="w-4 h-4" />
                  Se repite
                </div>
                <div class="text-sm font-bold text-foreground">
                  {{ getRecurrenceLabel(task.recurrence || "NONE") }}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card v-if="task.tags && task.tags.length > 0" class="shadow-sm border-border">
            <CardHeader class="pb-3">
              <CardTitle
                class="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-wider"
              >
                <Tag class="w-4 h-4" />
                Categorías
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-0 pb-5">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="tag in task.tags"
                  :key="tag.id"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm hover:scale-105 transition-transform cursor-default"
                  :class="tag.color || 'bg-primary'"
                >
                  <component :is="IconMap[tag.icon || 'Tag']" class="w-3.5 h-3.5" />
                  {{ tag.name }}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      <div class="flex flex-col gap-3 px-6 pb-6 pt-4 bg-muted/10 border-t border-border w-full">
        <Button
          size="default"
          :variant="task.status === 'COMPLETED' ? 'secondary' : 'default'"
          class="w-full font-bold shadow-sm py-5 text-md"
          @click="
            () => {
              $emit('toggle-status', task!);
              $emit('update:open', false);
            }
          "
        >
          <CheckCircle class="w-5 h-5 mr-2" />
          {{ task.status === "COMPLETED" ? "Marcar Pendiente" : "Completar Tarea" }}
        </Button>
        <div class="flex justify-center items-center gap-3 w-full">
          <Button
            variant="outline"
            size="sm"
            class="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-red-500/20 font-bold shadow-sm"
            @click="
              () => {
                $emit('delete-task', task!.id);
                $emit('update:open', false);
              }
            "
          >
            <Trash2 class="w-4 h-4 mr-2" /> Eliminar
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="flex-1 font-bold shadow-sm text-foreground"
            @click="
              () => {
                $emit('edit-task', task!);
                $emit('update:open', false);
              }
            "
          >
            <Edit class="w-4 h-4 mr-2" /> Editar
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
