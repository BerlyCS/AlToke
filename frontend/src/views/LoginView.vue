<template>
  <div class="min-h-screen w-full bg-background shadow-2xl overflow-hidden grid lg:grid-cols-2">
    <div class="hidden lg:flex relative px-10 py-7 lg:px-14 lg:py-7 flex-col justify-between">
      <div class="flex items-center gap-4">
        <img
          src="../assets/images/logo-horizontal.webp"
          alt="AlToke"
          decoding="async"
          fetchpriority="high"
          class="w-50 sm:w-50 h-auto max-w-full object-contain select-none"
        />
      </div>

      <div>
        <div class="flex flex-col leading-none mt-10">
          <h2 class="text-5xl lg:text-6xl font-black leading-none text-slate-900">Tus tareas,</h2>
          <h2 class="text-5xl lg:text-6xl font-black leading-none text-success-400">
            tu progreso,
          </h2>
          <h2
            class="text-5xl lg:text-6xl font-black leading-none bg-linear-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
          >
            tu juego.
          </h2>
        </div>

        <div class="flex flex-wrap gap-4 mt-8">
          <div
            class="flex items-center gap-2 bg-primary-50 text-primary-500 px-5 py-3 rounded-2xl font-semibold"
          >
            <Trophy class="w-5 h-5" /> Logros
          </div>
          <div
            class="flex items-center gap-2 bg-success-50 text-success-400 px-5 py-3 rounded-2xl font-semibold"
          >
            <Target class="w-5 h-5" /> Retos
          </div>
          <div
            class="flex items-center gap-2 bg-warning-50 text-warning-500 px-5 py-3 rounded-2xl font-semibold"
          >
            <Flame class="w-5 h-5" /> Rachas
          </div>
        </div>
      </div>
      <div class="mt-auto flex items-end justify-center lg:justify-start gap-4 pb-2">
        <img
          src="../assets/images/img1.webp"
          alt="mascota1"
          decoding="async"
          fetchpriority="high"
          class="w-70 h-auto max-w-full object-contain select-none"
        />
      </div>
    </div>

    <div class="relative bg-primary-200 flex items-center justify-center p-4">
      <div
        class="relative w-full max-w-md bg-white rounded-[36px] shadow-2xl border border-slate-100 p-8"
      >
        <div class="text-center">
          <h2 class="text-4xl font-black text-slate-900">
            {{ isLogin ? '¡Bienvenido!' : 'Crear Cuenta' }}
          </h2>
          <p class="text-slate-500 mt-3 leading-relaxed">
            {{
              isLogin
                ? 'Organiza tus tareas, gana experiencia y sube de nivel.'
                : 'Únete a AlToke y empieza a jugar con tu productividad.'
            }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="mt-8 space-y-4">
          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-slate-700 mb-1">Apodo (opcional)</label>
            <input
              v-model="form.nickname"
              type="text"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              placeholder="Tu apodo"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <p v-if="errorMsg" class="text-error-500 text-sm font-medium text-center">
            {{ errorMsg }}
          </p>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-70"
          >
            {{ isLoading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse' }}
          </button>
        </form>

        <div class="mt-6 flex items-center justify-between">
          <span class="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
          <span class="text-xs text-center text-slate-500 uppercase">o continúa con</span>
          <span class="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
        </div>

        <div class="mt-6">
          <div id="google-btn-wrapper" class="flex justify-center h-10"></div>
        </div>

        <div class="mt-6 text-center text-sm text-slate-600">
          {{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
          <button
            @click="toggleMode"
            type="button"
            class="font-bold text-primary-600 hover:underline"
          >
            {{ isLogin ? 'Regístrate aquí' : 'Inicia sesión' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Flame, Target, Trophy } from 'lucide-vue-next'
import { ref, reactive, onMounted } from 'vue'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

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

    authStore.setAuth(res.user, res.token)
    // router.push('/dashboard') // Redirigir cuando exista
    alert('Autenticado con éxito!')
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
    authStore.setAuth(res.user, res.token)
    alert('Autenticado con Google!')
    // router.push('/dashboard')
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
      width: '100%',
    })
  }
})
</script>
