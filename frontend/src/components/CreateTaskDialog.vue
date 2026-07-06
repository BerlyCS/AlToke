<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { taskService } from '@/services/task.service'
import { toast } from 'vue-sonner'
import { tagService } from '@/services/tag.service'
import type { Tag, Task } from '@/types'
import type { Component } from 'vue'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CalendarIcon,
  Leaf,
  Flame,
  Rocket,
  Tag as TagIcon,
  Briefcase,
  Home,
  Code,
  Heart,
  Star,
  Book,
  Coffee,
  Dumbbell,
  Music,
  Plus,
  Clock,
  AlignLeft,
  Search,
} from 'lucide-vue-next'
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

const IconMap: Record<string, Component> = {
  Tag: TagIcon,
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
}

const props = defineProps<{
  open: boolean
  task: Task | null
}>()

const emit = defineEmits(['update:open', 'created', 'updated'])

const isEditing = computed(() => !!props.task)

const isSubmitting = ref(false)

const newTask = ref({
  title: '',
  description: '',
  type: 'TASK',
  priority: 'MEDIUM',
  estimatedTime: '',
  recurrence: 'NONE',
})

function getTomorrow() {
  return today(getLocalTimeZone()).add({ days: 1 })
}

function getCurrentTime() {
  const now = new Date()
  return now.toTimeString().slice(0, 5) // "HH:MM"
}

const df = new DateFormatter('es-ES', { dateStyle: 'long' })
const dueDate = ref<DateValue | undefined>(getTomorrow() as unknown as DateValue)
const dueTime = ref(getCurrentTime())

const tags = ref<Tag[]>([])
const selectedTags = ref<Set<string>>(new Set())

const tagSearchQuery = ref('')
const filteredTags = computed(() => {
  if (!tagSearchQuery.value) return tags.value
  return tags.value.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearchQuery.value.toLowerCase()),
  )
})

const showTagModal = ref(false)
const newTag = ref({ name: '', color: 'bg-blue-500', icon: 'Tag' })
const tagColors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
]
const tagIcons = [
  'Tag',
  'Briefcase',
  'Home',
  'Code',
  'Heart',
  'Star',
  'Book',
  'Coffee',
  'Dumbbell',
  'Music',
]

onMounted(async () => {
  try {
    tags.value = await tagService.getAllTags()
  } catch (e) {
    console.error('Failed to load tags', e)
  }
})

function resetForm() {
  newTask.value = {
    title: '',
    description: '',
    type: 'TASK',
    priority: 'MEDIUM',
    estimatedTime: '',
    recurrence: 'NONE',
  }
  dueDate.value = getTomorrow()
  dueTime.value = getCurrentTime()
  selectedTags.value.clear()
}

