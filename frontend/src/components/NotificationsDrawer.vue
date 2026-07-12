<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Bell,
  BellDot,
  Mail,
  Smartphone,
  VolumeX,
  Info,
  AlertTriangle,
  Users,
  Bot,
  CheckCheck,
} from 'lucide-vue-next'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { notificationService } from '@/services/notification.service'
import type { NotificationLog } from '@/types'

const LAST_SEEN_KEY = 'altoke_last_seen_notification_id'

const open = ref(false)
const logs = ref<NotificationLog[]>([])
const loading = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

const lastSeenId = ref(localStorage.getItem(LAST_SEEN_KEY) ?? '')

const unreadCount = computed(() => {
  if (!lastSeenId.value) return 0
  const idx = logs.value.findIndex((l) => l.id === lastSeenId.value)
  return idx === -1 ? logs.value.length : idx
})

const showBadge = computed(() => unreadCount.value > 0)

const channelIcon = (channel: string) => {
  switch (channel) {
    case 'EMAIL':
      return Mail
    case 'PUSH':
      return Smartphone
    case 'IN_APP':
      return Info
    case 'SYSTEM':
      return Bot
    default:
      return Bell
  }
}

const typeIcon = (type: string) => {
  if (type.startsWith('TASK_DUE') || type.startsWith('OVERDUE') || type.startsWith('EXPIRATION'))
    return AlertTriangle
  if (type.startsWith('TASK_TIME_REACHED')) return Bell
  if (type.startsWith('TASK_COMPLETED')) return CheckCheck
  if (type.startsWith('AI') || type.includes('SUGGESTION')) return Bot
  if (type.startsWith('SOCIAL') || type.startsWith('FRIEND')) return Users
  return Bell
}

function typeBadgeColor(type: string): string {
  if (type.startsWith('TASK_DUE') || type.startsWith('OVERDUE') || type.startsWith('EXPIRATION'))
    return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  if (type.startsWith('TASK_TIME_REACHED'))
    return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
  if (type.startsWith('TASK_COMPLETED'))
    return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
  if (type.startsWith('AI'))
    return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
  if (type.startsWith('FRIEND'))
    return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

async function loadHistory() {
  loading.value = true
  try {
    logs.value = await notificationService.getHistory(50)
  } catch {
    // silent
  } finally {
    loading.value = false
  }
}

function markAllSeen() {
  if (logs.value.length > 0) {
    lastSeenId.value = logs.value[0]!.id
    localStorage.setItem(LAST_SEEN_KEY, lastSeenId.value)
  }
}

function handleOpenChange(val: boolean) {
  open.value = val
  if (val) {
    loadHistory()
    markAllSeen()
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Hace ${diffH}h`
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

let lastToastId = ''

function pollNotifications() {
  notificationService
    .getHistory(5)
    .then((recent) => {
      if (recent.length === 0) return

      const prevLen = logs.value.length
      logs.value = recent

      if (lastSeenId.value && prevLen > 0) {
        const newOnes = recent.filter((l) => {
          const idx = recent.findIndex((r) => r.id === lastSeenId.value)
          return idx === -1 || recent.indexOf(l) < idx
        })
        for (const n of newOnes) {
          if (n.id === lastToastId) continue
          lastToastId = n.id
          import('vue-sonner').then(({ toast }) => {
            toast(n.title, {
              description: n.message,
              duration: 5000,
            })
          })
        }
      }
    })
    .catch(() => {})
}

onMounted(() => {
  loadHistory()
  pollTimer = setInterval(pollNotifications, 15 * 1000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <Sheet :open="open" @update:open="handleOpenChange">
    <SheetTrigger as-child>
      <Button variant="ghost" size="icon" class="relative">
        <Bell v-if="!showBadge" class="w-5 h-5" />
        <BellDot v-else class="w-5 h-5 text-primary" />
        <span v-if="showBadge" class="absolute -top-0.5 -right-0.5 flex h-4 w-4">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
          />
          <span
            class="relative inline-flex rounded-full h-4 w-4 bg-primary text-[10px] text-primary-foreground font-bold items-center justify-center"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </span>
        <span class="sr-only">Notificaciones</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="right" class="w-full sm:max-w-md flex flex-col">
      <SheetHeader class="pb-4 border-b">
        <SheetTitle class="flex items-center gap-2 text-lg">
          <BellDot class="w-5 h-5 text-primary" />
          Notificaciones
          <Badge v-if="showBadge" variant="secondary" class="ml-auto text-xs">
            {{ unreadCount }} nueva{{ unreadCount !== 1 ? 's' : '' }}
          </Badge>
        </SheetTitle>
      </SheetHeader>

      <ScrollArea class="flex-1 -mx-6 px-6">
        <div
          v-if="loading && logs.length === 0"
          class="py-8 text-center text-muted-foreground text-sm"
        >
          Cargando...
        </div>

        <div v-else-if="logs.length === 0" class="py-8 text-center text-muted-foreground">
          <Bell class="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p class="text-sm font-medium">No hay notificaciones</p>
          <p class="text-xs mt-1">Las notificaciones aparecerán aquí</p>
        </div>

        <div v-else class="divide-y">
          <div
            v-for="log in logs"
            :key="log.id"
            class="flex gap-3 py-4 transition hover:bg-muted/30 -mx-2 px-2 rounded-lg"
            :class="{
              'opacity-60':
                lastSeenId && logs.indexOf(log) >= logs.findIndex((l) => l.id === lastSeenId),
            }"
          >
            <div
              class="mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              :class="typeBadgeColor(log.type)"
            >
              <component :is="typeIcon(log.type)" class="w-4 h-4" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-semibold truncate">{{ log.title }}</p>
                <span class="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {{ formatDate(log.createdAt) }}
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-1 line-clamp-2">{{ log.message }}</p>
              <div class="flex gap-1.5 mt-2">
                <Badge variant="secondary" class="text-[10px] px-1.5 py-0">
                  {{ log.channel }}
                </Badge>
                <Badge variant="outline" class="text-[10px] px-1.5 py-0">
                  {{
                    log.type.startsWith('TASK_DUE:')
                      ? 'VENCIDA'
                      : log.type.startsWith('TASK_DUE_SOON:')
                        ? 'PRÓXIMA'
                        : log.type.startsWith('TASK_TIME_REACHED:')
                          ? 'INICIO'
                          : log.type.startsWith('TASK_COMPLETED')
                            ? 'COMPLETADA'
                            : log.type.startsWith('FRIEND_ACCEPTED')
                              ? 'AMISTAD'
                              : log.type
                  }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>
</template>
