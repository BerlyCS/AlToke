<script setup lang="ts">
import { computed } from 'vue'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Home, ListTodo, Trophy, Medal, Users, Settings, Calendar } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import logoUrl from '@/assets/images/logo.webp'

const authStore = useAuthStore()
const route = useRoute()

const menuItems = [
  { title: 'Dashboard', icon: Home, url: '/dashboard' },
  { title: 'Mis tareas', icon: ListTodo, url: '/tasks' },
  { title: 'Calendario', icon: Calendar, url: '/calendar' },
  { title: 'Ranking', icon: Trophy, url: '/ranking' },
  { title: 'Logros', icon: Medal, url: '/logros' },
  { title: 'Amigos', icon: Users, url: '/amigos' },
  { title: 'Configuración', icon: Settings, url: '/configuracion' },
]

const userXp = computed(() => authStore.profile?.xp || 0)
const currentLevel = computed(() => authStore.profile?.level || 1)
const currentLevelBaseXp = computed(() => currentLevel.value === 1 ? 0 : Math.pow(currentLevel.value, 2) * 25)
const nextLevelXp = computed(() => Math.pow(currentLevel.value + 1, 2) * 25)
const xpProgress = computed(() => {
  const current = userXp.value - currentLevelBaseXp.value;
  const target = nextLevelXp.value - currentLevelBaseXp.value;
  return Math.max(0, Math.min(100, (current / target) * 100));
})
</script>

<template>
  <Sidebar variant="inset">
    <SidebarHeader class="py-6 px-4 flex justify-center">
      <img :src="logoUrl" alt="AlToke Logo" class="h-20 w-auto object-contain mx-auto" />
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu class="gap-2 px-2">
            <SidebarMenuItem v-for="item in menuItems" :key="item.title">
              <SidebarMenuButton
                as-child
                :class="[
                  'py-6 px-4 rounded-xl transition-all duration-300 ease-out group',
                  route.path === item.url
                    ? 'bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 hover:text-primary-foreground hover:shadow-lg'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1 font-medium',
                ]"
              >
                <router-link :to="item.url" class="flex items-center gap-4 w-full">
                  <component
                    :is="item.icon"
                    class="w-6 h-6 shrink-0 transition-transform duration-300 group-hover:scale-110"
                    :class="
                      route.path === item.url
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground group-hover:text-primary'
                    "
                  />
                  <span class="text-base transition-colors">{{ item.title }}</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="p-4">
      <div
        class="flex flex-col gap-4 p-4 bg-primary text-primary-foreground rounded-2xl shadow-lg border-none hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <Avatar
            class="h-12 w-12 rounded-xl shadow-sm border border-primary-foreground/20 bg-primary-foreground/10 transition-transform duration-300 group-hover:scale-105"
          >
            <AvatarImage :src="authStore.profile?.avatarUrl || ''" alt="Avatar del usuario" />
            <AvatarFallback class="rounded-xl font-bold text-primary bg-background">
              {{
                authStore.profile?.nickname?.charAt(0)?.toUpperCase() ||
                authStore.profile?.email?.charAt(0)?.toUpperCase() ||
                'US'
              }}
            </AvatarFallback>
          </Avatar>

          <div class="flex flex-col min-w-0">
            <span class="font-bold text-base truncate">{{
              authStore.profile?.nickname || 'Jugador'
            }}</span>
            <span class="text-sm text-primary-foreground/80 font-bold">Nivel {{ currentLevel }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-2 mt-1">
          <div
            class="flex justify-between text-xs font-black uppercase tracking-wider text-primary-foreground/90"
          >
            <span>XP</span>
            <span>{{ userXp }} / {{ nextLevelXp }}</span>
          </div>
          <Progress
            :model-value="xpProgress"
            class="h-3 rounded-full bg-primary-foreground/20 overflow-hidden"
          />
        </div>
      </div>
    </SidebarFooter>
  </Sidebar>
</template>

<style scoped>
:deep([role='progressbar'] > div) {
  background-color: var(--primary-foreground) !important;
}
</style>
