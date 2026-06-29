<script setup lang="ts">
import { CheckSquare, LayoutDashboard, Settings, Target, Trophy, Users } from 'lucide-vue-next';

</script>

<template>
  <div class="relative flex min-h-screen bg-background">
    <!-- SIDEBAR -->
    <aside class="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col p-6">
      <!-- LOGO -->
      <div class="flex items-center justify-center my-3">
        <img src="../assets/images/logo-completo.webp" alt="Logo de AlToke" decoding="async"
          fetchpriority="high" class="w-90 sm:w-30 h-auto max-w-full object-contain select-none" />
      </div>

      <!-- MENU -->
      <div class="mt-5 space-y-2">
        <!-- ACTIVE -->
        <button
          class="w-full h-12 rounded-2xl bg-linear-to-r from-primary-500 to-secondary-400 text-white font-bold flex items-center gap-4 px-5 shadow-lg transition-all duration-300 ease-out">
          <LayoutDashboard class="w-6 h-6" />
          Dashboard
        </button>

        <button
          class="w-full h-12 rounded-2xl hover:bg-slate-100 hover:text-primary-500 transition-all duration-200 ease-out flex items-center gap-4 px-5 font-semibold text-slate-600">
          <CheckSquare class="w-6 h-6" />
          Mis tareas
        </button>

        <button
          class="w-full h-12 rounded-2xl hover:bg-slate-100 hover:text-primary-500 transition-all duration-200 ease-out flex items-center gap-4 px-5 font-semibold text-slate-600">
          <Trophy class="w-6 h-6" />
          Ranking
        </button>

        <button
          class="w-full h-12 rounded-2xl hover:bg-slate-100 hover:text-primary-500 transition-all duration-200 ease-out flex items-center gap-4 px-5 font-semibold text-slate-600">
          <Target class="w-6 h-6" />
          Logros
        </button>

        <button
          class="w-full h-12 rounded-2xl hover:bg-slate-100 hover:text-primary-500 transition-all duration-200 ease-out flex items-center gap-4 px-5 font-semibold text-slate-600">
          <Users class="w-6 h-6" />
          Amigos
        </button>

        <button
          class="w-full h-12 rounded-2xl hover:bg-slate-100 hover:text-primary-500 transition-all duration-200 ease-out flex items-center gap-4 px-5 font-semibold text-slate-600">
          <Settings class="w-6 h-6" />
          Configuración
        </button>
      </div>

      <!-- USER CARD -->
      <div class="mt-10 bg-linear-to-br from-primary-500 to-secondary-400 rounded-2xl p-6 text-white shadow-2xl">
        <div class="flex items-center gap-4">
          <img id="user-avatar" src="https://api.dicebear.com/10.x/fun-emoji/svg?seed=lorem" alt="Avatar del usuario"
            class="w-16 h-16 rounded-2xl border-4 border-white/50" />
          <div>
            <h3 id="user-name" class="font-black text-xl">[User]</h3>
            <p class="text-white/80">Nivel [number]</p>
          </div>
        </div>

        <!-- XP -->
        <div class="mt-6">
          <div class="flex justify-between text-sm mb-2">
            <span>XP semanal</span>
            <span>720 / 1000</span>
          </div>

          <div class="h-3 bg-white/20 rounded-full overflow-hidden">
            <div class="h-full w-[72%] bg-success-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </aside>
    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>