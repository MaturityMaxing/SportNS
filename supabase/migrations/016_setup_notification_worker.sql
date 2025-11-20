-- Migration 016: Setup Notification Worker
-- Purpose: Schedule cron job to process notification queue
--
-- IMPORTANT: This migration requires manual configuration!
-- See instructions at the end of this file.

-- Enable required extensions
-- Note: If these fail with "dependent privileges exist", comment them out
-- and enable them via the Supabase Dashboard > Database > Extensions.
-- In local development, they are usually pre-installed.
-- For Supabase Cloud: Enable these in Dashboard > Database > Extensions
-- CREATE EXTENSION IF NOT EXISTS pg_net;
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- Function to invoke the Edge Function
-- ============================================================================

-- Note: You need to replace the URL and Authorization header with your actual values
-- OR configure this via the Supabase Dashboard (Database > Webhooks / Cron)
-- This SQL is provided as a template/fallback.

-- Function to process the queue (invokes Edge Function)
CREATE OR REPLACE FUNCTION invoke_process_notification_queue()
RETURNS JSONB AS $$
DECLARE
  project_url TEXT := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-notification-queue';
  service_role_key TEXT := 'YOUR_SERVICE_ROLE_KEY'; -- SECURITY WARNING: Use Vault or Dashboard in production
  request_id BIGINT;
BEGIN
  -- Make HTTP request to Edge Function
  SELECT net.http_post(
    url := project_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := '{}'::jsonb
  ) INTO request_id;

  RETURN jsonb_build_object('request_id', request_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Cron Job for Scheduled Reminders (30min, 5min)
-- ============================================================================

-- Run every minute to check for due reminders
-- Note: pg_cron needs to be enabled in Dashboard
SELECT cron.schedule(
  'process-notification-queue', -- job name
  '* * * * *',                  -- every minute
  $$ SELECT invoke_process_notification_queue() $$
);


-- ============================================================================
-- Trigger for Instant Notifications (Chat, Join)
-- ============================================================================

-- Function to handle new queue items (trigger)
CREATE OR REPLACE FUNCTION handle_new_notification_queue_item()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is pending and scheduled_for is now (or in past), process immediately
  IF NEW.status = 'pending' AND NEW.scheduled_for <= NOW() THEN
    PERFORM invoke_process_notification_queue();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on Insert
CREATE TRIGGER trigger_process_new_notification
  AFTER INSERT ON notification_queue
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_notification_queue_item();

-- ============================================================================
-- IMPORTANT: MANUAL CONFIGURATION REQUIRED
-- ============================================================================
-- 
-- After deploying the Edge Function, you MUST:
--
-- 1. Enable pg_net and pg_cron extensions:
--    - Go to Supabase Dashboard > Database > Extensions
--    - Enable "pg_net" extension
--    - Enable "pg_cron" extension
--
-- 2. Update the invoke_process_notification_queue() function:
--    - Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
--    - Replace 'YOUR_SERVICE_ROLE_KEY' with your actual service role key
--    - Better yet: Use Supabase Vault to store the service role key securely
--
-- 3. Verify the cron job is scheduled:
--    - Run: SELECT * FROM cron.job;
--    - You should see 'process-notification-queue' running every minute
--
-- 4. Test the system:
--    - Insert a test notification: 
--      INSERT INTO notification_queue (user_id, notification_type, title, body, scheduled_for)
--      VALUES ('your-user-id', 'chat_message', 'Test', 'Test message', NOW());
--    - Check if it gets processed within 1 minute
--    - Check Edge Function logs in Supabase Dashboard > Edge Functions
--
-- ============================================================================

