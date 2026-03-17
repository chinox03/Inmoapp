# Create Test Users - Step by Step

## Database Setup Complete! ✅

Your database schema and seed data have been successfully created:
- ✅ 4 tables created (residenciales, profiles, residencias, audit_log)
- ✅ RLS policies enabled on all tables
- ✅ 1 Residencial: "Arcos Santa Maria I" (ASM1)
- ✅ 5 Residencias: ASM1-A-101, ASM1-A-102, ASM1-B-201, ASM1-B-202, ASM1-C-301

## Next Step: Create Test Users

You need to create users in Supabase Auth Dashboard. Follow these steps:

### Method 1: Using Supabase Dashboard (Easiest)

1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/gapzosqoxmyymdklhwyf
2. Navigate to **Authentication** > **Users** in the left sidebar
3. Click **Add User** button (top right)
4. Select **Create new user**

#### User 1: SUPERADMIN
- Email: `admin@conversion.tech`
- Password: `Admin123!`
- ✅ Check "Auto Confirm User"
- Click **Create user**
- **Copy the User ID** from the users list
- Go to **SQL Editor** and run:
```sql
INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
VALUES ('PASTE_USER_ID_HERE', 'Super Administrador', NULL, 'SUPERADMIN', NULL);
```

#### User 2: ADMIN_RESIDENCIAL
- Email: `admin.asm1@example.com`
- Password: `Admin123!`
- ✅ Check "Auto Confirm User"
- Click **Create user**
- **Copy the User ID**
- Run in SQL Editor:
```sql
INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
VALUES ('PASTE_USER_ID_HERE', 'Administrador ASM1', '+52 555 123 4567', 'ADMIN_RESIDENCIAL', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');
```

#### User 3: RESIDENTE 1
- Email: `residente1@example.com`
- Password: `Residente123!`
- ✅ Check "Auto Confirm User"
- Click **Create user**
- **Copy the User ID**
- Run in SQL Editor:
```sql
INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
VALUES ('PASTE_USER_ID_HERE', 'Juan Perez', '+52 123 456 7890', 'RESIDENTE', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');
```

#### User 4: RESIDENTE 2
- Email: `residente2@example.com`
- Password: `Residente123!`
- ✅ Check "Auto Confirm User"
- Click **Create user**
- **Copy the User ID**
- Run in SQL Editor:
```sql
INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
VALUES ('PASTE_USER_ID_HERE', 'Maria Garcia', '+52 098 765 4321', 'RESIDENTE', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');
```

### Method 2: Using SQL (Advanced)

If you have the service role key, you can create users via SQL:

```sql
-- This requires service_role access
-- Use Supabase Dashboard Auth section instead for easier setup
```

## After Creating Users

### Start the Application
```bash
npm run dev
```

### Test Login
1. Open http://localhost:5173
2. You should see the login page
3. Login with: `admin@conversion.tech` / `Admin123!`
4. You should be redirected to the dashboard

### What to Expect

**As SUPERADMIN (admin@conversion.tech):**
- Full navigation menu visible
- Residencial selector in top bar
- All placeholder modules accessible
- Welcome message with your name and role badge

**As ADMIN_RESIDENCIAL (admin.asm1@example.com):**
- Limited menu (no Residenciales or Usuarios)
- No residencial selector
- "Solo lectura" badges on Accesos and Mudanzas
- Can access Auditoria

**As RESIDENTE (residente1@example.com):**
- Only "Mi..." prefixed menu items
- Personal data modules only
- No admin features

## Troubleshooting

### "Cannot login"
- Verify user exists in Authentication > Users
- Check you created the profile in profiles table
- Ensure profile.id matches auth.users.id exactly
- Try "Forgot Password" to verify email

### "Profile not found"
- Check profiles table in Database > Table Editor
- Verify the INSERT query ran successfully
- Make sure rol is spelled correctly (case-sensitive)

### "Dashboard is blank"
- Open browser console (F12)
- Check for errors
- Verify .env file has correct Supabase URL and Key
- Clear browser cache and try again

## Verify Everything Works

Run this query to check profiles were created:
```sql
SELECT
  p.id,
  p.nombre,
  p.rol,
  u.email,
  r.nombre as residencial
FROM profiles p
JOIN auth.users u ON u.id = p.id
LEFT JOIN residenciales r ON r.id = p.residencial_id
ORDER BY p.rol;
```

You should see 4 rows with all user information.

## Ready to Use!

Once you've created at least the SUPERADMIN user, you can:
1. Start the dev server: `npm run dev`
2. Login and explore the portal
3. Create the other test users as needed
4. Begin Phase 2 development

---

**Need Help?** Check QUICK_START.md for a complete walkthrough.
