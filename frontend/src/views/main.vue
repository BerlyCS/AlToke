<template>
  <LeftMenu>
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div>
        <p class="text-slate-500 font-semibold">
          Bienvenido de nuevo
        </p>
        <h2 class="text-4xl font-black mt-2">
          Hola, [User]
        </h2>
      </div>

      <div class="flex gap-4">
        <button
          class="h-12 px-6 rounded-2xl bg-white border border-slate-200 font-bold flex items-center gap-3 hover:shadow-md transition text-slate-600/70">
          <Search class="w-5 h-5 text-slate-400" />
          Buscar
        </button>

        <button
          class="h-12 px-5 rounded-2xl bg-primary-500 text-white font-bold shadow-lg flex items-center gap-3 hover:scale-[1.02] transition duration-300">
          <Plus class="w-5 h-5" />
          Nueva tarea
        </button>
      </div>

    </div>

    <div class="grid md:grid-cols-3 gap-6 mt-5">
      <Card 
        title="Tareas completadas"
        :value="infoValues.completedTasks"
        :icon="CheckCircle"
        complement-info="+12% esta semana"
        bgColor="bg-primary-100"
        textColor="text-primary-500">
      </Card>
      <Card 
        title="XP Ganada"
        :value="infoValues.xpEarned"
        :icon="Zap"
        complement-info="Nivel 12 desbloqueado"
        bgColor="bg-warning-100"
        textColor="text-warning-500">
      </Card>
      <Card 
        title="Ranking Global"
        :value="infoValues.globalRanking"
        :icon="Trophy"
        complement-info="Top 10 esta semana"
        bgColor="bg-success-100"
        textColor="text-success-500">
      </Card>
    </div>
  </LeftMenu>
</template>
<script setup lang="ts">
import Card from '@/components/card.vue';
import LeftMenu from '@/components/leftMenu.vue';
import { CheckCircle, Plus, Search, Trophy, Zap } from 'lucide-vue-next';

// Prueba Valores
const infoValues = {
  completedTasks: 120,
  xpEarned: 3500,
  globalRanking: 8
};

</script>