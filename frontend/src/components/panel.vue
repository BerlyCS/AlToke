<template>
  <div class="xl:col-span-2">
    <div class="bg-white rounded-[35px] shadow-xl border border-slate-100 p-8">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-3xl font-black">
            {{ title }}
          </h3>
          <p class="text-slate-400 mt-1">
            {{ description }}
          </p>
        </div>

        <div class="w-14 h-14 rounded-2xl flex items-center justify-center" :class="[bgIcon, textIcon]">
          <component :is="icon" class="w-7 h-7" />
        </div>
      </div>

      <div class="mt-8 space-y-5">
        <slot />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

defineProps({
  title: String,
  description: String,
  bgIcon: String,
  textIcon: String,
  icon: Object,
});

</script>