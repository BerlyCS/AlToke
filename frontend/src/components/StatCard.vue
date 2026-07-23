<template>
  <Card class="rounded-3xl shadow-lg border-border bg-card">
    <CardContent class="p-5">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-muted-foreground font-semibold">
            {{ title }}
          </p>

          <h3 class="text-5xl font-black mt-3 text-foreground">
            {{ value }}
          </h3>
        </div>

        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center"
          :class="[bgColor, textColor]"
        >
          <component :is="icon" class="w-7 h-7" />
        </div>
      </div>

      <p class="mt-3 font-bold" :class="textColor">
        {{ complementInfo }}
      </p>
    </CardContent>
  </Card>
</template>
<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'

defineProps({
  title: String,
  value: [Number, String],
  icon: Object,
  complementInfo: String,
  bgColor: String,
  textColor: String,
})
</script>
