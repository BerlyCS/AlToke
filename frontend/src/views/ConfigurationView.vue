<script lang="ts" setup>
import { ref, computed } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import { useAuthStore } from '@/stores/auth'
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

const authStore = useAuthStore()

// Local editable state
const nickname = ref<string>(authStore.user?.nickname ?? '')
const avatarSeed = ref<string>('')
let showLevel = false
let showStreak = false
let showAchievements = false

function buildAvatarUrl(seed: string) {
  const s = encodeURIComponent(seed || '')
  return `https://api.dicebear.com/10.x/bottts-neutral/svg?seed=${s}`
}

const avatarPreviewUrl = computed(() => {
  if (avatarSeed.value) return buildAvatarUrl(avatarSeed.value)
  if (authStore.user?.avatarUrl) return authStore.user.avatarUrl
  // fallback deterministic default
  return buildAvatarUrl(authStore.user?.id ?? authStore.user?.email ?? 'guest')
})

function randomSeed() {
  const arr = new Uint32Array(3)
  crypto.getRandomValues(arr)
  avatarSeed.value = Array.from(arr)
    .map((n) => n.toString(36))
    .join('-')
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
                :src="avatarPreviewUrl"
                alt="Avatar"
                class="w-38 h-38 object-cover bg-background"
              />
              <Button
                size="icon"
                class="absolute bottom-3 right-3 rounded-full shadow-lg"
                @click="randomSeed"
              >
                <RefreshCw class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div class="space-y-5">
            <div>
              <Label htmlFor="nickname">Apodo</Label>
              <Input id="nickname" v-model="nickname" class="mt-2" placeholder="Ingresa tu apodo" />
            </div>

            <div>
              <Label for="bio"> Descripción </Label>
              <Input id="bio" class="mt-2" placeholder="Cuéntanos algo sobre ti..." />
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

            <input type="checkbox" v-model="showLevel" class="h-5 w-5" />
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

            <input type="checkbox" v-model="showStreak" class="h-5 w-5" />
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

            <input type="checkbox" v-model="showAchievements" class="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
