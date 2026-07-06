<script setup lang="ts">
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar.vue'
import ModeToggle from '@/components/ModeToggle.vue'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header
        class="flex justify-between h-14 shrink-0 items-center border-b bg-background/95 backdrop-blur px-4 sticky top-0 z-[5]"
      >
        <div class="flex items-center gap-2">
          <SidebarTrigger class="-ml-1" />
        </div>
        <ModeToggle />
      </header>
      <main class="flex flex-1 flex-col p-4 md:p-6 lg:p-8 bg-background overflow-x-hidden">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