watch(
  () => props.task,
  (task) => {
    if (!task) {
      if (!props.open) resetForm()
      return
    }
    newTask.value.title = task.title
    newTask.value.description = task.description || ''
    newTask.value.type = task.type || 'TASK'
    newTask.value.priority = task.priority || 'MEDIUM'
    newTask.value.estimatedTime = task.estimatedTime?.toString() || ''
    newTask.value.recurrence = task.recurrence || 'NONE'
    if (task.dueDate) {
      const d = new Date(task.dueDate)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      dueDate.value = today(getLocalTimeZone()).set({
        year,
        month: parseInt(month),
        day: parseInt(day),
      }) as unknown as DateValue
      dueTime.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    selectedTags.value = new Set(task.tags?.map((t) => t.id) || [])
  },
  { immediate: true, deep: true },
)

async function createNewTag() {
  if (!newTag.value.name) return
  try {
    const created = await tagService.createTag(newTag.value)
    tags.value.push(created)
    selectedTags.value.add(created.id)
    showTagModal.value = false
    newTag.value = { name: '', color: 'bg-blue-500', icon: 'Tag' }
  } catch (e) {
    console.error(e)
    alert('Error al crear categoría')
  }
}

function toggleTag(id: string) {
  if (selectedTags.value.has(id)) selectedTags.value.delete(id)
  else selectedTags.value.add(id)
}

async function createTask() {
  try {
    isSubmitting.value = true
    let finalDueDate: string | undefined = undefined
    if (dueDate.value) {
      const date = dueDate.value.toDate(getLocalTimeZone())
      if (dueTime.value) {
        const [hours, minutes] = dueTime.value.split(':')
        date.setHours(parseInt(hours || '0'), parseInt(minutes || '0'))
      }
      finalDueDate = date.toISOString()
    }

    const payload = {
      title: newTask.value.title,
      description: newTask.value.description,
      type: newTask.value.type,
      priority: newTask.value.priority,
      recurrence: newTask.value.recurrence,
      tagIds: Array.from(selectedTags.value),
      ...(newTask.value.estimatedTime
        ? { estimatedTime: parseInt(newTask.value.estimatedTime) }
        : {}),
      ...(finalDueDate && { dueDate: finalDueDate }),
    }

    if (isEditing.value && props.task) {
      const updated = await taskService.updateTask(props.task.id, payload)
      emit('updated', updated)
      toast.success('Tarea actualizada con éxito')
    } else {
      const created = await taskService.createTask(payload)
      emit('created', created)
      toast.success('Tarea creada con éxito')
    }

    resetForm()
    emit('update:open', false)
  } catch (e: any) {
    console.error(e)
    toast.error(isEditing.value ? 'Error al actualizar tarea' : 'Error al crear tarea', {
      description: e?.message || 'Error desconocido'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-137.5 p-0 overflow-hidden border-border bg-background">
      <DialogHeader class="px-6 pt-6 pb-2">
        <DialogTitle class="font-bold text-2xl">{{
          isEditing ? 'Editar tarea' : 'Nueva tarea'
        }}</DialogTitle>
        <DialogDescription class="text-base">
          {{
            isEditing
              ? 'Actualiza los detalles de tu tarea'
              : 'Organiza tu proximo objetivo gana xp'
          }}
        </DialogDescription>
      </DialogHeader>
      <ScrollArea class="max-h-[70vh] pr-4 -mr-4">
        <Card class="border-0 shadow-none bg-transparent px-6 pb-6 rounded-none">
          <CardHeader class="px-0 pt-2 pb-4">
            <CardTitle class="text-lg">Informacion de la tarea</CardTitle>
            <CardDescription>Mientras mas organizada mas facil sera completarla</CardDescription>
          </CardHeader>
          <CardContent class="px-0 pb-0">
            <div class="grid gap-4 pb-2">
              <div class="space-y-2">
                <Label for="title">Nombre de la tarea</Label>
                <Input
                  id="title"
                  v-model="newTask.title"
                  placeholder="Ej: Terminar el reporte mensual"
                  class="bg-background"
                />
              </div>

              <div class="space-y-2">
                <Label for="description">Descripción</Label>
                <Textarea
                  id="description"
                  v-model="newTask.description"
                  placeholder="Añade más detalles..."
                  class="resize-none bg-background"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>Tipo de Tarea</Label>
                  <Select v-model="newTask.type">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="TASK">Tarea normal</SelectItem>
                        <SelectItem value="MEETING">Reunión</SelectItem>
                        <SelectItem value="EVENT">Evento</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label for="estimatedTime">Tiempo estimado (min)</Label>
                  <div class="relative">
                    <Clock class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="estimatedTime"
                      type="number"
                      v-model="newTask.estimatedTime"
                      placeholder="Ej: 30"
                      class="pl-9 bg-background"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2 flex flex-col">
                  <Label>Fecha límite</Label>
                  <Popover>
                    <PopoverTrigger as-child>
                      <Button
                        variant="outline"
                        class="w-full justify-start text-left font-normal bg-background"
                        :class="!dueDate && 'text-muted-foreground'"
                      >
                        <CalendarIcon class="mr-2 h-4 w-4" />
                        {{
                          dueDate
                            ? df.format(dueDate.toDate(getLocalTimeZone()))
                            : 'Selecciona una fecha'
                        }}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0">
                      <Calendar v-model="dueDate as any" initial-focus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div class="space-y-2">
                  <Label for="time">Hora límite</Label>
                  <Input id="time" type="time" v-model="dueTime" class="bg-background" />
                </div>
              </div>

              <div class="space-y-2">
                <Label>Repetición</Label>
                <Select v-model="newTask.recurrence">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Selecciona la repetición" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="NONE">Una vez</SelectItem>
                      <SelectItem value="DAILY">Diariamente</SelectItem>
                      <SelectItem value="WEEKLY">Semanalmente</SelectItem>
                      <SelectItem value="MONTHLY">Mensualmente</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label>Prioridad</Label>
                <div class="grid grid-cols-3 gap-3">
                  <div
                    @click="newTask.priority = 'LOW'"
                    class="flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all"
                    :class="
                      newTask.priority === 'LOW'
                        ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                        : 'border-border bg-card hover:bg-accent hover:border-accent'
                    "
                  >
                    <Leaf class="h-6 w-6 text-green-500 mb-2" />
                    <span
                      class="text-sm font-bold"
                      :class="
                        newTask.priority === 'LOW'
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-muted-foreground'
                      "
                      >Baja</span
                    >
                  </div>
                  <div
                    @click="newTask.priority = 'MEDIUM'"
                    class="flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all"
                    :class="
                      newTask.priority === 'MEDIUM'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                        : 'border-border bg-card hover:bg-accent hover:border-accent'
                    "
                  >
                    <Flame class="h-6 w-6 text-orange-500 mb-2" />
                    <span
                      class="text-sm font-bold"
                      :class="
                        newTask.priority === 'MEDIUM'
                          ? 'text-orange-700 dark:text-orange-400'
                          : 'text-muted-foreground'
                      "
                      >Media</span
                    >
                  </div>
                  <div
                    @click="newTask.priority = 'HIGH'"
                    class="flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all"
                    :class="
                      newTask.priority === 'HIGH'
                        ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                        : 'border-border bg-card hover:bg-accent hover:border-accent'
                    "
                  >
                    <Rocket class="h-6 w-6 text-red-500 mb-2" />
                    <span
                      class="text-sm font-bold"
                      :class="
                        newTask.priority === 'HIGH'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-muted-foreground'
                      "
                      >Alta</span
                    >
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <Label>Categorías</Label>
                <div class="relative">
                  <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    v-model="tagSearchQuery"
                    placeholder="Buscar categoría..."
                    class="pl-9 h-9 bg-background"
                  />
                </div>
                <ScrollArea class="h-[120px] pr-3 rounded-md border p-2 bg-background/50">
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="tag in filteredTags"
                      :key="tag.id"
                      @click="toggleTag(tag.id)"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border-2"
                      :class="
                        selectedTags.has(tag.id)
                          ? `border-transparent text-white ${tag.color || 'bg-primary'}`
                          : 'border-border bg-transparent text-muted-foreground hover:border-muted'
                      "
                    >
                      <component :is="IconMap[tag.icon || 'Tag']" class="w-3.5 h-3.5" />
                      {{ tag.name }}
                    </div>
                    <div
                      @click="showTagModal = true"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border-2 border-dashed border-border bg-transparent text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      <Plus class="w-3.5 h-3.5" />
                      Nueva
                    </div>
                  </div>
                  <div
                    v-if="filteredTags.length === 0"
                    class="text-sm text-muted-foreground text-center py-4"
                  >
                    No se encontraron categorías.
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
          <DialogFooter class="mt-6">
            <Button variant="ghost" @click="$emit('update:open', false)">Cancelar</Button>
            <Button
              @click="createTask"
              :disabled="isSubmitting || !newTask.title"
              class="px-8 font-bold"
            >
              {{
                isSubmitting
                  ? isEditing
                    ? 'Actualizando...'
                    : 'Creando...'
                  : isEditing
                    ? 'Actualizar Tarea'
                    : 'Guardar Tarea'
              }}
            </Button>
          </DialogFooter>
        </Card>
      </ScrollArea>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="showTagModal">
    <DialogContent class="sm:max-w-100 border-border bg-background">
      <DialogHeader>
        <DialogTitle>Nueva Categoría</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <Label>Nombre</Label>
          <Input
            v-model="newTag.name"
            placeholder="Ej: Trabajo, Estudio..."
            class="bg-background"
          />
        </div>
        <div class="space-y-2">
          <Label>Color</Label>
          <div class="flex gap-2 flex-wrap">
            <div
              v-for="color in tagColors"
              :key="color"
              @click="newTag.color = color"
              class="w-8 h-8 rounded-full cursor-pointer ring-offset-2 ring-offset-background transition-all"
              :class="[color, newTag.color === color ? 'ring-2 ring-primary' : '']"
            />
          </div>
        </div>
        <div class="space-y-2">
          <Label>Icono</Label>
          <div class="flex gap-2 flex-wrap">
            <div
              v-for="icon in tagIcons"
              :key="icon"
              @click="newTag.icon = icon"
              class="p-2 rounded-md cursor-pointer transition-all border-2"
              :class="
                newTag.icon === icon
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-muted'
              "
            >
              <component :is="IconMap[icon]" class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" @click="showTagModal = false">Cancelar</Button>
        <Button @click="createNewTag" :disabled="!newTag.name">Crear Categoría</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
