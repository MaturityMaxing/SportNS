# Quick Testing Guide - Discord OAuth

## Prerequisites Checklist

Before testing, make sure you have:

- [x] Created a Supabase project
- [x] Run database migrations (from Day 1)
- [x] Created a Discord OAuth app
- [x] Enabled Discord in Supabase Authentication
- [x] Created `.env` file with correct credentials

## Required Environment Variables

Create `/apps/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Discord OAuth Configuration

### In Discord Developer Portal
1. Go to https://discord.com/developers/applications
2. Create/select your application
3. OAuth2 → Redirects → Add:
   - `sportns://auth/callback`
   - `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret

### In Supabase Dashboard
1. Authentication → Providers → Discord
2. Enable Discord
3. Paste Client ID and Client Secret
4. Save

## Testing Steps

### 1. Start the App

```bash
# From project root
pnpm mobile

# Or from apps/mobile
pnpm start
```

### 2. Test Login Flow

1. **LoginScreen appears** ✅
   - Should see SportNS logo and branding
   - "Sign in with Discord" button visible

2. **Click Sign in** ✅
   - Button shows loading spinner
   - Browser opens with Discord OAuth page

3. **Authorize in Discord** ✅
   - Discord authorization page loads
   - Shows permissions requested
   - Click "Authorize"

4. **Redirect back to app** ✅
   - Browser closes automatically
   - App processes the OAuth callback
   - Brief loading state

5. **ProfileScreen appears** ✅
   - Shows your Discord avatar
   - Displays your Discord username
   - Shows Discord ID
   - Statistics cards visible (showing 0s)

### 3. Test Session Persistence

1. Close the app completely
2. Reopen the app
3. **Should go directly to ProfileScreen** ✅
   - No need to login again
   - Profile data loads automatically

### 4. Test Sign Out

1. Scroll down in ProfileScreen
2. Click "Sign Out" button
3. Confirmation dialog appears
4. Click "Sign Out"
5. **Returns to LoginScreen** ✅

### 5. Verify Database

In Supabase Dashboard:
1. Go to Table Editor → profiles
2. You should see your user record with:
   - `id` - Your user ID
   - `discord_id` - Your Discord ID
   - `discord_username` - Your Discord name
   - `discord_avatar_url` - Avatar URL
   - `created_at` - Timestamp

## Common Issues and Solutions

### Issue: "No OAuth URL returned"
**Solution:** 
- Check `.env` file exists and has correct values
- Verify Supabase URL and anon key
- Restart Expo dev server after adding `.env`

### Issue: Browser opens but shows error
**Solution:**
- Verify Discord is enabled in Supabase
- Check Discord Client ID/Secret are correct
- Ensure redirect URLs match exactly

### Issue: Redirect doesn't work
**Solution:**
- Check `app.json` has `"scheme": "sportns"`
- Rebuild app: Close Expo, `expo start -c`
- On Android, uninstall and reinstall the app

### Issue: Profile screen is blank
**Solution:**
- Check network connection
- Verify database migrations have run
- Check RLS policies in Supabase
- Look at console logs for errors

### Issue: Session doesn't persist
**Solution:**
- Verify expo-secure-store is installed
- Check device has sufficient storage
- Try clearing app data and logging in again

## Debugging Tips

### View Console Logs
The app logs important auth events:
```
Redirect URI: sportns://auth/callback
Auth state changed: SIGNED_IN <user-id>
```

### Check Supabase Logs
In Supabase Dashboard:
- Database → Logs
- Authentication → Logs
- Look for errors or rejected requests

### Test Deep Linking
```bash
# List registered URL schemes
npx uri-scheme list

# Should show: sportns
```

### Clear App Data
```bash
# iOS Simulator
# Device Settings → Expo Go → Reset

# Android Emulator
# Settings → Apps → Expo Go → Storage → Clear Data
```

## Expected Behavior Summary

✅ **Successful Flow:**
1. LoginScreen → Discord OAuth → ProfileScreen
2. Profile shows Discord data with avatar
3. Session persists after app restart
4. Sign out returns to LoginScreen
5. No errors in console

❌ **If Something Fails:**
1. Check console logs for specific errors
2. Verify all setup steps completed
3. Ensure .env file is loaded (restart dev server)
4. Check Supabase Dashboard for auth logs
5. Verify Discord app settings match

## Quick Environment Check

Run this command to verify TypeScript compiles:
```bash
cd apps/mobile && pnpm typecheck
```

Should output: No errors ✅

## Support

If you encounter issues:
1. Check the console logs
2. Review SETUP_AUTH.md for detailed setup
3. Verify all prerequisites are met
4. Check Supabase and Discord dashboards for errors

## Next Steps After Testing

Once authentication works:
- [ ] Move on to Day 3: Navigation & UI Foundation
- [ ] Set up bottom tab navigation
- [ ] Create Free Play screen
- [ ] Create Leaderboards screen
- [ ] Integrate ProfileScreen into tab navigation

---

Happy testing! 🚀

