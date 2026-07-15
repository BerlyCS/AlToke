<template>
    <component :is="dashboardComponent" />
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const AdminDashboard = defineAsyncComponent(() => 
  import('./AdminDashboard.vue')
)
const UserDashboard = defineAsyncComponent(() => 
  import('./UserDashboard.vue')
)

// Mapeo de tipos de usuario a componentes
const dashboardComponent = computed(() => {
  const userType = authStore.profile?.role
  
  const dashboardMap = {
    'ADMIN': AdminDashboard,
    'USER': UserDashboard,
  }
  
  return dashboardMap[userType as keyof typeof dashboardMap] || UserDashboard
})
</script>