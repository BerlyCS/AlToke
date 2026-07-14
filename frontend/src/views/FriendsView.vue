<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  Clock,
  Trash2,
  Zap,
  Flame,
  UserMinus,
} from 'lucide-vue-next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import UserProfileDialog from '@/components/UserProfileDialog.vue'
import {
  friendshipService,
  type FriendProfile,
  type PendingRequest,
  type FriendshipEntry,
} from '@/services/friendship.service'
import type { LeaderboardEntry } from '@/types'
import { toast } from 'vue-sonner'

const friends = ref<FriendshipEntry[]>([])
const pendingRequests = ref<PendingRequest[]>([])
const searchResults = ref<FriendProfile[]>([])
const searchQuery = ref('')

const selectedUser = ref<LeaderboardEntry | null>(null)
const isProfileOpen = ref(false)

const openProfileFromFriend = (friend: FriendProfile) => {
  selectedUser.value = {
    userId: friend.id,
    nickname: friend.nickname,
    avatarUrl: friend.avatarUrl,
    currentLevel: friend.level,
    streakCount: friend.currentStreak ?? 0,
    maxStreak: friend.currentStreak ?? 0,
    totalXp: 0,
    rank: 0,
  }
  isProfileOpen.value = true
}

const loadingFriends = ref(true)
const isSearching = ref(false)

const loadFriends = async () => {
  loadingFriends.value = true
  try {
    friends.value = await friendshipService.getFriends()
  } catch (error) {
    console.error('Failed to load friends', error)
  } finally {
    loadingFriends.value = false
  }
}

const loadPendingRequests = async () => {
  try {
    pendingRequests.value = await friendshipService.getPendingRequests()
  } catch (error) {
    console.error('Failed to load pending requests', error)
  }
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    searchResults.value = await friendshipService.searchUsers(searchQuery.value)
  } catch (error) {
    console.error('Search failed', error)
  } finally {
    isSearching.value = false
  }
}

const sendRequest = async (userId: string) => {
  try {
    await friendshipService.sendRequest(userId)
    toast.success('Solicitud de amistad enviada')
    searchResults.value = searchResults.value.filter((u) => u.id !== userId)
  } catch (error: any) {
    toast.error(error.message || 'Error al enviar solicitud')
  }
}

const acceptRequest = async (friendshipId: string) => {
  try {
    await friendshipService.acceptRequest(friendshipId)
    toast.success('Solicitud aceptada')
    await Promise.all([loadPendingRequests(), loadFriends()])
  } catch (error: any) {
    toast.error(error.message || 'Error al aceptar solicitud')
  }
}

const rejectRequest = async (friendshipId: string) => {
  try {
    await friendshipService.rejectRequest(friendshipId)
    toast.success('Solicitud rechazada')
    await loadPendingRequests()
  } catch (error: any) {
    toast.error(error.message || 'Error al rechazar solicitud')
  }
}

const removeFriend = async (friendshipId: string) => {
  if (!confirm('¿Estás seguro de que deseas eliminar a este amigo?')) return
  try {
    await friendshipService.removeFriend(friendshipId)
    toast.success('Amigo eliminado')
    await loadFriends()
  } catch (error: any) {
    toast.error(error.message || 'Error al eliminar amigo')
  }
}

onMounted(() => {
  loadFriends()
  loadPendingRequests()
})
</script>

