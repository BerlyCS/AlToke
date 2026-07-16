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
        <CardContent class="p-6 pt-0">
          <div class="space-y-4">
            <div v-for="user in filteredUsers" :key="user.id"
              class="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {{ user.name.charAt(0) }}
                </div>
                <div>
                  <p class="font-semibold">{{ user.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ user.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs px-2 py-1 rounded-full font-medium" :class="getRoleBadge(user.role)">
                  {{ user.role }}
                </span>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="viewUser(user.id)">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="editUser(user.id)">
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-red-500" @click="deleteUser(user.id)">
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
  Edit
} from 'lucide-vue-next'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users } from '@lucide/vue'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(true)
const searchQuery = ref('')

const recentUsers = ref([
  { id: 1, name: 'Ana García', email: 'ana@empresa.com', role: 'Admin', tasks: 12, xp: 3420, joined: '2024-01-15' },
  { id: 2, name: 'Luis Fernández', email: 'luis@empresa.com', role: 'Jugador', tasks: 8, xp: 2150, joined: '2024-01-14' },
  { id: 3, name: 'María López', email: 'maria@empresa.com', role: 'Jugador', tasks: 4, xp: 890, joined: '2024-01-13' },
  { id: 4, name: 'Pedro Ramírez', email: 'pedro@empresa.com', role: 'Jugador', tasks: 15, xp: 5670, joined: '2024-01-12' },
  { id: 5, name: 'Laura Torres', email: 'laura@empresa.com', role: 'Jugador', tasks: 6, xp: 1450, joined: '2024-01-11' },
])

const filteredUsers = computed(() => {
  if (!searchQuery.value) return recentUsers.value
  return recentUsers.value.filter(user =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(async () => {
  if (!authStore.token) {
    router.push('/')
    return
  }
  await loadDashboardData()
})

async function loadDashboardData() {
  try {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Error loading dashboard:', error)
    toast.error('Error al cargar el dashboard')
  } finally {
    loading.value = false
  }
}

function viewUser(userId: number) {
  router.push(`/admin/users/${userId}`)
}

function editUser(userId: number) {
  router.push(`/admin/users/${userId}/edit`)
}

function deleteUser(userId: number) {
  if (confirm('¿Estás seguro de eliminar este usuario?')) {
    toast.success('Usuario eliminado')
  }
}

function getRoleBadge(role: string) {
  const badges = {
    'Jugador': 'bg-green-500/10 text-green-500',
    'Admin': 'bg-orange-500/10 text-orange-500'
  }
  return badges[role as keyof typeof badges] || 'bg-gray-500/10 text-gray-500'
}
</script>