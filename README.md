# Portal de Residentes - Fase 1

Sistema de gestión para residenciales con autenticación multi-tenant y control de acceso basado en roles.

## Tecnologías

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Routing:** React Router v6
- **Validación:** Zod
- **Iconos:** Lucide React

## Características Implementadas (Fase 1)

### Autenticación y Seguridad
- Sistema de login con email/password
- Gestión de sesiones persistentes
- Protección de rutas por rol
- Row Level Security (RLS) en base de datos
- Registro de auditoría automático

### Roles de Usuario
- **SUPERADMIN:** Acceso total al sistema, puede cambiar entre residenciales
- **ADMIN_RESIDENCIAL:** Gestión completa de un residencial específico
- **IT:** Acceso a módulos técnicos (Control de Accesos)
- **SEGURIDAD:** Acceso a módulos de seguridad (Mudanzas)
- **RESIDENTE:** Acceso a información personal únicamente

### Multi-Tenancy
- Aislamiento de datos por residencial
- Selector de residencial para SUPERADMIN
- Filtrado automático de consultas por residencial_id
- Políticas RLS para seguridad a nivel de base de datos

### Interfaz de Usuario
- Dashboard responsive con sidebar y topbar
- Navegación dinámica basada en rol del usuario
- Tema personalizado con color primario #00FF88 (InmoAPP)
- Componentes reutilizables y accesibles
- Diseño mobile-first

## Estructura del Proyecto

```
src/
├── app/
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Layout y home del dashboard
│   └── modules/           # Módulos placeholder para Fase 2
├── components/
│   ├── ui/                # Componentes UI base
│   ├── RoleGate.tsx       # Control de acceso por rol
│   ├── ProtectedRoute.tsx # Protección de rutas
│   └── EmptyState.tsx     # Estados vacíos
├── contexts/
│   ├── AuthContext.tsx    # Estado de autenticación
│   └── ResidencialContext.tsx # Estado de residencial
├── hooks/
│   └── useCurrentUser.ts  # Hook para usuario actual
├── lib/
│   ├── supabase.ts        # Cliente Supabase
│   ├── auth.ts            # Helpers de autenticación
│   ├── rbac.ts            # Control de acceso
│   ├── audit.ts           # Registro de auditoría
│   └── database.ts        # Helpers de base de datos
├── types/
│   └── database.types.ts  # Tipos TypeScript
├── utils/
│   ├── constants.ts       # Constantes y configuración
│   └── postToContableWebhook.ts # Stub para integración
└── scripts/
    ├── schema.sql         # Esquema de base de datos
    └── seed.sql           # Datos iniciales
```

## Configuración Inicial

### 1. Variables de Entorno

El archivo `.env` ya está configurado con:

```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=[tu-anon-key]
VITE_TECH_BRAND="InmoAPP"
VITE_PRIMARY_COLOR="#00FF88"
```

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Configuración de Base de Datos

Sigue la guía completa en `DATABASE_SETUP.md`:

1. Ejecuta el esquema (`src/scripts/schema.sql`) en Supabase SQL Editor
2. Verifica que los índices se crearon correctamente
3. Ejecuta el seed (`src/scripts/seed.sql`) para datos iniciales
4. Crea usuarios de prueba en Supabase Auth Dashboard
5. Vincula perfiles a usuarios creados

### 4. Credenciales de Prueba

Ver archivo `CREDENTIALS.md` para credenciales completas.

**Quick Access:**
- SUPERADMIN: `admin@conversion.tech` / `Admin123!`
- ADMIN: `admin.asm1@example.com` / `Admin123!`
- RESIDENTE: `residente1@example.com` / `Residente123!`

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Type checking
npm run typecheck
```

## Esquema de Base de Datos

### Tablas Principales

**residenciales**
- Complejos residenciales (maestro)
- Índice único en `codigo`

**profiles**
- Extensión de auth.users con rol y residencial_id
- Índice único en `id` (FK a auth.users)
- Índice en `residencial_id`

**residencias**
- Unidades habitacionales dentro de residenciales
- Índice en `residencial_id`

**audit_log**
- Registro de actividad del sistema
- Índices en `residencial_id`, `user_id`, `created_at`

### Tipos Enum

- `user_role`: SUPERADMIN, ADMIN_RESIDENCIAL, IT, SEGURIDAD, RESIDENTE
- `audit_action`: CREATE, UPDATE, DELETE, STATUS_CHANGE, LOGIN
- `residencia_estado`: activa, inactiva

## Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas que:
- Filtran datos por `residencial_id` para usuarios no-SUPERADMIN
- Permiten acceso completo a SUPERADMIN
- Restringen actualizaciones a datos propios
- Requieren autenticación para todas las operaciones

### Auditoría

Sistema automático de auditoría que registra:
- Todos los logins de usuarios
- Acciones CRUD en entidades importantes
- IP del cliente y User Agent
- Diferencias antes/después en actualizaciones

## Módulos Placeholder (Fase 2)

Los siguientes módulos tienen rutas y navegación configuradas, pero mostrarán páginas placeholder:

- Estados de Cuenta
- Pagos
- Amonestaciones
- Espacios Comunes y Reservas
- Control de Accesos
- Solicitudes de Mudanza
- Gestión de Residenciales (SUPERADMIN)
- Gestión de Usuarios (SUPERADMIN)
- Auditoría del Sistema

## Próximas Fases

### Fase 2
- Implementación de Estados de Cuenta
- Sistema de Pagos con integración contable
- Gestión de Amonestaciones
- Sistema de Reservas de Espacios Comunes

### Fase 3
- Control de Accesos en tiempo real
- Gestión de Mudanzas
- Notificaciones push

### Fase 4
- Dashboard de métricas y reportes
- Exportación de datos
- Integración con sistemas externos

## Troubleshooting

### No puedo hacer login
1. Verifica que el usuario existe en Supabase Auth
2. Confirma que hay un perfil vinculado en tabla `profiles`
3. Revisa que `residencial_id` esté configurado para roles no-SUPERADMIN

### Error "relation does not exist"
1. Ejecuta el schema completo en SQL Editor
2. Verifica que todas las tablas se crearon
3. Revisa que los enums se crearon correctamente

### Dashboard no carga
1. Abre la consola del navegador
2. Verifica errores de autenticación
3. Confirma que las variables de entorno están correctas
4. Limpia caché y cookies del navegador

## Soporte

Para dudas o problemas técnicos:
- Email: admin@conversion.tech
- Documentación: Ver archivos `DATABASE_SETUP.md` y `CREDENTIALS.md`

## Licencia

Propiedad de InmoAPP. Todos los derechos reservados.
