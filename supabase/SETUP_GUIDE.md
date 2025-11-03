# Supabase Setup Guide for SportNS

This guide will walk you through setting up your Supabase project for SportNS.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the details:
   - **Name**: SportNS
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

5. Wait for the project to be created (~2 minutes)

## Step 2: Run Database Migrations

Once your project is ready:

1. Go to the SQL Editor in your Supabase dashboard
2. Run each migration file in order:
   - Copy the content of `migrations/001_initial_schema.sql`
   - Paste into SQL Editor and click "Run"
   - Repeat for `002_seed_sports.sql`
   - Repeat for `003_rls_policies.sql`
   - Repeat for `004_realtime_setup.sql`

**Alternative**: Use Supabase CLI (if installed):
```bash
supabase db push
```

## Step 3: Configure Discord OAuth

1. Create a Discord Application:
   - Go to [https://discord.com/developers/applications](https://discord.com/developers/applications)
   - Click "New Application"
   - Name it "SportNS"
   - Go to the "OAuth2" section
   - Copy your **Client ID** and **Client Secret**

2. Configure OAuth Redirect URLs:
   - In Discord OAuth2 settings, add redirect URL:
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
   - Replace `YOUR_PROJECT_REF` with your actual Supabase project reference ID
   - You can find this in your Supabase project settings

3. Enable Discord Auth in Supabase:
   - In Supabase Dashboard, go to "Authentication" → "Providers"
   - Find "Discord" and enable it
   - Paste your Discord **Client ID** and **Client Secret**
   - Save changes

## Step 4: Get Your Supabase Credentials

1. In Supabase Dashboard, go to "Project Settings" → "API"
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 5: Configure Environment Variables

1. Create `.env` file in `apps/mobile/`:
```bash
cd apps/mobile
cp .env.example .env
```

2. Edit `apps/mobile/.env` with your credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. **Important**: Never commit `.env` to git! It's already in `.gitignore`.

## Step 6: Verify Setup

Run this SQL query in the Supabase SQL Editor to verify everything is set up:

```sql
-- Check that all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show: challenges, game_scores, player_availability, player_elo_ratings, profiles, sports

-- Check sports data
SELECT * FROM sports;

-- Should show 9 sports
```

## Step 7: Test Connection from App

1. Start your Expo app:
```bash
pnpm mobile
```

2. The Supabase client should now be able to connect to your database!

## Troubleshooting

### "relation does not exist" error
- Make sure you ran all migrations in order
- Check the SQL Editor for any errors

### Discord OAuth not working
- Verify redirect URLs match exactly (including https://)
- Make sure you copied the Client ID and Secret correctly
- Check that Discord provider is enabled in Supabase

### Can't connect from app
- Double-check `.env` file has correct URL and key
- Make sure you're using `EXPO_PUBLIC_` prefix for environment variables
- Restart the Expo dev server after changing `.env`

## Next Steps

After setup is complete:
- ✅ Day 1 tasks are done!
- 🚀 Move on to Day 2: Implement Discord OAuth authentication flow
- Check the PRD (`prd.md`) for the full 14-day plan

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Discord OAuth Documentation](https://discord.com/developers/docs/topics/oauth2)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

