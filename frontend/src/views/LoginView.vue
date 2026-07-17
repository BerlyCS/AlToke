<template>
  <div class="grid min-h-svh lg:grid-cols-2 bg-background">
    <div class="relative hidden bg-muted lg:flex flex-col border-r border-border overflow-hidden">
      <div class="absolute inset-0 bg-primary/5"></div>

      <div class="relative z-10 flex flex-col h-full justify-between p-12">
        <a
          href="#"
          class="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity"
          @click.prevent="router.push('/')"
        >
          <div class="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
            <img :src="logoUrl" alt="AlToke Logo" class="w-full h-full object-cover" />
          </div>
          <span class="text-2xl font-black tracking-tight">AlToke</span>
        </a>

        <div class="flex flex-col items-start justify-center flex-1 py-12">
          <div class="flex flex-col leading-none">
            <h2 class="text-5xl lg:text-6xl font-black leading-none text-foreground">
              Tus tareas,
            </h2>
            <h2 class="text-5xl lg:text-6xl font-black leading-none text-success-500">
              tu progreso,
            </h2>
            <h2
              class="text-5xl lg:text-6xl font-black leading-none bg-linear-to-r from-primary to-purple-500 bg-clip-text text-transparent pb-2"
            >
              tu juego.
            </h2>
          </div>

          <div class="flex flex-wrap gap-4 mt-10">
            <Card
              class="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/10 border-primary/20 shadow-none"
            >
              <Trophy class="w-6 h-6 text-primary" />
              <span class="font-bold text-primary">Logros</span>
            </Card>
            <Card
              class="flex items-center gap-3 px-5 py-4 rounded-2xl bg-success-500/10 border-success-500/20 shadow-none"
            >
              <Users class="w-6 h-6 text-success-500" />
              <span class="font-bold text-success-500">Amigos</span>
            </Card>
            <Card
              class="flex items-center gap-3 px-5 py-4 rounded-2xl bg-warning-500/10 border-warning-500/20 shadow-none"
            >
              <Flame class="w-6 h-6 text-warning-500" />
              <span class="font-bold text-warning-500">Rachas</span>
            </Card>
          </div>
        </div>

        <div class="flex justify-center mt-auto">
          <img
            src="../assets/images/img1.webp"
            alt="Mascota AlToke"
            class="w-full max-w-[20rem] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-col p-6 md:p-10 relative">
      <div class="absolute right-6 top-6 md:right-10 md:top-10">
        <ModeToggle />
      </div>

      <div class="flex flex-col items-center justify-center flex-1 pt-12 lg:pt-0">
        <div class="w-full max-w-104">
          <Card class="bg-card text-card-foreground rounded-3xl border-border shadow-2xl">
            <div class="p-6 md:p-8 flex flex-col gap-6">
              <div class="flex flex-col items-center gap-2 text-center">
                <h1 class="text-2xl font-bold">
                  {{ isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta' }}
                </h1>
                <p class="text-sm text-balance text-muted-foreground">
                  {{
                    isLogin
                      ? 'Inicia sesión con tu cuenta de Google o correo'
                      : 'Únete a AlToke y empieza a jugar con tu productividad'
                  }}
                </p>
              </div>

              <div class="grid gap-6">
                <div
                  id="google-btn-wrapper"
                  class="w-full flex justify-center overflow-hidden rounded-md [&>div]:w-full [&_iframe]:w-full"
                ></div>

                <div
                  class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
                >
                  <span class="relative z-10 bg-card px-2 text-muted-foreground">
                    O continúa con
                  </span>
                </div>

                <form class="grid gap-6" @submit.prevent="handleSubmit">
                  <div v-if="!isLogin" class="grid gap-2">
                    <Label for="nickname">Apodo (opcional)</Label>
                    <Input
                      id="nickname"
                      data-cy="register-nickname"
                      v-model="form.nickname"
                      type="text"
                      placeholder="Tu apodo"
                      class="h-11"
                    />
                  </div>

                  <div class="grid gap-2">
                    <Label for="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      data-cy="auth-email"
                      v-model="form.email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      required
                      class="h-11"
                    />
                  </div>

                  <div class="grid gap-2">
                    <div class="flex items-center">
                      <Label for="password">Contraseña</Label>
                      <a
                        v-if="isLogin"
                        href="/forgot-password"
                        class="ml-auto inline-block text-sm underline-offset-4 hover:underline text-muted-foreground"
                        @click.prevent="router.push('/forgot-password')"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <Input
                      id="password"
                      data-cy="auth-password"
                      v-model="form.password"
                      type="password"
                      required
                      minlength="6"
                      placeholder="••••••••"
                      class="h-11"
                    />
                  </div>

                  <p v-if="errorMsg" class="text-destructive text-sm font-medium text-center">
                    {{ errorMsg }}
                  </p>

                  <Button
                    type="submit"
                    data-cy="auth-submit"
                    class="w-full h-11 text-base font-bold shadow-lg"
                    :disabled="isLoading"
                  >
                    {{ isLoading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse' }}
                  </Button>
                </form>
              </div>

              <div class="text-center text-sm text-muted-foreground mt-2">
                {{ isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?' }}
                <button
                  type="button"
                  data-cy="auth-mode-toggle"
                  @click="toggleMode"
                  class="underline underline-offset-4 text-foreground font-bold hover:text-primary transition-colors ml-1"
                >
                  {{ isLogin ? 'Regístrate' : 'Inicia sesión' }}
                </button>
              </div>

              <div class="text-center text-xs text-muted-foreground mt-4 px-2">
                Al hacer clic en continuar, aceptas nuestros
                <a href="#" class="underline underline-offset-4 hover:text-foreground"
                  >Términos de servicio</a
                >
                y
                <a href="#" class="underline underline-offset-4 hover:text-foreground"
                  >Política de privacidad</a
                >.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import ModeToggle from '@/components/ModeToggle.vue'
import logoUrl from '@/assets/images/logo.webp'
import { Trophy, Users, Flame } from 'lucide-vue-next'
import { ref, reactive, onMounted } from 'vue'
import { authService } from '../services/auth.service'
import { userService } from '../services/user.service'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()
const router = useRouter()

const isLogin = ref(true)
const isLoading = ref(false)
const errorMsg = ref('')

const form = reactive({
  email: '',
  password: '',
  nickname: '',
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
  form.password = ''
}

const handleSubmit = async () => {
  errorMsg.value = ''
  isLoading.value = true

  try {
    const res = isLogin.value
      ? await authService.login({ email: form.email, password: form.password })
      : await authService.register({
          email: form.email,
          password: form.password,
          nickname: form.nickname,
        })

    // persist token first so getProfile() can use it
    localStorage.setItem('token', res.token)
    const profile = await userService.getProfile()

    const userToStore = {
      id: res.user.id,
      email: res.user.email,
      nickname: res.user.nickname ?? undefined,
      avatarUrl: res.user.avatarUrl ?? undefined,
    }

    authStore.setAuth(userToStore, profile, res.token)
    toast.success('¡Bienvenido a AlToke!')
    router.push('/dashboard')
  } catch (err: unknown) {
    if (err instanceof Error) errorMsg.value = err.message
  } finally {
    isLoading.value = false
  }
}

const handleGoogleCallback = async (response: { credential: string }) => {
  errorMsg.value = ''
  isLoading.value = true

  try {
    const res = await authService.googleLogin(response.credential)

    // persist token first so getProfile() can use it
    localStorage.setItem('token', res.token)
    const profile = await userService.getProfile()

    const userToStore = {
      id: res.user.id,
      email: res.user.email,
      nickname: res.user.nickname ?? undefined,
      avatarUrl: res.user.avatarUrl ?? undefined,
    }

    authStore.setAuth(userToStore, profile, res.token)
    toast.success('¡Bienvenido a AlToke!')
    router.push('/dashboard')
  } catch (err: unknown) {
    if (err instanceof Error) errorMsg.value = err.message
  } finally {
    isLoading.value = false
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void
          renderButton: (element: HTMLElement | null, config: object) => void
        }
      }
    }
  }
}

onMounted(() => {
  // Configurar Google Identity Services
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
    })
    window.google.accounts.id.renderButton(document.getElementById('google-btn-wrapper'), {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'center',
    })
  }
})
</script>
