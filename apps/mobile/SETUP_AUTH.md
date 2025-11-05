# Discord OAuth Setup Guide

This guide will help you set up Discord OAuth authentication for SportNS.

## Prerequisites

1. A Supabase account and project
2. A Discord application for OAuth

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or use an existing one
3. Wait for the project to be fully initialized

### 1.2 Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the public API key)

### 1.3 Create Environment File

Create a `.env` file in `/apps/mobile/` with:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Never commit the `.env` file to git!

## Step 2: Set Up Discord OAuth

### 2.1 Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Give it a name (e.g., "SportNS")
4. Go to the **OAuth2** section

### 2.2 Configure Discord OAuth

1. Copy your **Client ID** and **Client Secret**
2. Add the following redirect URL:
   ```
   sportns://auth/callback
   ```
3. Also add your Supabase callback URL:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

### 2.3 Enable Discord in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Discord** and enable it
3. Enter your Discord **Client ID** and **Client Secret**
4. Add the redirect URL: `sportns://auth/callback`
5. Save the configuration

## Step 3: Database Migration

Make sure you've run the database migrations to create the necessary tables:

```bash
cd supabase
# Run migrations if not already done
```

The following tables should exist:
- `profiles` - User profiles with Discord info
- `sports` - Sports list
- `player_availability` - User availability per sport
- `player_elo_ratings` - ELO ratings per sport
- `challenges` - Challenge data
- `game_scores` - Game results

## Step 4: Test the Authentication Flow

### 4.1 Start the Development Server

```bash
# From the root directory
pnpm mobile

# Or from apps/mobile directory
pnpm start
```

### 4.2 Test on Device/Simulator

1. Scan the QR code with Expo Go app
2. Click **Sign in with Discord**
3. You should be redirected to Discord OAuth
4. Authorize the application
5. You should be redirected back to the app
6. Your profile screen should appear with Discord info

### Troubleshooting

#### OAuth URL Not Working

- Verify the redirect URL matches exactly in both Discord and Supabase
- Check that the scheme is set correctly in `app.json`
- Ensure deep linking is working: `npx uri-scheme list`

#### Session Not Persisting

- Check that expo-secure-store is properly installed
- Verify Supabase client configuration in `supabase.ts`
- Check console logs for any auth errors

#### Profile Not Creating

- Verify database migrations have run
- Check RLS policies allow insert/update on profiles table
- Look for errors in Supabase Dashboard → Database → Logs

## Deep Linking Configuration

The app uses the custom URL scheme `sportns://` for OAuth callbacks:

- **Scheme**: `sportns`
- **Callback Path**: `sportns://auth/callback`

This is configured in:
- `app.json` - Expo configuration
- `auth.ts` - OAuth redirect URI

## Security Notes

1. The **anon key** is safe to use in client-side code
2. RLS policies should be enabled to protect data
3. Never expose your Supabase service role key
4. Discord client secret should only be in Supabase dashboard

## Next Steps

After authentication is working:
1. Test profile creation
2. Verify user data in Supabase Dashboard
3. Test sign out functionality
4. Move on to Day 3: Navigation & UI Foundation

