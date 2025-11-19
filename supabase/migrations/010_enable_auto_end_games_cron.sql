-- Migration 010: Enable pg_cron for auto-ending games after 2 hours
-- This sets up the scheduled job that periodically ends old games

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the auto_end_old_games function to run every 5 minutes
-- This will automatically end games that are 2+ hours past their scheduled time
SELECT cron.schedule(
  'auto-end-old-games',           -- Job name
  '*/5 * * * *',                   -- Every 5 minutes (cron format)
  $$SELECT auto_end_old_games()$$ -- Function to call
);

-- Grant necessary permissions to the postgres role for the cron extension
-- Note: This is required for Supabase to execute the cron job
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA cron TO postgres;

-- Run the function once immediately to clean up any existing old games
SELECT auto_end_old_games();

-- Add a comment to explain what this does
COMMENT ON FUNCTION auto_end_old_games() IS 
  'Automatically ends games that are 2+ hours past their scheduled start time. Runs via cron every 5 minutes.';

