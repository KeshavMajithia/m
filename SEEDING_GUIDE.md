# How to Get Your Supabase Service Role Key

## Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Click on your project (rjtgydhipvksgebeqbpo)

## Step 2: Navigate to API Settings
1. In the left sidebar, click the **gear icon** (Settings)
2. Click **"API"** from the settings menu

## Step 3: Copy Service Role Key
1. Scroll down to the section **"Project API keys"**
2. You'll see two keys:
   - `anon` `public` - This is already in your .env ✓
   - `service_role` `secret` - **Copy this one** ⚠️
3. Click the copy icon next to the `service_role` key

## Step 4: Add to .env File
Open your `.env` file and add this line:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Your complete `.env` should look like:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://rjtgydhipvksgebeqbpo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqdGd5ZGhpcHZrc2dlYmVxYnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MDY1NDEsImV4cCI6MjA2OTI4MjU0MX0.PoY0Sd3dR8x57rtP6ajMGQAHZd63Df1usPVUs7Yy9v4
SUPABASE_SERVICE_ROLE_KEY=<paste_your_service_role_key_here>
```

## Step 5: Run Seed Script Again
```bash
node scripts/seed_supabase.js
```

Expected output:
```
🚀 Starting Database Seed...
📦 Loaded 672 zone mappings and 7400 rates.
🌍 Seeding Zone Mappings...
  ✅ Inserted zone_mappings 1 to 672
💰 Seeding Rates...
  ✅ Inserted rates 1 to 1000
  ✅ Inserted rates 1001 to 2000
  ✅ Inserted rates 2001 to 3000
  ✅ Inserted rates 3001 to 4000
  ✅ Inserted rates 4001 to 5000
  ✅ Inserted rates 5001 to 6000
  ✅ Inserted rates 6001 to 7000
  ✅ Inserted rates 7001 to 7400
🎉 Seeding Complete!
```

## Why Service Role Key?
- **Anon Key**: Public key, respects RLS policies (can't insert data)
- **Service Role Key**: Admin key, bypasses RLS (can insert data)

⚠️ **Security Note**: Never commit the service role key to git! It's already in `.gitignore`.
