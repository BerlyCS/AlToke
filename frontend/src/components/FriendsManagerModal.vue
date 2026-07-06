<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, UserPlus, Check, X, Clock, Users } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { friendshipService, type FriendProfile, type PendingRequest } from '@/services/friendship.service'
import { toast } from 'vue-sonner'

const open = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<FriendProfile[]>([])
const pendingRequests = ref<PendingRequest[]>([])

const fetchPendingRequests = async () => {
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
    searchResults.value = searchResults.value.filter(u => u.id !== userId)
  } catch (error: any) {
    toast.error(error.message || 'Error al enviar solicitud')
  }
}

const acceptRequest = async (friendshipId: string) => {
  try {
    await friendshipService.acceptRequest(friendshipId)
    toast.success('Solicitud aceptada')
    await fetchPendingRequests()
  } catch (error: any) {
    toast.error(error.message || 'Error al aceptar solicitud')
  }
}

const rejectRequest = async (friendshipId: string) => {
  try {
    await friendshipService.rejectRequest(friendshipId)
    toast.success('Solicitud rechazada')
    await fetchPendingRequests()
  } catch (error: any) {
    toast.error(error.message || 'Error al rechazar solicitud')
  }
}

// Fetch requests when modal opens
import { watch } from 'vue'
watch(open, (isOpen) => {
  if (isOpen) {
    fetchPendingRequests()
    searchQuery.value = ''
    searchResults.value = []
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger asChild>
      <Button variant="outline" class="gap-2">
        <Users class="w-4 h-4" />
        Añadir Amigos
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Gestionar Amigos</DialogTitle>
        <DialogDescription>
          Busca usuarios para agregarlos o revisa tus solicitudes pendientes.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 py-4">
        <!-- Search Section -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Buscar usuarios</h3>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre..."
                class="pl-9"
                @keyup.enter="handleSearch"
              />
            </div>
            <Button @click="handleSearch" :disabled="isSearching">
              Buscar
            </Button>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="space-y-3 mt-4">
            <div v-for="user in searchResults" :key="user.id" class="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div class="flex items-center gap-3">
                <img :src="user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nickname || 'Jugador'}`" class="w-10 h-10 rounded-full" />
                <div class="flex flex-col">
                  <span class="font-bold text-sm">{{ user.nickname || 'Usuario' }}</span>
                  <span class="text-xs text-muted-foreground">Nivel {{ user.level }}</span>
                </div>
              </div>
              <Button size="sm" variant="secondary" @click="sendRequest(user.id)">
                <UserPlus class="w-4 h-4 mr-1" /> Añadir
              </Button>
            </div>
          </div>
          <div v-else-if="searchQuery && !isSearching && searchResults.length === 0" class="text-center text-sm text-muted-foreground py-4">
            No se encontraron usuarios
          </div>
        </div>

        <!-- Pending Requests Section -->
        <div v-if="pendingRequests.length > 0" class="space-y-3">
          <h3 class="text-sm font-medium flex items-center gap-2">
            <Clock class="w-4 h-4" /> Solicitudes Pendientes ({{ pendingRequests.length }})
          </h3>
          <div class="space-y-2">
            <div v-for="req in pendingRequests" :key="req.id" class="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div class="flex items-center gap-3">
                <img :src="req.requester.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.requester.nickname || 'Jugador'}`" class="w-10 h-10 rounded-full" />
                <div class="flex flex-col">
                  <span class="font-bold text-sm">{{ req.requester.nickname || 'Usuario' }}</span>
                  <span class="text-xs text-muted-foreground">quiere ser tu amigo</span>
                </div>
              </div>
              <div class="flex gap-2">
                <Button size="icon" variant="default" class="h-8 w-8 rounded-full" @click="acceptRequest(req.id)">
                  <Check class="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" class="h-8 w-8 rounded-full" @click="rejectRequest(req.id)">
                  <X class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DialogContent>
  </Dialog>
</template>
