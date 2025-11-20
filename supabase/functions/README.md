# Supabase Edge Functions for Push Notifications

This directory contains the server-side logic for sending push notifications via Expo Push API.

## Overview

The notification system uses a queue-based architecture with database triggers and scheduled jobs to send push notifications even when the app is closed.

## Structure

```
supabase/functions/
├── _shared/
│   └── expo.ts              # Expo Push API helper
└── process-notification-queue/
    └── index.ts             # Main notification processor
```

## Functions

### process-notification-queue

**Purpose**: Processes the notification queue and sends push notifications to users via Expo Push API.

**Triggered by**:
- **pg_cron job** (every minute) - For scheduled reminders (30min, 5min before game)
- **Database trigger** (instant) - For chat messages and player joins

**What it does**:
1. Fetches pending notifications from `notification_queue` table where `scheduled_for <= NOW()`
2. Validates user push tokens from `profiles.expo_push_token`
3. Sends notifications in batch to Expo Push API
4. Updates notification status to `sent` or `failed` in database

**Environment Variables**:
- `SUPABASE_URL` - Auto-provided by Supabase
- `SERVICE_ROLE_KEY` - Must be set via secrets (see deployment)

### _shared/expo.ts

Helper module for interacting with the Expo Push Notification API.

**Exports**:
- `NotificationMessage` - TypeScript interface for push notifications
- `sendExpoPushNotifications()` - Sends notifications to Expo API

## Notification Types

The system handles 4 types of notifications:

| Type | When Sent | Trigger |
|------|-----------|---------|
| `game_30min_reminder` | 30 minutes before game | Scheduled (cron) |
| `game_5min_reminder` | 5 minutes before game | Scheduled (cron) |
| `chat_message` | New chat message | Instant (trigger) |
| `player_joined` | Someone joins game | Instant (trigger) |

## Deployment

### Option 1: Use the Deployment Script (Recommended)

```bash
chmod +x deploy_notifications.sh
./deploy_notifications.sh
```

This will guide you through the entire setup process.

### Option 2: Manual Deployment

1. **Set the service role key:**
   ```bash
   supabase secrets set SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. **Deploy the function:**
   ```bash
   supabase functions deploy process-notification-queue --no-verify-jwt
   ```
   
   *Note: We use `--no-verify-jwt` because this function is called by pg_cron and pg_net, not by authenticated users.*

3. **Configure the database:**
   - Enable `pg_net` and `pg_cron` extensions in Supabase Dashboard
   - Update `supabase/migrations/016_setup_notification_worker.sql` with your project credentials
   - Run the migration in SQL Editor
   - Run `supabase/migrations/017_fix_notification_triggers.sql`

See **NOTIFICATION_SETUP.md** in the project root for complete setup instructions.

## Database Integration

### Tables

- **`notification_queue`** - Queue of pending/sent/failed notifications
- **`notification_settings`** - User preferences for each notification type
- **`profiles`** - Contains `expo_push_token` for each user

### Triggers

After Migration 017, these triggers are active:

| Trigger | Table | When | Function |
|---------|-------|------|----------|
| `trigger_notify_on_player_join` | `game_participants` | INSERT | `notify_on_player_join()` |
| `trigger_notify_on_chat_message` | `game_chat_messages` | INSERT | `notify_on_chat_message()` |
| `trigger_process_new_notification` | `notification_queue` | INSERT | `handle_new_notification_queue_item()` |
| `trigger_schedule_game_reminders_on_create` | `game_events` | INSERT | `schedule_game_reminder_notifications()` |

### Cron Jobs

- **`process-notification-queue`** - Runs every minute (`* * * * *`)
  - Processes scheduled notifications (game reminders)
  - Acts as a backup for instant notifications

## How It Works

### Scheduled Notifications (Game Reminders)

1. Player joins a game → INSERT into `game_participants`
2. Trigger `trigger_notify_on_player_join` fires
3. Function calculates reminder times (30min and 5min before game)
4. Inserts into `notification_queue` with future `scheduled_for` timestamp
5. Every minute, cron job invokes Edge Function
6. Edge Function finds notifications where `scheduled_for <= NOW()`
7. Sends to Expo Push API
8. Updates status to `sent`

### Instant Notifications (Chat & Player Joins)

1. Event happens (chat message or player join)
2. Database trigger inserts into `notification_queue` with `scheduled_for = NOW()`
3. `trigger_process_new_notification` detects new row
4. Immediately calls `invoke_process_notification_queue()` via `pg_net`
5. Edge Function processes and sends notification instantly
6. Updates status to `sent`

## Local Development

### Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Docker running (for local Supabase)
3. Deno runtime (auto-installed by Supabase CLI)

### Setup

```bash
# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Serve the function locally
supabase functions serve process-notification-queue
```

### Testing Locally

1. Insert a test notification:

```sql
INSERT INTO notification_queue (
  user_id,
  notification_type,
  title,
  body,
  scheduled_for,
  data
) VALUES (
  'your-test-user-id',
  'chat_message',
  'Test Notification',
  'This is a test',
  NOW(),
  '{}'::jsonb
);
```

2. Invoke the function:

```bash
curl -X POST http://localhost:54321/functions/v1/process-notification-queue \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

