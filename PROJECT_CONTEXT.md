# Resident Portal - Phase 1 Complete

## Tech Stack
- React 18 + TypeScript + Vite
- Supabase (Auth + Database)
- Tailwind CSS with custom theme
- React Router v6
- Zod validation

## Branding
- Primary Color: #00FF88 (InmoAPP green)
- Brand: InmoAPP
- Design: Clean, modern, accessible (WCAG AA compliant)

## Database Schema
- **profiles** (extends auth.users): user info + role + residencial_id
- **residenciales**: multi-tenant containers for residential complexes
- **residencias**: housing units within residenciales
- **audit_log**: system activity tracking

## User Roles & Access Matrix

| Role | Access Level | Can Switch Residenciales | Key Permissions |
|------|--------------|--------------------------|-----------------|
| SUPERADMIN | Full system | Yes | All modules, user management, all residenciales |
| ADMIN_RESIDENCIAL | Single residencial | No | Manage residents, view audit logs, read-only accesses/mudanzas |
| IT | Technical modules | No | Access control systems |
| SEGURIDAD | Security modules | No | Moving request management |
| RESIDENTE | Personal data only | No | View own statements, reservations, warnings |

## Navigation Structure

### SUPERADMIN Menu
- Inicio, Residenciales, Usuarios, Auditoría
- All placeholder modules

### ADMIN_RESIDENCIAL Menu
- Inicio, Residentes, Estados/Pagos, Amonestaciones, Espacios/Reservas
- Accesos (read-only), Mudanzas (read-only), Auditoría

### IT Menu
- Inicio, Accesos

### SEGURIDAD Menu
- Inicio, Mudanzas

### RESIDENTE Menu
- Inicio, Mi Estado/Pagos, Mis Reservas, Mis Amonestaciones, Mis Accesos, Mis Mudanzas

## Authentication Flow

1. User visits app → redirected to /login
2. User enters email/password → Zod validation
3. Supabase Auth verifies credentials
4. Profile fetched from profiles table
5. Session stored in localStorage
6. Redirect to /dashboard
7. AuthContext maintains user state
8. Audit log entry created for LOGIN action

## Authorization Pattern

```typescript
// Route Protection
<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMIN_RESIDENCIAL']}>
  <Component />
</ProtectedRoute>

// Component-level Protection
<RoleGate allowedRoles={['SUPERADMIN']}>
  <AdminOnlyFeature />
</RoleGate>

// Programmatic Check
const canEdit = can(user, 'update', 'estados');
```

## Multi-Tenancy Implementation

1. **Context Layer**: ResidencialContext manages selected residencial
2. **Database Layer**: RLS policies filter by residencial_id
3. **Query Layer**: applyResidencialFilter() helper auto-filters queries
4. **UI Layer**: Residencial selector in topbar (SUPERADMIN only)

## Folder Structure Philosophy

```
app/           - Feature-based pages and layouts
components/    - Reusable UI components
contexts/      - Global state management
hooks/         - Custom React hooks
lib/           - Business logic and external integrations
utils/         - Pure utility functions and constants
types/         - TypeScript type definitions
scripts/       - Database and setup scripts
```

## Key Components

### Layout Components
- **DashboardLayout**: Main shell with sidebar + topbar
- **Sidebar**: Dynamic navigation with role-based filtering
- **Topbar**: User menu + residencial selector

### Auth Components
- **LoginPage**: Email/password form with Zod validation
- **RegisterInfoPage**: Information about invitation-only registration
- **ProtectedRoute**: HOC for route authentication
- **RoleGate**: Conditional rendering by role

### Utility Components
- **PlaceholderPage**: Reusable template for Phase 2 modules
- **EmptyState**: No-data states with optional CTA
- **Button, Card, Badge, Input, Select**: Base UI components

## State Management

### AuthContext
- Current user state
- Loading state
- signIn/signOut functions
- Automatic session restoration

### ResidencialContext
- Selected residencial
- Available residenciales list
- setSelectedResidencial function
- Auto-loads on user change

## Database Best Practices

1. **Always use RLS**: Every table has RLS enabled
2. **Index foreign keys**: All FK columns have indexes
3. **Audit everything**: Use logAuditEvent() for important actions
4. **Filter by tenant**: Use applyResidencialFilter() for queries
5. **Timestamps**: All tables have created_at/updated_at with triggers

## API Integration Points

### Supabase Client Usage
```typescript
// Auth
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signOut();

// Database
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();

// With RLS filtering
let query = supabase.from('residencias').select('*');
query = applyResidencialFilter(query, user, selectedResidencialId);
const { data } = await query;
```

## Environment Variables

```env
VITE_SUPABASE_URL          - Supabase project URL
VITE_SUPABASE_ANON_KEY     - Public anonymous key
VITE_TECH_BRAND            - Brand name for UI
VITE_PRIMARY_COLOR         - Primary theme color
```

## Phase 2 Preparation

### Module Structure
Each module should follow this pattern:
```
modules/[module-name]/
├── [Module]Page.tsx       - Main page component
├── [Module]List.tsx       - List/table view
├── [Module]Form.tsx       - Create/edit form
├── [Module]Detail.tsx     - Detail view
├── types.ts               - Module-specific types
└── api.ts                 - API calls
```

### Webhook Integration
Stub created in `utils/postToContableWebhook.ts` for accounting system integration.

### Data Tables
Use pattern:
1. Fetch with Supabase client
2. Apply residencial filter
3. Display with pagination
4. Actions with role checks
5. Audit log on mutations

## Testing Checklist

- [ ] SUPERADMIN can access all routes
- [ ] ADMIN_RESIDENCIAL sees limited menu
- [ ] RESIDENTE only sees personal modules
- [ ] Residencial selector works for SUPERADMIN
- [ ] Login redirects to dashboard
- [ ] Logout clears session
- [ ] Unauthorized routes show 403
- [ ] Navigation highlights active route
- [ ] Mobile menu works on small screens
- [ ] Role badges display correctly

## Common Tasks

### Add New Route
1. Create page component in `app/modules/[name]/`
2. Add route in `App.tsx` with ProtectedRoute
3. Add navigation item in `utils/constants.ts`
4. Update NAVIGATION_ITEMS with roles

### Add New User Role
1. Update `user_role` enum in database
2. Add to `UserRole` type in `database.types.ts`
3. Add color in ROLE_COLORS constant
4. Add label in ROLE_LABELS constant
5. Update PERMISSIONS in `lib/rbac.ts`
6. Update RLS policies if needed

### Create New Module (Phase 2)
1. Create database table with RLS
2. Create TypeScript types
3. Build page components
4. Add API functions
5. Update navigation
6. Add tests
7. Update audit logging

## Important Notes

- Never bypass RLS - it's the security backbone
- Always audit important actions
- Use can() helper for permission checks
- Filter queries by residencial for multi-tenancy
- Keep components small and focused
- Follow existing patterns for consistency

## Seed Credentials

- SUPERADMIN: admin@conversion.tech / Admin123!
- ADMIN: admin.asm1@example.com / Admin123!
- RESIDENTE: residente1@example.com / Residente123!

## Next Phases

**Phase 2:** Estados de Cuenta, Pagos, Amonestaciones
**Phase 3:** Reservas de Espacios Comunes
**Phase 4:** Control de Accesos y Mudanzas

---

**Note:** This document should be referenced when starting Phase 2 to maintain architectural consistency.
