<template>
  <div class="grid min-h-svh bg-background lg:grid-cols-2">
    <aside class="relative hidden overflow-hidden border-r border-border bg-muted lg:flex">
      <div class="absolute inset-0 bg-primary/5"></div>
      <div class="relative flex h-full w-full flex-col justify-between p-12">
        <RouterLink
          to="/"
          class="flex w-fit items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl">
            <img :src="logoUrl" alt="AlToke" class="h-full w-full object-cover" />
          </div>
          <span class="text-2xl font-black tracking-tight">AlToke</span>
        </RouterLink>

        <div class="max-w-md">
          <p class="mb-4 text-sm font-bold tracking-[0.18em] text-primary uppercase">
            Acceso seguro
          </p>
          <h1 class="text-5xl font-black leading-[0.96] tracking-tight text-foreground">
            Tu progreso<br />
            <span class="text-success-500">continúa</span><br />
            contigo.
          </h1>
          <p class="mt-7 max-w-sm text-lg leading-relaxed text-muted-foreground">
            Recupera el acceso y vuelve a organizar tus tareas a tu ritmo.
          </p>
        </div>

        <div class="rounded-3xl border border-primary/15 bg-card/70 p-6 shadow-sm backdrop-blur">
          <ShieldCheck class="mb-4 h-8 w-8 text-primary" />
          <p class="font-bold text-foreground">Enlaces de un solo uso</p>
          <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
            Protegemos el cambio de contraseña con un enlace que vence en 30 minutos.
          </p>
        </div>
      </div>
    </aside>

    <main class="relative flex min-h-svh flex-col p-6 md:p-10">
      <div class="absolute right-6 top-6 md:right-10 md:top-10"><ModeToggle /></div>
      <div class="flex flex-1 items-center justify-center pt-12 lg:pt-0">
        <Card
          class="w-full max-w-104 rounded-3xl border-border bg-card text-card-foreground shadow-2xl"
        >
          <div class="flex flex-col gap-6 p-6 md:p-8">
            <template v-if="isForgotPassword">
              <div v-if="sent" class="flex flex-col items-center gap-5 py-3 text-center">
                <div
                  class="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-500/10 text-success-500"
                >
                  <MailCheck class="h-8 w-8" />
                </div>
                <div class="space-y-2">
                  <h1 class="text-2xl font-bold">Revisa tu correo</h1>
                  <p class="text-sm leading-relaxed text-muted-foreground">
                    Si existe una cuenta para
                    <strong class="font-semibold text-foreground">{{ email }}</strong
                    >, enviamos instrucciones para crear una nueva contraseña.
                  </p>
                </div>
                <p
                  class="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-primary"
                >
                  El enlace vence en 30 minutos. Revisa también tu carpeta de spam.
                </p>
                <RouterLink
                  to="/login"
                  class="text-sm font-bold text-foreground underline underline-offset-4 hover:text-primary"
                  >Volver a iniciar sesión</RouterLink
                >
              </div>

              <template v-else>
                <div class="flex flex-col items-center gap-3 text-center">
                  <div
                    class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                  >
                    <Mail class="h-7 w-7" />
                  </div>
                  <div>
                    <h1 class="text-2xl font-bold">Recupera tu contraseña</h1>
                    <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Ingresa tu correo y te enviaremos un enlace seguro para continuar.
                    </p>
                  </div>
                </div>
                <form class="grid gap-6" @submit.prevent="requestReset">
                  <div class="grid gap-2">
                    <Label for="recovery-email">Correo electrónico</Label>
                    <Input
                      id="recovery-email"
                      v-model="email"
                      type="email"
                      autocomplete="email"
                      placeholder="ejemplo@correo.com"
                      required
                      class="h-11"
                    />
                  </div>
                  <p v-if="errorMsg" class="text-center text-sm font-medium text-destructive">
                    {{ errorMsg }}
                  </p>
                  <Button
                    type="submit"
                    class="h-11 w-full text-base font-bold shadow-lg"
                    :disabled="isLoading"
                  >
                    {{ isLoading ? 'Enviando enlace...' : 'Enviar enlace' }}
                  </Button>
                </form>
                <p class="text-center text-sm text-muted-foreground">
                  ¿Recordaste tu contraseña?
                  <RouterLink
                    to="/login"
                    class="font-bold text-foreground underline underline-offset-4 hover:text-primary"
                    >Inicia sesión</RouterLink
                  >
                </p>
              </template>
            </template>

            <template v-else>
              <div class="flex flex-col items-center gap-3 text-center">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                >
                  <KeyRound class="h-7 w-7" />
                </div>
                <div>
                  <h1 class="text-2xl font-bold">Crea una nueva contraseña</h1>
                  <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Elige una contraseña que puedas recordar para volver a tu cuenta.
                  </p>
                </div>
              </div>
              <form class="grid gap-5" @submit.prevent="submitNewPassword">
                <div class="grid gap-2">
                  <Label for="new-password">Nueva contraseña</Label>
                  <Input
                    id="new-password"
                    v-model="password"
                    type="password"
                    autocomplete="new-password"
                    minlength="6"
                    maxlength="128"
                    placeholder="Mínimo 6 caracteres"
                    required
                    class="h-11"
                  />
                </div>
                <div class="grid gap-2">
                  <Label for="confirm-password">Confirma tu contraseña</Label>
                  <Input
                    id="confirm-password"
                    v-model="confirmPassword"
                    type="password"
                    autocomplete="new-password"
                    minlength="6"
                    maxlength="128"
                    placeholder="Repite tu contraseña"
                    required
                    class="h-11"
                  />
                </div>
                <p v-if="errorMsg" class="text-center text-sm font-medium text-destructive">
                  {{ errorMsg }}
                </p>
                <Button
                  type="submit"
                  class="h-11 w-full text-base font-bold shadow-lg"
                  :disabled="isLoading"
                >
                  {{ isLoading ? 'Actualizando...' : 'Guardar nueva contraseña' }}
                </Button>
              </form>
              <p
                class="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-center text-sm leading-relaxed text-primary"
              >
                Este enlace es personal, vence en 30 minutos y solo se puede usar una vez.
              </p>
              <p class="text-center text-sm text-muted-foreground">
                <RouterLink
                  to="/login"
                  class="font-bold text-foreground underline underline-offset-4 hover:text-primary"
                  >Volver a iniciar sesión</RouterLink
                >
              </p>
            </template>
          </div>
        </Card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KeyRound, Mail, MailCheck, ShieldCheck } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ModeToggle from '@/components/ModeToggle.vue'
import logoUrl from '@/assets/images/logo.webp'
import { authService } from '@/services/auth.service'

const route = useRoute()
const router = useRouter()
const isForgotPassword = computed(() => route.name === 'forgot-password')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const isLoading = ref(false)
const sent = ref(false)

const requestReset = async () => {
  errorMsg.value = ''
  isLoading.value = true
  try {
    await authService.requestPasswordReset(email.value)
    sent.value = true
  } catch {
    errorMsg.value = 'No pudimos enviar las instrucciones. Inténtalo nuevamente.'
  } finally {
    isLoading.value = false
  }
}

const submitNewPassword = async () => {
  errorMsg.value = ''
  const token = typeof route.query.token === 'string' ? route.query.token : ''

  if (!token) {
    errorMsg.value = 'El enlace de recuperación no es válido.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Las contraseñas no coinciden.'
    return
  }

  isLoading.value = true
  try {
    await authService.resetPassword(token, password.value)
    toast.success('Tu contraseña fue actualizada. Ya puedes iniciar sesión.')
    await router.push('/login')
  } catch {
    errorMsg.value = 'El enlace es inválido o venció. Solicita uno nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>