3. Check the notification status:

```sql
SELECT * FROM notification_queue 
WHERE title = 'Test Notification';
```

## Monitoring

### Check Queue Status

```sql
SELECT 
  status,
  notification_type,
  COUNT(*) as count,
  MAX(created_at) as last_created
FROM notification_queue
GROUP BY status, notification_type;
```

### Check Pending Notifications

```sql
SELECT 
  notification_type,
  COUNT(*) as count,
  MIN(scheduled_for) as next_scheduled
FROM notification_queue
WHERE status = 'pending'
GROUP BY notification_type;
```

### Check Recent Failures

```sql
SELECT 
  id,
  user_id,
  notification_type,
  title,
  body,
  created_at,
  scheduled_for
FROM notification_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

### View Edge Function Logs

Go to: **Supabase Dashboard → Edge Functions → process-notification-queue → Logs**

Look for:
- ✅ `Processing X notifications`
- ✅ `Expo API response: {data: [{status: 'ok'}]}`
- ❌ `No push token for user X`
- ❌ `Invalid push token for user X`

## Troubleshooting

### Notifications Not Sending

1. **Check user has valid push token:**
   ```sql
   SELECT id, username, expo_push_token 
   FROM profiles 
   WHERE id = 'user-id';
   ```
   - Token should start with `ExponentPushToken[` or `ExpoPushToken[`

2. **Check notification queue:**
   ```sql
   SELECT * FROM notification_queue 
   WHERE user_id = 'user-id' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
   - Status should be `sent` for processed notifications

3. **Check cron job is running:**
   ```sql
   SELECT * FROM cron.job 
   WHERE jobname = 'process-notification-queue';
   ```
   - Should show `* * * * *` schedule

4. **Check Edge Function logs** in Supabase Dashboard

### Game Reminders Not Scheduling

1. **Verify triggers exist:**
   ```sql
   SELECT tgname, tgrelid::regclass, tgenabled 
   FROM pg_trigger 
   WHERE tgname LIKE '%notif%' OR tgname LIKE '%reminder%';
   ```

2. **Manually reschedule for a game:**
   ```sql
   SELECT reschedule_game_reminders_for_game('game-id-here');
   ```

3. **Check if reminders were scheduled:**
   ```sql
   SELECT * FROM notification_queue
   WHERE game_id = 'game-id-here'
   AND notification_type IN ('game_30min_reminder', 'game_5min_reminder');
   ```

### Invalid Push Token Errors

- Tokens must start with `ExponentPushToken[` or `ExpoPushToken[`
- User must use a **development/production build**, not Expo Go
- Token must be registered via `registerForPushNotificationsAsync()` in the mobile app

## Maintenance

### Reschedule All Game Reminders

If you need to fix existing games:

```sql
DO $$
DECLARE
  game_record RECORD;
BEGIN
  FOR game_record IN 
    SELECT id FROM game_events 
    WHERE status IN ('waiting', 'confirmed') 
      AND scheduled_time > NOW()
  LOOP
    PERFORM reschedule_game_reminders_for_game(game_record.id);
  END LOOP;
END $$;
```

### Clean Up Old Notifications

```sql
-- Delete sent/failed notifications older than 7 days
DELETE FROM notification_queue 
WHERE status IN ('sent', 'failed') 
  AND created_at < NOW() - INTERVAL '7 days';
```

### Archive Processed Notifications

For better performance with large volumes:

```sql
-- Create archive table
CREATE TABLE IF NOT EXISTS notification_queue_archive (LIKE notification_queue);

-- Move old processed notifications
INSERT INTO notification_queue_archive
SELECT * FROM notification_queue
WHERE status IN ('sent', 'failed')
  AND created_at < NOW() - INTERVAL '30 days';

DELETE FROM notification_queue
WHERE status IN ('sent', 'failed')
  AND created_at < NOW() - INTERVAL '30 days';
```

## Production Recommendations

1. **Use Supabase Vault** for storing the service role key securely
2. **Set up monitoring** for failed notifications (consider a daily summary)
3. **Add retry logic** for failed notifications (currently not implemented)
4. **Rate limit** notification sending if you have high volume
5. **Archive old notifications** to keep the queue table performant
6. **Monitor Expo API limits**:
   - Free tier: 600 notifications/hour
   - Paid tier: Higher limits available

## Related Files

- **Database schema**: `supabase/migrations/011_notification_settings.sql`
- **Worker setup**: `supabase/migrations/016_setup_notification_worker.sql`
- **Bug fixes**: `supabase/migrations/017_fix_notification_triggers.sql`
- **Mobile service**: `apps/mobile/src/services/notifications.ts`
- **Deployment script**: `deploy_notifications.sh`
- **Complete setup guide**: `NOTIFICATION_SETUP.md`

## Support

For complete setup instructions and troubleshooting, see **NOTIFICATION_SETUP.md** in the project root.
