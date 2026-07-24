# AlToke

Gamified application to manage tasks with AI integration.

## Manual técnico

### Stack tecnológico

| Capa       | Tecnología                                  |
| ---------- | ------------------------------------------- |
| Frontend   | Vue 3 + TypeScript, Vite 8, Tailwind CSS 4  |
| Backend    | Bun + Elysia + TypeScript                   |
| BD         | PostgreSQL 16 + Drizzle ORM                 |
| Auth       | JWT + Google OAuth                          |
| AI         | DeepSeek V4 Flash                           |
| UI         | shadcn-vue (Reka Nova), Lucide icons        |
| Testing    | Vitest (unit), Cypress (E2E)                |
| CI/CD      | GitHub Actions, multi-arch Docker, SSH      |

### Dependencias

- **Runtime**: Bun 1.3, Node ^20.19.0 / >=22.12.0
- **Infra**: Docker + docker compose
- **Frontend**: Vue 3 (beta), pinia, vue-router, @elysiajs/eden, reka-ui, vue-sonner, canvas-confetti
- **Backend**: elysia, drizzle-orm, postgres.js, @elysiajs/jwt, @elysiajs/cors, @elysiajs/openapi, nodemailer, openai, google-auth-library, zod

### Instalación

```bash
# Clonar
git clone <repo>
cd AlToke

# Instalar dependencias
bun install

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Editar backend/.env con DATABASE_URL, JWT_SECRET, etc.

# Iniciar stack completo (requiere Docker)
docker compose build
docker compose up -d
```

### Endpoints

| Servicio              | URL                           |
| --------------------- | ----------------------------- |
| Frontend              | http://localhost:8080         |
| Backend vía nginx     | http://localhost:8080/api/    |
| Backend directo       | http://localhost:3000         |
| PostgreSQL            | localhost:5432                |
| API Docs (Swagger)    | http://localhost:3000/swagger |

### Estructura del código

```
AlToke/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   ├── db/
│   │   ├── modules/
│   │   │   ├── auth/           # Login, registro, OAuth, reset password
│   │   │   ├── user/           # Perfiles, privacidad
│   │   │   ├── task/           # CRUD de tareas, papelera, completar
│   │   │   ├── tag/            # Etiquetas
│   │   │   ├── gamification/   # XP, niveles, logros, ranking, inventario
│   │   │   ├── ai/             # Sugerencias, análisis hábitos, predicción
│   │   │   ├── notification/   # Notificaciones in-app + email
│   │   │   ├── friendship/     # Solicitudes, amigos
│   │   │   ├── admin/          # Dashboard admin, métricas, ban
│   │   │   └── email/          # Servicio de correo (Nodemailer)
│   │   └── shared/
│   ├── drizzle/
│   └── test/                   # Tests unitarios e integración
├── frontend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── router/             # Vue Router (10 rutas)
│   │   ├── stores/             # Pinia (auth, counter)
│   │   ├── services/           # Clientes API por módulo
│   │   ├── views/
│   │   ├── components/         # Componentes reutilizables + UI (shadcn-vue)
│   │   ├── composables/
│   │   └── types.ts
│   ├── cypress/                # Tests E2E
│   └── tests/                  # Tests unitarios (Vitest)
├── docker/
├── docs/
├── infrastructure/
```

Cada módulo del backend sigue una arquitectura por capas:

- `domain/` → Entidades puras del dominio
- `dto/` → Objetos de transferencia (request/response)
- `repositories/` → Acceso a datos (Drizzle)
- `services/` → Lógica de negocio
- `controllers/` → Definición de rutas Elysia

### Scripts

```bash
bun run ci                  # Lint + format + type-check + test
bun run pre-commit          # Husky: verifica formato y lint

bun run frontend:dev        # Servidor de desarrollo Vite
bun run frontend:build      # Build producción
bun run frontend:test       # Vitest
bun run frontend:e2e        # Cypress (requiere stack completo)

bun run backend:dev         # Servidor de desarrollo con hot-reload
bun run backend:build       # Compilar TypeScript
bun run backend:test        # Bun test
bun run backend:migrate     # Correr migraciones Drizzle
bun run backend:seed        # Poblar BD con datos iniciales
```

### Tests

- **Unitarios**: Vitest (frontend), Bun test (backend)
- **E2E**: Cypress contra stack aislado (`docker-compose.e2e.yml`)
- **Cobertura**: Frontend con `@vitest/coverage-v8`
- **CI/CD**: Ejecución automática en GitHub Actions con detección de cambios

---

## Manual de usuario

### ¿Qué es AlToke?

AlToke es una aplicación gamificada de gestión de tareas con integración de IA. Convierte tu productividad en un juego: completa tareas, gana XP, sube de nivel, desbloquea logros y compite con amigos.

### Registro e inicio de sesión

1. Abrir `http://localhost:8080`
2. Crear cuenta con email y contraseña, o usar **Google OAuth**
3. Confirmar email (si aplica)
4. Si olvidaste tu contraseña, usa "Recuperar contraseña" en la pantalla de login

### Dashboard

Una vez autenticado, el dashboard muestra:

- **Tareas activas** y próximas a vencer
- **Progreso**: XP, nivel, racha actual
- **Resumen semanal** de productividad
- **Notificaciones** recientes

### Gestión de tareas

**Crear tarea**: Botón "Nueva tarea" o desde el calendario. Campos:

- Título, descripción, fecha límite, etiquetas, prioridad
- La IA puede sugerir subtareas automáticamente

**Ver/editar tarea**: Click en cualquier tarea para ver detalles y editar

**Completar tarea**: Marcar como completada → otorga XP y actualiza racha

**Papelera**: Las tareas eliminadas van a la papelera; se pueden restaurar o eliminar permanentemente

**Calendario**: Vista mensual con tareas agendadas

### Gamificación

| Mecánica    | Descripción                                         |
| ----------- | --------------------------------------------------- |
| **XP**      | Experiencia por tareas completadas y rachas         |
| **Niveles** | Cada nivel requiere más XP y desbloquea recompensas |
| **Racha**   | Días consecutivos completando al menos una tarea    |
| **Logros**  | Metas especiales (primeras tareas, hitos, etc.)     |
| **Ranking** | Compara tu nivel con amigos y todos los usuarios    |
| **Inventario** | Ítems obtenidos por nivel o logros               |

### Amigos

1. Buscar usuarios por nombre en la vista Amigos
2. Enviar solicitud de amistad
3. Aceptar/rechazar solicitudes recibidas
4. Ver ranking de amigos y sus logros públicos

### Notificaciones

- **In-app**: Campana en la barra superior. Marcar como leídas
- **Email**: Recordatorios de tareas próximas a vencer, nuevos amigos, etc.
- Configuración en la vista de Configuración

### IA integrada

- **Sugerencias**: Al crear una tarea, la IA propone subtareas y estimaciones
- **Análisis de hábitos**: La IA analiza tu patrón de completado y sugiere mejoras

### Administración

El administrador revisa usuarios, banea cuentas que incumplan normas, y monitorea métricas del sistema para asegurar el buen funcionamiento de la plataforma.

### Configuración

- **Perfil**: Editar nombre, avatar, email
- **Privacidad**: Controlar qué datos son públicos (nivel, logros, tareas activas)
- **Notificaciones**: Activar/desactivar notificaciones por email y tipo
- **Tema**: Alternar entre claro y oscuro
