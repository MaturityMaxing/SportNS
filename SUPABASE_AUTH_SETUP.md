# Supabase Auth Configuration for Username-Only Authentication

## Required Settings

To enable the username-only authentication flow, you need to disable email confirmation in your Supabase project.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Providers" tab
   - Find "Email" provider

3. **Disable Email Confirmation**
   - Toggle OFF: "Enable email confirmations"
   - Click "Save"

4. **Optional: Disable Email Provider (if not using)**
   - You can leave Email enabled since we're using it internally
   - The email format is: `username@sportns.local` (not real emails)

### Alternative: SQL Command

You can also run this SQL in the Supabase SQL Editor:

```sql
-- Disable email confirmation requirement
UPDATE auth.config 
SET enable_signup = true,
    enable_email_confirmations = false
WHERE id = 1;
```

### How It Works

**Username to Auth Mapping:**
- User enters: `john`
- System creates: 
  - Email: `john@sportns.local`
  - Password: `john_sportns_2024`
- User never sees email/password (transparent)

**Returning Users:**
- System recognizes username from database
- Auto-generates same email/password
- Signs in automatically

**Security Notes:**
- In production, use environment-specific passwords
- Consider adding device fingerprinting
- The `@sportns.local` domain is internal-only

## Verification

After making these changes, try the app again:

```bash
cd apps/mobile
pnpm start
# Press 'a' for Android or 'i' for iOS
```

The error "Anonymous sign-ins are disabled" should be gone!

