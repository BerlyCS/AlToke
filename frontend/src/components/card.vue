<template>
  <div class="bg-white rounded-3xl p-5 shadow-lg border border-slate-100">
    <div class="flex justify-between items-start">
      <div>
        <p class="text-slate-400 font-semibold">
          {{ title }}
        </p>

        <h3 class="text-5xl font-black mt-3">
          {{ value }}
        </h3>
      </div>

      <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
        :class="[bgColor, textColor]">
        <component :is="icon" class="w-7 h-7" />
      </div>
    </div>

    <p class="mt-3 font-bold"
      :class="textColor">
      {{ complementInfo }}
    </p>
  </div>
</template>
<script setup lang="ts">

defineProps({
  title: String,
  value: Number,
  icon: Object,
  complementInfo: String,
  bgColor: String,
  textColor: String

});

</script>