# Quick Start Guide - Portal de Residentes

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Access to Supabase Dashboard: https://0ec90b57d6e95fcbda19832f.supabase.co

## Step 1: Install Dependencies (Already Done!)

```bash
npm install
```

## Step 2: Setup Database (5 minutes)

### 2.1 Run Schema
1. Open [Supabase SQL Editor](https://0ec90b57d6e95fcbda19832f.supabase.co/project/_/sql)
2. Copy all content from `src/scripts/schema.sql`
3. Paste and click **Run**
4. Wait for "Success. No rows returned"

### 2.2 Run Seeds
1. In SQL Editor, create **New Query**
2. Copy all content from `src/scripts/seed.sql`
3. Paste and click **Run**

### 2.3 Create Test User (SUPERADMIN)
1. Go to [Authentication > Users](https://0ec90b57d6e95fcbda19832f.supabase.co/project/_/auth/users)
2. Click **Add User** > **Create new user**
3. Enter:
   - Email: `admin@conversion.tech`
   - Password: `Admin123!`
   - ✅ Check "Auto Confirm User"
4. Click **Create user**
5. **Copy the User ID** from the users list

### 2.4 Link Profile
1. Go back to SQL Editor
2. Run this query (replace YOUR_USER_ID):
```sql
INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
VALUES ('YOUR_USER_ID_HERE', 'Super Administrador', NULL, 'SUPERADMIN', NULL);
```

## Step 3: Start Application

```bash
npm run dev
```

## Step 4: Login

1. Open http://localhost:5173
2. Login with:
   - Email: `admin@conversion.tech`
   - Password: `Admin123!`

## Step 5: Explore

✅ You should see the dashboard with:
- Welcome message with your name
- Role badge showing "Super Admin"
- Full navigation menu on the left
- Residencial selector in the top bar

## What to Try

1. **Navigation:** Click through different menu items
2. **Residencial Selector:** Change residencial in top bar
3. **User Menu:** Click your avatar in top right
4. **Placeholder Pages:** Visit any module to see Phase 2 message
5. **Responsive:** Resize browser to see mobile view

## Create More Test Users (Optional)

Follow the same process (2.3 + 2.4) with these credentials:

### Admin Residencial
- Email: `admin.asm1@example.com`
- Password: `Admin123!`
- Profile SQL:
```sql
INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
VALUES ('USER_ID', 'Administrador ASM1', '+52 555 123 4567', 'ADMIN_RESIDENCIAL',
        (SELECT id FROM residenciales WHERE codigo = 'ASM1'));
```

### Residente
- Email: `residente1@example.com`
- Password: `Residente123!`
- Profile SQL:
```sql
INSERT INTO profiles (id, nombre, telefono, rol, residencial_id)
VALUES ('USER_ID', 'Juan Perez', '+52 123 456 7890', 'RESIDENTE',
        (SELECT id FROM residenciales WHERE codigo = 'ASM1'));
```

## Troubleshooting

### Can't Login?
- ✅ Check user exists in Authentication > Users
- ✅ Verify profile exists in Database > profiles table
- ✅ Make sure profile.id = auth.users.id
- ✅ Try clearing browser cache

### Dashboard is Blank?
- ✅ Open browser console (F12) and check for errors
- ✅ Verify .env file has correct Supabase credentials
- ✅ Make sure profile has correct rol value

### Navigation Not Showing?
- ✅ Check user.rol in profiles table
- ✅ Refresh the page
- ✅ Clear localStorage and login again

## Next Steps

1. ✅ Test all user roles
2. ✅ Familiarize yourself with the navigation
3. ✅ Review the documentation:
   - README.md - Full documentation
   - DATABASE_SETUP.md - Detailed DB setup
   - PROJECT_CONTEXT.md - Architecture guide
4. ✅ Ready for Phase 2!

## Need Help?

- 📖 Full docs: See README.md
- 🗄️ Database issues: See DATABASE_SETUP.md
- 🔑 Credentials: See CREDENTIALS.md
- 📋 Complete status: See IMPLEMENTATION_SUMMARY.md

## Build for Production

```bash
npm run build
npm run preview
```

Then deploy the `dist/` folder to your hosting platform.

---

**That's it!** You now have a fully functional multi-tenant resident portal with role-based access control. 🎉
