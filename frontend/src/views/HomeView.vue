<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Trophy, Zap, ShieldCheck, Rocket } from 'lucide-vue-next'
import logoUrl from '@/assets/images/logo.webp'
import ModeToggle from '@/components/ModeToggle.vue'

const router = useRouter()

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div
    class="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden relative"
  >
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full"
      ></div>
    </div>

    <header class="relative z-10 py-6 px-8 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
          <img :src="logoUrl" alt="AlToke Logo" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-2xl font-black tracking-tight">AlToke</h1>
      </div>
      <div class="flex items-center gap-4">
        <ModeToggle />
        <Button
          variant="ghost"
          class="font-bold text-muted-foreground hover:text-foreground"
          @click="goToLogin"
        >
          Iniciar sesión
        </Button>
        <Button
          class="font-bold rounded-xl px-6 shadow-lg hover:scale-105 transition-transform"
          @click="goToLogin"
        >
          Empezar ahora
        </Button>
      </div>
    </header>

    <main
      class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center mt-12 mb-20"
    >
      <h2
        class="text-5xl md:text-7xl font-black leading-tight max-w-4xl tracking-tighter mb-6 bg-clip-text text-transparent bg-linear-to-br from-foreground to-foreground/70"
      >
        Completa tareas. <br class="hidden md:block" />
        Sube de nivel. <br class="hidden md:block" />
        Domina tu día.
      </h2>

      <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
        AlToke transforma tu productividad en un juego. Gana experiencia, desbloquea logros y mantén
        rachas imparables mientras organizas tu vida.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button
          size="lg"
          class="h-14 px-8 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:scale-105 transition-all"
          @click="goToLogin"
        >
          Comenzar gratis
          <Rocket class="ml-2 w-5 h-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          class="h-14 px-8 text-lg font-bold rounded-2xl border-border bg-card/50 backdrop-blur hover:bg-accent transition-all"
          @click="goToLogin"
        >
          Ver funcionamiento
        </Button>
      </div>
    </main>

    <section
      class="relative z-10 bg-card/40 backdrop-blur-xl border-t border-border py-20 px-8 mt-auto"
    >
      <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div
          class="p-8 rounded-3xl bg-background/50 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6"
          >
            <Zap class="w-7 h-7" />
          </div>
          <h3 class="text-2xl font-black mb-3">Ultra Rápido</h3>
          <p class="text-muted-foreground leading-relaxed">
            Diseñado para velocidad extrema. Crea, edita y completa tareas sin tiempos de carga
            interminables.
          </p>
        </div>

        <div
          class="p-8 rounded-3xl bg-background/50 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6"
          >
            <Trophy class="w-7 h-7" />
          </div>
          <h3 class="text-2xl font-black mb-3">Gamificación</h3>
          <p class="text-muted-foreground leading-relaxed">
            Cada tarea te otorga XP. Sube de nivel, mantén tu racha diaria y compite con amigos en
            el ranking global.
          </p>
        </div>

        <div
          class="p-8 rounded-3xl bg-background/50 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6"
          >
            <ShieldCheck class="w-7 h-7" />
          </div>
          <h3 class="text-2xl font-black mb-3">Seguro y Privado</h3>
          <p class="text-muted-foreground leading-relaxed">
            Tu información está protegida con estándares de última generación. Solo tú tienes acceso
            a tus metas.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