<template>
  <div
    class="h-full flex flex-col p-4 md:p-8 overflow-y-auto w-full max-w-5xl mx-auto space-y-8 pb-20"
  >
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h1 class="text-4xl font-black tracking-tight flex items-center gap-3">
          Amigos <Users class="w-8 h-8 text-primary" />
        </h1>
        <p class="text-muted-foreground mt-2 text-lg">
          Gestiona tus amistades y descubre nuevos compañeros de productividad.
        </p>
      </div>
    </div>

    <Tabs defaultValue="friends" class="w-full">
      <TabsList class="inline-flex h-12 w-fit bg-muted/50 p-1 rounded-xl">
        <TabsTrigger value="friends" class="rounded-lg font-semibold h-full px-6"
          >Mis Amigos</TabsTrigger
        >
        <TabsTrigger value="requests" class="rounded-lg font-semibold relative h-full px-6">
          Solicitudes
          <span
            v-if="pendingRequests.length > 0"
            class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"
          ></span>
        </TabsTrigger>
        <TabsTrigger value="search" class="rounded-lg font-semibold h-full px-6"
          >Añadir</TabsTrigger
        >
      </TabsList>

      <!-- Mis Amigos Tab -->
      <TabsContent value="friends" class="mt-8">
        <div v-if="loadingFriends" class="flex justify-center p-12">
          <div
            class="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"
          ></div>
        </div>

        <div
          v-else-if="friends.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <Card
            v-for="entry in friends"
            :key="entry.friendshipId"
            @click="openProfileFromFriend(entry.friend)"
            class="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div class="h-16 bg-gradient-to-r from-primary/20 to-primary/5"></div>
            <CardContent class="p-6 pt-0 relative">
              <div class="flex justify-between items-start">
                <div class="-mt-8 relative mb-3">
                  <img
                    :src="
                      entry.friend.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.friend.nickname || 'Amigo'}`
                    "
                    class="w-16 h-16 rounded-full border-4 border-card bg-muted object-cover shadow-sm"
                  />
                </div>
                <div class="mt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    @click.stop="removeFriend(entry.friendshipId)"
                    title="Eliminar amigo"
                  >
                    <UserMinus class="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 class="font-bold text-lg line-clamp-1">
                {{ entry.friend.nickname || 'Anónimo' }}
              </h3>
              <div class="flex items-center gap-4 mt-4">
                <div class="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                  <Zap class="w-4 h-4 text-yellow-500" /> Nvl {{ entry.friend.level }}
                </div>
                <div class="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                  <Flame class="w-4 h-4 text-orange-500" />
                  {{ entry.friend.currentStreak || 0 }} días
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div v-else class="text-center py-20 px-4">
          <div
            class="bg-muted/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Users class="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 class="text-xl font-bold mb-2">Aún no tienes amigos</h3>
          <p class="text-muted-foreground mb-6 max-w-md mx-auto">
            Añade a tus amigos para competir en el ranking y mantener la motivación juntos.
          </p>
          <Button @click="$el.querySelector('[value=search]').click()" class="gap-2 font-bold">
            <Search class="w-4 h-4" /> Buscar usuarios
          </Button>
        </div>
      </TabsContent>

      <!-- Solicitudes Tab -->
      <TabsContent value="requests" class="mt-8">
        <Card class="border-none shadow-md">
          <CardHeader>
            <CardTitle>Solicitudes Pendientes</CardTitle>
            <CardDescription>Personas que quieren ser tus amigos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="pendingRequests.length > 0" class="space-y-4">
              <div
                v-for="req in pendingRequests"
                :key="req.id"
                @click="openProfileFromFriend(req.requester)"
                class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-muted/10 hover:bg-muted/30 transition-colors gap-4 cursor-pointer"
              >
                <div class="flex items-center gap-4">
                  <img
                    :src="
                      req.requester.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.requester.nickname || 'Jugador'}`
                    "
                    class="w-12 h-12 rounded-full border bg-background"
                  />
                  <div class="flex flex-col">
                    <span class="font-bold text-base">{{
                      req.requester.nickname || 'Usuario'
                    }}</span>
                    <span class="text-sm text-muted-foreground flex items-center gap-1">
                      <Zap class="w-3 h-3 text-yellow-500" /> Nivel {{ req.requester.level }}
                    </span>
                  </div>
                </div>
                <div class="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="default"
                    class="flex-1 sm:flex-none gap-2"
                    @click.stop="acceptRequest(req.id)"
                  >
                    <Check class="w-4 h-4" /> Aceptar
                  </Button>
                  <Button
                    variant="outline"
                    class="flex-1 sm:flex-none gap-2 hover:text-destructive hover:bg-destructive/10"
                    @click.stop="rejectRequest(req.id)"
                  >
                    <X class="w-4 h-4" /> Rechazar
                  </Button>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <Clock class="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p class="text-muted-foreground font-medium">No tienes solicitudes pendientes.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Añadir Tab -->
      <TabsContent value="search" class="mt-8">
        <div class="max-w-2xl mx-auto space-y-8">
          <div class="relative">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            />
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar usuarios por nombre..."
              class="pl-12 h-14 text-lg rounded-2xl bg-card border-muted-foreground/20 shadow-sm"
              @keyup.enter="handleSearch"
            />
            <Button
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-6 font-bold"
              @click="handleSearch"
              :disabled="isSearching"
            >
              Buscar
            </Button>
          </div>

          <div v-if="searchResults.length > 0" class="space-y-4">
            <h3 class="font-bold text-lg px-2">Resultados ({{ searchResults.length }})</h3>
            <div class="grid gap-4">
              <div
                v-for="user in searchResults"
                :key="user.id"
                @click="openProfileFromFriend(user)"
                class="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div class="flex items-center gap-4">
                  <img
                    :src="
                      user.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nickname || 'Jugador'}`
                    "
                    class="w-12 h-12 rounded-full border bg-muted"
                  />
                  <div class="flex flex-col">
                    <span class="font-bold text-base">{{ user.nickname || 'Usuario' }}</span>
                    <span class="text-sm text-muted-foreground flex items-center gap-1">
                      <Zap class="w-3 h-3 text-yellow-500" /> Nivel {{ user.level }}
                    </span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  class="gap-2 font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                  @click.stop="sendRequest(user.id)"
                >
                  <UserPlus class="w-4 h-4" /> Añadir
                </Button>
              </div>
            </div>
          </div>

          <div
            v-else-if="searchQuery && !isSearching && searchResults.length === 0"
            class="text-center py-12 bg-muted/20 rounded-2xl border border-dashed"
          >
            <Search class="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 class="font-bold text-lg mb-1">Sin resultados</h3>
            <p class="text-muted-foreground">
              No encontramos a ningún usuario llamado "{{ searchQuery }}".
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>

    <UserProfileDialog v-if="selectedUser" :user="selectedUser" v-model:open="isProfileOpen">
      <span class="hidden"></span>
    </UserProfileDialog>
  </div>
</template>
