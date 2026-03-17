/*
  # Seed Data for Resident Portal - Phase 1

  ## Overview
  Initial data population for testing and demonstration purposes.

  ## Data Created

  1. **Residencial**: Arcos Santa Maria I (ASM1)
  2. **Residencias**: 5 sample housing units
  3. **Users**: 4 test users with different roles

  ## Test Credentials

  - SUPERADMIN: admin@conversion.tech / Admin123!
  - ADMIN_RESIDENCIAL: admin.asm1@example.com / Admin123!
  - RESIDENTE 1: residente1@example.com / Residente123!
  - RESIDENTE 2: residente2@example.com / Residente123!

  ## Important Notes
  - Users must be created via Supabase Auth dashboard or API
  - After creating auth users, insert corresponding profiles manually using user IDs
  - This script only creates residenciales and residencias
  - Manual profile creation steps are documented below
*/

INSERT INTO residenciales (id, nombre, codigo, direccion, created_at, updated_at)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Arcos Santa Maria I', 'ASM1', 'Calle Principal 123, Ciudad', NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO residencias (residencial_id, codigo, manzana, numero, estado, created_at, updated_at)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ASM1-A-101', 'A', '101', 'activa', NOW(), NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ASM1-A-102', 'A', '102', 'activa', NOW(), NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ASM1-B-201', 'B', '201', 'activa', NOW(), NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ASM1-B-202', 'B', '202', 'inactiva', NOW(), NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ASM1-C-301', 'C', '301', 'activa', NOW(), NOW())
ON CONFLICT DO NOTHING;
