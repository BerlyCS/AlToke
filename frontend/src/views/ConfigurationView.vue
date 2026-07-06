<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/user.service'
import {
  RefreshCw,
  Save,
  Settings2,
  Sparkles,
  Trophy,
  UserRound,
  BadgeIcon,
  Flame,
} from 'lucide-vue-next'
import router from '@/router'
import type { UserProfile } from '@/types'

const authStore = useAuthStore()

// Local editable state
const loading = ref(false)
const profile = ref<UserProfile | null>(null)

const edition = ref({
  nickname: '',
  bio: '',
  avatarUrl: '',
  showLevel: true,
  showStreak: true,
  showAchievements: true,
})

const avatarSeed = ref<string>('')

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
  edition.value.avatarUrl = buildAvatarUrl(avatarSeed.value)
}

onMounted(async () => {
  if (!authStore.token) {
    router.push('/login')
    return
  }
  await getProfile()
})

async function getProfile() {
  try {
    loading.value = true
    profile.value = await userService.getProfile()
    edition.value.nickname = profile.value.nickname ?? ''
    edition.value.bio = profile.value.bio ?? ''
    edition.value.avatarUrl = profile.value.avatarUrl ?? ''
    edition.value.showLevel = profile.value.privacy?.showLevel ?? true
    edition.value.showStreak = profile.value.privacy?.showStreak ?? true
    edition.value.showAchievements = profile.value.privacy?.showAchievements ?? true
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function saveChanges() {
  try {
    if (!profile.value) throw new Error('No profile loaded')
    const updatedProfile: UserProfile = {
      ...profile.value,
      nickname: edition.value.nickname,
      bio: edition.value.bio,
      avatarUrl: edition.value.avatarUrl,
      privacy: {
        showLevel: edition.value.showLevel,
        showStreak: edition.value.showStreak,
        showAchievements: edition.value.showAchievements,
      },
    }
    await userService.updateProfile(updatedProfile)
    await getProfile()
    authStore.updateProfile(updatedProfile)
    alert('Cambios guardados exitosamente.')
  } catch (e) {
    console.error(e)
    alert('Error al guardar los cambios. Por favor, inténtalo de nuevo.')
  } finally {
    loading.value = false
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
        :loading="loading"
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
                :src="edition.avatarUrl"
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
                v-model="edition.nickname"
                class="mt-2"
                placeholder="Ingresa tu apodo"
              />
            </div>

            <div>
              <Label for="bio"> Descripción </Label>
              <Input
                id="bio"
                v-model="edition.bio"
                class="mt-2"
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

            <input type="checkbox" v-model="edition.showLevel" class="h-5 w-5" />
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

            <input type="checkbox" v-model="edition.showStreak" class="h-5 w-5" />
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

            <input type="checkbox" v-model="edition.showAchievements" class="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
