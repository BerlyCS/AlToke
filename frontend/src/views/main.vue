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
      <Card title="Tareas completadas" :value="infoValues.completedTasks" :icon="CheckCircle"
        complement-info="+12% esta semana" bgColor="bg-primary-100" textColor="text-primary-500">
      </Card>
      <Card title="XP Ganada" :value="infoValues.xpEarned" :icon="Zap" complement-info="Nivel 12 desbloqueado"
        bgColor="bg-warning-100" textColor="text-warning-500">
      </Card>
      <Card title="Ranking Global" :value="infoValues.globalRanking" :icon="Trophy" complement-info="Top 10 esta semana"
        bgColor="bg-success-100" textColor="text-success-500">
      </Card>
    </div>
    <div class="grid xl:grid-cols-3 gap-6 mt-10">
      <Panel title="Próximas tareas" description="Organiza tu día y mantén tu racha" bg-icon="bg-primary-100" text-icon="text-primary-500" :icon="CalendarDays">
        <TaskResume title="Trabajo" day="Hoy" time="6:00 PM" type="work" :done="true"/>
        <TaskResume title="Examen Matemática" day="Mañana" time="8:00 AM" type="study" :done="false"/>
        <TaskResume title="Entrenamiento" day="Mañana" time="7:00 PM" type="exercise" :done="false"/>
        <TaskResume title="Tarea Libre" day="14 Julio" time="5:00 PM" type="other" :done="false"/>
      </Panel>

      <div class="space-y-6">
        <div class="bg-linear-to-br from-primary-500 to-secondary-400 rounded-3xl p-8 text-white shadow-2xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-white/80 font-semibold">
                Racha actual
              </p>

              <h3 class="text-6xl font-black mt-2">
                14🔥
              </h3>
            </div>

            <div class="w-20 h-20 rounded-[28px] bg-white/20 flex items-center justify-center">
              <Flame class="w-10 h-10" />
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-[35px] shadow-xl border border-slate-100 p-8">
          <h3 class="text-2xl font-black">
            Acciones rápidas
          </h3>

          <div class="grid grid-cols-2 gap-4 mt-6">
            <button
              class="h-28 rounded-3xl bg-primary-50 hover:scale-[1.03] transition flex flex-col items-center justify-center gap-3">
              <Plus class="text-primary-500" />
              <span class="font-bold text-primary-500">
                Crear tarea
              </span>
            </button>

            <button
              class="h-28 rounded-3xl bg-success-50 hover:scale-[1.03] transition flex flex-col items-center justify-center gap-3">
              <Target class="text-success-500" />

              <span class="font-bold text-success-500">
                Nuevo reto
              </span>
            </button>

            <button
              class="h-28 rounded-3xl bg-warning-50 hover:scale-[1.03] transition flex flex-col items-center justify-center gap-3">
              <Trophy class="text-warning-500" />
              <span class="font-bold text-warning-500">
                Ranking
              </span>
            </button>

            <button
              class="h-28 rounded-3xl bg-[#FCE7F3] hover:scale-[1.03] transition flex flex-col items-center justify-center gap-3">
              <Users class="text-pink-500" />

              <span class="font-bold text-pink-500">
                Amigos
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </LeftMenu>
</template>
<script setup lang="ts">
import Card from '@/components/card.vue';
import LeftMenu from '@/components/leftMenu.vue';
import Panel from '@/components/panel.vue';
import TaskResume from '@/components/taskResume.vue';
import { CalendarDays, CheckCircle, Flame, Plus, Search, Target, Trophy, Users, Zap } from 'lucide-vue-next';

// Prueba Valores
const infoValues = {
  completedTasks: 120,
  xpEarned: 3500,
  globalRanking: 8
};

</script>