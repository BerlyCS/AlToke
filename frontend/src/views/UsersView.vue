<template>
  <div class="w-full max-w-7xl mx-auto space-y-8">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
      <div>
        <div class="flex items-center gap-2 text-primary font-semibold">
          <Users class="w-5 h-5" />
          <span>Administra las cuentas</span>
        </div>
        <h1 class="text-5xl font-black tracking-tight mt-2">Usuarios</h1>
      </div>
    </div>

    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input v-model="searchQuery" type="text" placeholder="Buscar usuarios..."
          class="w-full pl-10 pr-4 py-2 rounded-xl bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
      </div>
      <Button variant="outline" size="sm" class="rounded-xl h-10">
        <Filter class="w-4 h-4" />
      </Button>
    </div>

    <div v-if="loading" class="gap-6">
      <div key="usersList" class="h-60 bg-muted/30 animate-pulse rounded-3xl"></div>
    </div>

    <div v-else class="space-y-12">
      <Card class="rounded-2xl shadow-xl border-border bg-card">
        <CardContent class="px-6">
          <div class="space-y-4">
            <div v-for="user in filteredUsers" :key="user.id"
              class="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition group">
              <div class="flex items-center gap-3">
                <Avatar
                  class="h-12 w-12 rounded-xl shadow-sm border border-primary-foreground/20 bg-primary-foreground/10 transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage class="rounded-xl" :src="user.avatarUrl || ''" alt="Avatar del usuario" />
                  <AvatarFallback class="rounded-xl font-bold text-primary bg-background">
                    {{
                      user.nickname?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      'US'
                    }}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p v-if="user.role == 'BANNED'" class="font-bold line-through">{{ user.nickname }}</p>
                  <p v-else class="font-semibold">{{ user.nickname }}</p>
                  <p class="text-xs text-muted-foreground">{{ user.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs px-2 py-1 rounded-full font-medium" :class="getRoleBadge(user.role)">
                  {{ user.role }}
                </span>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="viewUser(user)">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button v-if="user.role != 'BANNED'" variant="ghost" size="sm" class="h-8 w-8 p-0" @click="banUser(user.id)">
                    <CircleOff class="w-4 h-4" />
                  </Button>
                  <Button v-else variant="ghost" size="sm" class="h-8 w-8 p-0" @click="unBanUser(user.id)">
                    <UserRoundCheck class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-purple-500" @click="deleteUser(user.id)">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <ViewUserDialog v-model:open="showUserInfo" :user="selectedUser" @delete-task="deleteUser" />

</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Users,
  CircleOff,
  UserRoundCheck
} from 'lucide-vue-next'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { adminService } from '@/services/admin.service'
import type { UsersList, UserSummary } from '@/types'
import ViewUserDialog from '@/components/ViewUserDialog.vue'
import Avatar from '@/components/ui/avatar/Avatar.vue'
import AvatarImage from '@/components/ui/avatar/AvatarImage.vue'
import AvatarFallback from '@/components/ui/avatar/AvatarFallback.vue'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(true)
const showUserInfo = ref(false)
const searchQuery = ref('')
const usersList = ref<UsersList>()
const selectedUser = ref<UserSummary | null>(null)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return usersList.value?.users
  return usersList.value?.users.filter(user =>
    user.nickname.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(async () => {
  if (!authStore.token) {
    router.push('/')
    return
  }
  await fetchUsers()
})

async function fetchUsers() {
  try {
    loading.value = true
    usersList.value = await adminService.getUsers(10)
  } catch (error) {
    console.error('Error loading dashboard:', error)
    toast.error('Error al cargar el dashboard')
  } finally {
    loading.value = false
  }
}

function viewUser(user: UserSummary) {
  showUserInfo.value = true
  selectedUser.value = user
}

async function banUser(userId: string) {
  try {
    loading.value = true
    const response = await adminService.banUser(userId)
    fetchUsers()
    toast.success(response.message || 'Usuario baneado')
  } catch (error) {
    console.error('Error al banear al usuario:', error)
    toast.error('Error al banear al usuario')
  } finally {
    loading.value = false
  }
}

async function unBanUser(userId: string) {
  try {
    loading.value = true
    const response = await adminService.unBanUser(userId)
    fetchUsers()
    toast.success(response.message || 'Usuario reactivado')
  } catch (error) {
    console.error('Error al unbanear al usuario:', error)
    toast.error('Error al unbanear al usuario')
  } finally {
    loading.value = false
  }
}

function deleteUser(userId: string) {
  if (confirm('¿Estás seguro de eliminar este usuario?')) {
    toast.success('Usuario eliminado')
  }
}

function getRoleBadge(role: string) {
  const badges = {
    'USER': 'bg-green-500/10 text-green-500',
    'ADMIN': 'bg-purple-500/10 text-purple-500',
    'BANNED': 'bg-gray-500/10 text-gray-500'
  }
  return badges[role as keyof typeof badges] || 'bg-gray-500/10 text-gray-500'
}
</script>