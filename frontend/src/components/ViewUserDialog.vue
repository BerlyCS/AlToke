<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Mail,
  Shield,
  TrendingUp,
  Award,
  Calendar,
  Trash2,
  Edit,
} from 'lucide-vue-next'
import type { UserSummary } from '@/types'

defineProps<{
  open: boolean
  user: UserSummary | null
}>()

defineEmits(['update:open', 'delete-task', 'edit-task', 'toggle-status'])

// Funciones de utilidad
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getRoleBadgeVariant(role: string): string {
  const variants: Record<string, string> = {
    ADMIN: 'destructive',
    MODERATOR: 'warning',
    USER: 'default',
  }
  return variants[role] || 'default'
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'ADMINISTRADOR',
    USER: 'USUARIO',
  }
  return labels[role] || role
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getLevelColor(level: number): string {
  if (level >= 80) return 'text-purple-500 bg-purple-50 dark:bg-purple-500/10'
  if (level >= 60) return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
  if (level >= 40) return 'text-green-500 bg-green-50 dark:bg-green-500/10'
  if (level >= 20) return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10'
  return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10'
}

function getLevelLabel(level: number): string {
  if (level >= 80) return 'Experto'
  if (level >= 60) return 'Avanzado'
  if (level >= 40) return 'Intermedio'
  if (level >= 20) return 'Principiante'
  return 'Novato'
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent
      v-if="user"
      class="sm:max-w-2xl border-border bg-background p-0 overflow-hidden shadow-2xl"
    >
      <DialogHeader class="px-6 py-6 border-b border-border bg-linear-to-br from-primary/5 to-transparent">
        <div class="flex items-start gap-4">
          <Avatar class="w-20 h-20 ring-4 ring-primary/10 shadow-xl shrink-0">
            <AvatarImage 
              :src="user.avatar" 
              :alt="user.nickname"
              class="object-cover"
            />
            <AvatarFallback class="text-2xl font-bold bg-primary/10 text-primary">
              {{ getInitials(user.nickname) }}
            </AvatarFallback>
          </Avatar>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4">
              <div>
                <DialogTitle class="text-2xl font-bold leading-tight text-foreground truncate">
                  {{ user.nickname }}
                </DialogTitle>
                <p class="text-xs text-muted-foreground font-medium">Activo hace: {{ formatDate(user.lastActiveAt) }}</p>
                
                <div class="flex flex-wrap items-center gap-2 my-2">
                  <Badge :variant="getRoleBadgeVariant(user.role)" class="font-medium">
                    <Shield class="w-3 h-3 mr-1" />
                    {{ getRoleLabel(user.role) }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea class="max-h-150 px-6 py-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Información Personal
            </h4>
            
            <div class="space-y-3">
              <div class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <Mail class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground font-medium">Correo electrónico</p>
                  <p class="text-sm font-semibold text-foreground truncate mt-1">{{ user.email }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <Calendar class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground font-medium">Fecha de registro</p>
                  <p class="text-sm font-semibold text-foreground mt-1">{{ formatDate(user.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Estadísticas
            </h4>
            
            <div class="space-y-3">
              <div class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <TrendingUp class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground font-medium">Nivel</p>
                  <p class="text-sm font-semibold text-foreground mt-1">{{ user.level }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <Award class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground font-medium">Experiencia (XP)</p>
                  <p class="text-sm font-semibold text-foreground mt-1">{{ user.xp.toLocaleString() }} XP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>