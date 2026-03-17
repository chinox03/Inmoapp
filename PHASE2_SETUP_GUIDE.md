# Phase 2 Setup Guide

## Quick Start

### Step 1: Apply Database Migration

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251024120000_phase2_modules.sql`
4. Paste and execute the query
5. Verify all 9 tables were created successfully

### Step 2: Create Storage Bucket

Run this SQL in Supabase SQL Editor:

```sql
-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment_proofs', 'payment_proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment_proofs');

-- Allow public read access (dev mode)
CREATE POLICY "Public can view payment proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment_proofs');
```

### Step 3: Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173 and login with:
- **SUPERADMIN**: admin@conversion.tech / Admin123!

### Step 4: Test Estados de Cuenta Module

1. Navigate to "Estados de Cuenta" in the sidebar
2. Click "Generar Estado" button
3. Fill in the form:
   - **Periodo**: "Octubre 2025"
   - **ID del Residente**: Use any valid UUID from profiles table
   - **Total Mantenimiento**: 5000
4. Submit and verify the estado appears in the table

## What's Working

### ✅ Fully Functional
- **Estados de Cuenta Module**: Complete with CRUD operations, role-based views, and currency formatting
- **Database Schema**: All 9 tables with RLS policies
- **Toast Notifications**: Global notification system
- **UI Components**: Dialog, DataTable, FileUpload, StatusBadge

### 🔄 Partially Complete
- **Pagos Module**: Service layer complete, UI needs implementation
  - File upload service ready
  - Approval workflow service ready
  - Need to build the UI with forms and file upload

### 📋 Ready for Implementation
- Espacios (Common Areas)
- Reservas (Reservations)
- Amonestaciones (Warnings)
- Accesos (Access Control)
- Mudanzas (Moving Permits)
- Auditoría (Enhanced Audit Viewer)
- Dashboard KPIs

## Testing Estados de Cuenta

### As SUPERADMIN
1. Can view all estados across all residenciales
2. Can generate new estados for any resident
3. Can switch residenciales and see filtered data

### As ADMIN_RESIDENCIAL
1. Can only see estados in their assigned residencial
2. Can generate estados for residents in their residencial
3. Cannot access other residenciales' data

### As RESIDENTE
1. Can only view own estados de cuenta
2. Sees summary cards with totals
3. Cannot create or modify estados
4. Cannot see other residents' data

## Development Guidelines

### To Add a New Module

1. **Create Service Layer** (`src/app/modules/[module]/service.ts`):
```typescript
import { supabase } from '../../../lib/supabase';
import { [Type], User } from '../../../types/database.types';
import { applyResidencialFilter } from '../../../lib/database';
import { logAuditEvent } from '../../../lib/audit';

export async function get[Items](user: User | null, selectedResidencialId?: string) {
  // Implement fetch logic
}

export async function create[Item](data: Partial<[Type]>, user: User) {
  // Implement create with audit logging
}

export async function update[Item](id: string, updates: Partial<[Type]>, user: User) {
  // Implement update with audit logging
}

export async function delete[Item](id: string, residencialId: string, user: User) {
  // Implement delete with audit logging
}
```

2. **Create Page Component** (`src/app/modules/[module]/[Module]Page.tsx`):
   - Import necessary UI components
   - Use `useAuth()` for user context
   - Use `useResidencial()` for multi-tenancy
   - Use `useToast()` for notifications
   - Implement role-based rendering
   - Add data table with columns
   - Add dialog forms for CRUD operations

3. **Follow Existing Pattern**: See `EstadosPage.tsx` as reference

### UI Component Usage

#### Dialog
```typescript
<Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Form Title">
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
    <DialogFooter>
      <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
        Cancelar
      </Button>
      <Button type="submit">Guardar</Button>
    </DialogFooter>
  </form>
</Dialog>
```

#### DataTable
```typescript
const columns: Column<YourType>[] = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'status', label: 'Estado', render: (item) => <StatusBadge status={item.status} type="pago" /> },
];

<DataTable
  data={items}
  columns={columns}
  loading={loading}
  onRowClick={(item) => handleRowClick(item)}
  emptyMessage="No hay registros"
/>
```

#### Toast Notifications
```typescript
const { showToast } = useToast();

showToast('Operación exitosa', 'success');
showToast('Error al guardar', 'error');
showToast('Advertencia importante', 'warning');
showToast('Información relevante', 'info');
```

#### FileUpload
```typescript
const [file, setFile] = useState<File | null>(null);
const [preview, setPreview] = useState<string | undefined>();

<FileUpload
  onFileSelect={(file) => {
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }}
  preview={preview}
  onClear={() => {
    setFile(null);
    setPreview(undefined);
  }}
  label="Comprobante de Pago"
  accept="image/*,.pdf"
  maxSize={5 * 1024 * 1024}
/>
```

## Troubleshooting

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues
- Verify `.env` file has correct Supabase credentials
- Check Supabase project is not paused
- Ensure RLS policies are not blocking queries

### Toast Not Appearing
- Verify `ToastProvider` is in `main.tsx`
- Check browser console for errors
- Ensure `useToast()` is called inside a component

### File Upload Fails
- Verify storage bucket exists in Supabase
- Check storage policies allow uploads
- Confirm file size is under limit

## Next Steps

1. **Complete Pagos UI**: Add file upload form and approval interface
2. **Implement Reservas**: Add calendar view and overlap validation
3. **Add Dashboard KPIs**: Replace placeholder data with real queries
4. **Enhance Audit Viewer**: Add filtering, export, and date range
5. **Testing**: Comprehensive testing of all role permissions

## Phase 3 Planning

- Real-time notifications with Supabase Realtime
- Webhook integration with external accounting system
- Email notifications via SendGrid/Resend
- Advanced reporting and analytics
- Mobile responsiveness improvements
- Production security hardening

---

**Need Help?** Refer to `PHASE2_IMPLEMENTATION_SUMMARY.md` for architectural details.
