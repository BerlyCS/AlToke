<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import { Badge } from '@/components/ui/badge'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Input from '@/components/ui/input/Input.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import Label from '@/components/ui/label/Label.vue'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/user.service'
import {
  Bell,
  BellOff,
  RefreshCw,
  Save,
  Settings2,
  Sparkles,
  Trophy,
  UserRound,
  BadgeIcon,
  Flame,
  BellPlus,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import router from '@/router'
import { notificationService } from '@/services/notification.service'
import type { NotificationSettings, UserProfile } from '@/types'

const authStore = useAuthStore()

// Local editable state
const loading = ref(false)
const saving = ref(false)
const originalProfile = ref<UserProfile | null>(null)

const editProfile = ref({
  nickname: '',
  bio: '',
  avatarUrl: '',
})

const editPrivacy = ref({
  showLevel: true,
  showStreak: true,
  showAchievements: true,
})

const editNotification = ref({
  isMuted: false,
})

const notificationLoading = ref(false)
const browserPermission = ref(Notification.permission)

const hasNotificationChanges = computed(() => {
  return editNotification.value.isMuted !== (originalNotification.value?.isMuted ?? false)
})

const originalNotification = ref<NotificationSettings | null>(null)

async function requestBrowserPermission() {
  if (!('Notification' in window)) return
  const result = await Notification.requestPermission()
  browserPermission.value = result
}

const avatarSeed = ref<string>('')

const hasProfileChanges = computed(() => {
  return (
    editProfile.value.nickname !== originalProfile.value?.nickname ||
    editProfile.value.bio !== originalProfile.value.bio ||
    editProfile.value.avatarUrl !== originalProfile.value.avatarUrl
  )
})

const hasPrivacyChanges = computed(() => {
  return (
    editPrivacy.value.showLevel !== originalProfile.value?.privacy?.showLevel ||
    editPrivacy.value.showStreak !== originalProfile.value.privacy.showStreak ||
    editPrivacy.value.showAchievements !== originalProfile.value.privacy.showAchievements
  )
})

const hasChanges = computed(() => hasProfileChanges.value || hasPrivacyChanges.value)

function buildAvatarUrl(seed: string) {
  const s = encodeURIComponent(seed || '')
  return `https://api.dicebear.com/10.x/bottts-neutral/svg?seed=${s}`
}

function randomSeed() {
  const arr = new Uint32Array(3)
  crypto.getRandomValues(arr)
  avatarSeed.value = Array.from(arr)
    .map((n) => n.toString(36))
    .join('-')
  editProfile.value.avatarUrl = buildAvatarUrl(avatarSeed.value)
}

onMounted(async () => {
  if (!authStore.token) {
    router.push('/login')
    return
  }
  await getProfile()
  await getNotificationSettings()
})

async function getProfile() {
  try {
    loading.value = true
    originalProfile.value = await userService.getProfile()
    editProfile.value.nickname = originalProfile.value.nickname ?? ''
    editProfile.value.bio = originalProfile.value.bio ?? ''
    editProfile.value.avatarUrl = originalProfile.value.avatarUrl ?? ''
    editPrivacy.value.showLevel = originalProfile.value.privacy?.showLevel ?? true
    editPrivacy.value.showStreak = originalProfile.value.privacy?.showStreak ?? true
    editPrivacy.value.showAchievements = originalProfile.value.privacy?.showAchievements ?? true
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function getNotificationSettings() {
  try {
    notificationLoading.value = true
    originalNotification.value = await notificationService.getSettings()
    editNotification.value.isMuted = originalNotification.value.isMuted
  } catch (e) {
    console.error(e)
  } finally {
    notificationLoading.value = false
  }
}

async function saveNotificationChanges() {
  try {
    const updated = await notificationService.updateSettings({
      isMuted: editNotification.value.isMuted,
    })
    originalNotification.value = updated
    toast.success('Preferencias de notificación guardadas')
  } catch (e: any) {
    toast.error('Error al guardar preferencias', {
      description: e?.message || 'Por favor, inténtalo de nuevo.',
    })
  }
}

async function saveChanges() {
  if (!hasChanges.value && !hasNotificationChanges.value) return

  try {
    if (hasProfileChanges.value && originalProfile.value) {
      const updatedProfile = {
        ...originalProfile.value,
        nickname: editProfile.value.nickname,
        bio: editProfile.value.bio || undefined,
        avatarUrl: editProfile.value.avatarUrl,
        privacy: {
          showLevel: editPrivacy.value.showLevel,
          showStreak: editPrivacy.value.showStreak,
          showAchievements: editPrivacy.value.showAchievements,
        },
      }
      await userService.updateProfile(updatedProfile)
      await getProfile()
      authStore.updateProfile(updatedProfile)
    }

    if (hasNotificationChanges.value) {
      await saveNotificationChanges()
    }

    toast.success('Cambios guardados exitosamente')
  } catch (e: any) {
    console.error(e)
    toast.error('Error al guardar los cambios', {
      description: e?.message || 'Por favor, inténtalo de nuevo.',
    })
  } finally {
    saving.value = false
  }
}
</script>
<template>
  <div class="w-full max-w-7xl mx-auto space-y-8">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div>
        <div class="flex items-center gap-2 text-primary font-semibold">
          <Sparkles class="w-5 h-5" />
          <span>Personaliza tu experiencia</span>
        </div>

        <h1 class="text-5xl font-black tracking-tight mt-2">Configuración</h1>
      </div>

      <Button
        class="h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg flex items-center gap-3 hover:scale-[1.02] transition duration-300"
        @click="saveChanges"
        :loading="saving"
        :disabled="loading || saving || !hasChanges"
      >
        <Save class="w-5 h-5" />
        Guardar Cambios
      </Button>
    </div>

    <div class="grid xl:grid-cols-3 gap-6">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="flex items-center gap-2">
            <UserRound class="w-5 h-5 text-primary" />
            Avatar
          </CardTitle>
        </CardHeader>

        <CardContent class="space-y-5 px-5">
          <div class="flex flex-col items-center">
            <div class="relative rounded-3xl overflow-hidden border-4 border-primary/20 shadow-xl">
              <img
                :src="editProfile.avatarUrl"
                alt="Avatar"
                class="w-38 h-38 object-cover bg-background"
              />
              <Button
                size="icon"
                class="absolute bottom-1 right-1 rounded-full shadow-lg"
                @click="randomSeed"
              >
                <RefreshCw class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div class="space-y-5">
            <div>
              <Label htmlFor="nickname">Apodo</Label>
              <Input
                id="nickname"
                v-model="editProfile.nickname"
                class="mt-2"
                placeholder="Ingresa tu apodo"
              />
            </div>

            <div>
              <Label for="bio"> Descripción </Label>
              <Textarea
                id="bio"
                v-model="editProfile.bio"
                class="mt-2 resize-none"
                rows="4"
                placeholder="Cuéntanos algo sobre ti..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="xl:col-span-2 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300"
      >
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Settings2 class="w-5 h-5 text-primary" />
            Preferencias
          </CardTitle>
        </CardHeader>

        <CardContent class="space-y-5">
          <div
            class="flex items-center justify-between rounded-2xl border p-5 hover:bg-muted/40 transition"
          >
            <div class="flex gap-4 items-start">
              <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <BadgeIcon class="w-5 h-5 text-primary" />
              </div>

              <div>
                <h3 class="font-semibold">Mostrar nivel</h3>
                <p class="text-sm text-muted-foreground">
                  Los demás usuarios podrán ver tu nivel actual.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Label for="show-level" class="sr-only">Mostrar nivel</Label>
              <input
                id="show-level"
                type="checkbox"
                v-model="editPrivacy.showLevel"
                class="h-5 w-5"
              />
            </div>
          </div>

          <div
            class="flex items-center justify-between rounded-2xl border p-5 hover:bg-muted/40 transition"
          >
            <div class="flex gap-4 items-start">
              <div class="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Flame class="w-5 h-5 text-orange-500" />
              </div>

              <div>
                <h3 class="font-semibold">Mostrar racha</h3>
                <p class="text-sm text-muted-foreground">
                  Comparte la cantidad de días consecutivos que llevas activo.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Label for="show-streak" class="sr-only">Mostrar racha</Label>
              <input
                id="show-streak"
                type="checkbox"
                v-model="editPrivacy.showStreak"
                class="h-5 w-5"
              />
            </div>
          </div>

          <div
            class="flex items-center justify-between rounded-2xl border p-5 hover:bg-muted/40 transition"
          >
            <div class="flex gap-4 items-start">
              <div class="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Trophy class="w-5 h-5 text-yellow-500" />
              </div>

              <div>
                <h3 class="font-semibold">Mostrar logros</h3>
                <p class="text-sm text-muted-foreground">
                  Permite que otros usuarios vean tus insignias obtenidas.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Label for="show-achievements" class="sr-only">Mostrar logros</Label>
              <input
                id="show-achievements"
                type="checkbox"
                v-model="editPrivacy.showAchievements"
                class="h-5 w-5"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Bell class="w-5 h-5 text-primary" />
          Notificaciones
        </CardTitle>
        <p class="text-sm text-muted-foreground">
          Recibe notificaciones dentro de la aplicación y en tu navegador.
        </p>
      </CardHeader>

      <CardContent class="space-y-5">
        <div
          class="flex items-center justify-between rounded-2xl border p-5 hover:bg-muted/40 transition"
        >
          <div class="flex gap-4 items-start">
            <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell class="w-5 h-5 text-primary" />
            </div>

            <div>
              <h3 class="font-semibold">Notificaciones en la app</h3>
              <p class="text-sm text-muted-foreground">
                Recibe alertas de tareas, amigos y sistema directamente en la aplicación.
              </p>
            </div>
          </div>

          <Badge variant="secondary" class="text-xs"> Siempre activo </Badge>
        </div>

        <div
          class="flex items-center justify-between rounded-2xl border p-5 hover:bg-muted/40 transition"
        >
          <div class="flex gap-4 items-start">
            <div class="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <BellPlus class="w-5 h-5 text-orange-500" />
            </div>

            <div>
              <h3 class="font-semibold">Notificaciones del navegador</h3>
              <p class="text-sm text-muted-foreground">
                Recibe notificaciones incluso cuando no estés en la página.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button
              v-if="browserPermission === 'default'"
              size="sm"
              variant="outline"
              @click="requestBrowserPermission"
            >
              Activar
            </Button>
            <Badge v-else-if="browserPermission === 'granted'" variant="secondary" class="text-xs">
              Activado
            </Badge>
            <Badge v-else variant="destructive" class="text-xs"> Bloqueado </Badge>
          </div>
        </div>

        <div
          class="flex items-center justify-between rounded-2xl border p-5 hover:bg-muted/40 transition"
        >
          <div class="flex gap-4 items-start">
            <div class="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
              <BellOff class="w-5 h-5 text-red-500" />
            </div>

            <div>
              <h3 class="font-semibold">Modo silencio</h3>
              <p class="text-sm text-muted-foreground">
                Desactiva temporalmente todas las notificaciones de la plataforma.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Label for="is-muted" class="sr-only">Modo silencio</Label>
            <input
              id="is-muted"
              type="checkbox"
              v-model="editNotification.isMuted"
              class="h-5 w-5"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
