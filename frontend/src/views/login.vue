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
          <h2 class="text-5xl lg:text-6xl font-black leading-none text-success-400">tu progreso,</h2>
          <h2 class="text-5xl lg:text-6xl font-black leading-none bg-linear-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">tu juego.</h2>
        </div>

        <div class="flex flex-wrap gap-4 mt-8">
          <div class="flex items-center gap-2 bg-primary-50 text-primary-500 px-5 py-3 rounded-2xl font-semibold">
            <Trophy class="w-5 h-5"/> Logros
          </div>
          <div class="flex items-center gap-2 bg-success-50 text-success-400 px-5 py-3 rounded-2xl font-semibold">
            <Target class="w-5 h-5"/> Retos
          </div>
          <div class="flex items-center gap-2 bg-warning-50 text-warning-500 px-5 py-3 rounded-2xl font-semibold">
            <Flame class="w-5 h-5"/> Rachas
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

    <div class="relative bg-primary-200 flex items-center justify-center">
      <div class="relative w-full max-w-md bg-white rounded-[36px] shadow-2xl border border-slate-100 p-8">
        <div class="text-center">
          <h2 class="text-4xl font-black text-slate-900">¡Bienvenido!</h2>
          <p class="text-slate-500 mt-3 leading-relaxed">
            Organiza tus tareas, gana experiencia y sube de nivel mientras completas tus objetivos.
          </p>
        </div>

        <div class="flex justify-center my-10">
          <img
            src="../assets/images/logo.webp"
            alt="Personaje AlToke"
            loading="lazy"
            decoding="async"
            draggable="false"
            class="w-20 h-20 sm:w-20 sm:h-20 object-contain select-none"
          />
        </div>

        <div class="">
          <button
            @click="handleGoogleLogin"
            class="group w-full h-14 rounded-2xl bg-white border-2 border-slate-200 hover:border-primary-500 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-4 font-bold text-slate-700 text-lg"
          >
            <div class="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-5 h-5">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.8-3.3-11.5-8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.3 7.1l6.3 5.3C39.5 36.7 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
              </svg>
            </div>
            <span class="group-hover:text-primary-500 transition">Continuar con Google</span>
          </button>
        </div>

        <div class="mt-8 bg-primary-50 rounded-2xl p-5 border border-border">
          <div class="flex items-start gap-3">
            <div class=" rounded-xl flex items-center justify-center">
              <Sparkles class="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 class="font-bold text-text-primary">Sube de nivel cada día</h3>
              <p class="text-sm text-text-secondary mt-1 leading-relaxed">
                Completa tareas, mantén rachas y desbloquea logros mientras mejoras tu productividad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Flame, Sparkles, Target, Trophy } from 'lucide-vue-next'
import { onMounted } from 'vue'

const handleGoogleLogin = () => {
  console.log('Iniciando login con Google...')
}

onMounted(() => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons()
  }
})
</script>