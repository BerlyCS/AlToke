<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Shield, TrendingUp, Award, Calendar, User } from 'lucide-vue-next'
import type { UserSummary } from '@/types'

defineProps<{
  open: boolean
  user: UserSummary | null
}>()

defineEmits(['update:open', 'delete-task', 'edit-task', 'toggle-status'])

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getColorByRole = (role: string) => {
  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    USER: 'bg-green-500/10 text-green-500 border-green-500/20',
    BANNED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  }

  return roleColors[role] || roleColors['USER']
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'ADMINISTRADOR',
    USER: 'USUARIO',
    BANNED: 'BANEADO',
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
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent
      v-if="user"
      class="sm:max-w-2xl border-border bg-background p-0 overflow-hidden shadow-2xl"
    >
      <DialogHeader
        class="px-6 py-6 border-b border-border bg-linear-to-br from-primary/5 to-transparent"
      >
        <div class="flex items-start gap-4">
          <Avatar
            class="w-20 h-20 shadow-sm border border-primary-foreground/20 shrink-0 rounded-xl"
          >
            <AvatarImage :src="user.avatarUrl || ''" :alt="user.nickname" class="rounded-xl" />
            <AvatarFallback class="text-2xl font-bold bg-primary/10 text-primary rounded-xl">
              {{ getInitials(user.nickname) }}
            </AvatarFallback>
          </Avatar>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4">
              <div>
                <DialogTitle class="text-2xl font-bold leading-tight text-foreground truncate">
                  {{ user.nickname }}
                </DialogTitle>
                <p class="text-xs text-muted-foreground font-medium">
                  Activo hace: {{ formatDate(user.lastActiveAt) }}
                </p>

                <div class="flex flex-wrap items-center gap-2 my-2">
                  <div
                    class="font-bold text-xs px-2 py-1 rounded-full bg-accent/10 text-accent flex items-center gap-1"
                    :class="getColorByRole(user.role)"
                  >
                    <Shield class="w-4 h-4" />
                    {{ getRoleLabel(user.role) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea class="max-h-150 px-6 py-4">
        <div v-if="user.bio" class="space-y-4 mb-5">
          <h4 class="flex text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <User class="w-4 h-4 text-muted-foreground mr-2" />
            Descripción Personal
          </h4>

          <div class="space-y-3">
            <div
              class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <p class="text-sm font-semibold text-foreground truncate mt-1">{{ user.bio }}</p>
            </div>
          </div>
        </div>

        <div v-if="user.role == 'ADMIN'" class="grid grid-cols-1 gap-6">
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Información Personal
            </h4>

            <div class="space-y-3">
              <div
                class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Mail class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground font-medium">Correo electrónico</p>
                  <p class="text-sm font-semibold text-foreground truncate mt-1">
                    {{ user.email }}
                  </p>
                </div>
              </div>

              <div
                class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Calendar class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground font-medium">Fecha de registro</p>
                  <p class="text-sm font-semibold text-foreground mt-1">
                    {{ formatDate(user.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Información Personal
            </h4>

            <div class="space-y-3">
              <div
                class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Mail class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground font-medium">Correo electrónico</p>
                  <p class="text-sm font-semibold text-foreground truncate mt-1">
                    {{ user.email }}
                  </p>
                </div>
              </div>

              <div
                class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Calendar class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground font-medium">Fecha de registro</p>
                  <p class="text-sm font-semibold text-foreground mt-1">
                    {{ formatDate(user.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Estadísticas
            </h4>

            <div class="space-y-3">
              <div
                class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <TrendingUp class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground font-medium">Nivel</p>
                  <p class="text-sm font-semibold text-foreground mt-1">{{ user.level }}</p>
                </div>
              </div>

              <div
                class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Award class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground font-medium">Experiencia (XP)</p>
                  <p class="text-sm font-semibold text-foreground mt-1">
                    {{ user.xp.toLocaleString() }} XP
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>
