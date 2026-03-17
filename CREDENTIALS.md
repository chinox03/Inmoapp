# Test User Credentials - Phase 1

## Default Test Users

After completing the database setup, use these credentials to test different user roles:

### Super Administrator
- **Email:** admin@conversion.tech
- **Password:** Admin123!
- **Role:** SUPERADMIN
- **Access:** Full system access, can switch between residenciales
- **Features:** Can access all modules including Residenciales, Usuarios, and Auditoria

### Residential Administrator
- **Email:** admin.asm1@example.com
- **Password:** Admin123!
- **Role:** ADMIN_RESIDENCIAL
- **Residencial:** Arcos Santa Maria I (ASM1)
- **Access:** Full management of ASM1
- **Features:** Can manage residents, view audit logs, has read-only access to Accesos and Mudanzas

### Resident 1
- **Email:** residente1@example.com
- **Password:** Residente123!
- **Name:** Juan Perez
- **Role:** RESIDENTE
- **Residencial:** Arcos Santa Maria I (ASM1)
- **Access:** Personal data only
- **Features:** Can view own account statements, reservations, warnings, accesses, and moving requests

### Resident 2
- **Email:** residente2@example.com
- **Password:** Residente123!
- **Name:** Maria Garcia
- **Role:** RESIDENTE
- **Residencial:** Arcos Santa Maria I (ASM1)
- **Access:** Personal data only
- **Features:** Can view own account statements, reservations, warnings, accesses, and moving requests

## Testing Scenarios

### Test 1: SUPERADMIN Access
1. Login as admin@conversion.tech
2. Verify you can see all menu items
3. Check residencial selector appears in topbar
4. Navigate to Usuarios and Residenciales pages
5. Verify placeholder pages load correctly

### Test 2: ADMIN_RESIDENCIAL Access
1. Login as admin.asm1@example.com
2. Verify limited menu items (no Residenciales or Usuarios)
3. Check residencial selector does NOT appear
4. Verify "Solo lectura" badge on Accesos and Mudanzas
5. Navigate to Auditoria page

### Test 3: RESIDENTE Access
1. Login as residente1@example.com
2. Verify only "Mi..." prefixed menu items visible
3. Check no admin features accessible
4. Navigate to Mi Estado de Cuenta
5. Verify placeholder pages load

### Test 4: Role-Based Restrictions
1. Try accessing /dashboard/usuarios as ADMIN_RESIDENCIAL
2. Should redirect to unauthorized page
3. Try accessing /dashboard/residenciales as RESIDENTE
4. Should redirect to unauthorized page

## Security Notes

- All passwords follow format: [Role]123!
- Passwords are hashed by Supabase Auth
- Never commit these credentials to public repositories
- Change these credentials in production environments
- Use strong, unique passwords for production

## Creating Additional Users

To create new test users:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" > "Create new user"
3. Enter email and password
4. Copy the generated User ID
5. Insert profile record in SQL Editor:
   ```sql
   INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
   VALUES ('USER_ID', 'Name', 'Phone', 'ROLE', 'RESIDENCIAL_ID');
   ```

## Troubleshooting Login Issues

### "Invalid credentials"
- Verify user exists in Authentication > Users
- Check password is correct
- Ensure email is typed exactly as shown

### "User profile not found"
- Check profiles table has entry with matching auth.users.id
- Verify rol field is set correctly
- Ensure residencial_id is set for non-SUPERADMIN users

### "Cannot access dashboard"
- Clear browser cache and cookies
- Check browser console for errors
- Verify Supabase environment variables in .env file
