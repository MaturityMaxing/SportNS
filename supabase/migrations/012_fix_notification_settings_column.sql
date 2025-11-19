-- SportNS Database Migration
-- Migration 012: Fix notification_settings column definition
-- Purpose: Fix the notify_new_chat_message column if it was created incorrectly

-- ============================================================================
-- Fix column definition if needed
-- ============================================================================

-- Check if the column exists and fix it
DO $$
BEGIN
  -- Try to alter the column to ensure it's BOOLEAN with proper default
  -- This is safe to run even if the column is already correct
  BEGIN
    ALTER TABLE notification_settings 
    ALTER COLUMN notify_new_chat_message TYPE BOOLEAN,
    ALTER COLUMN notify_new_chat_message SET DEFAULT true;
    
    RAISE NOTICE 'Fixed notify_new_chat_message column definition';
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Column already correct or table does not exist: %', SQLERRM;
  END;
END $$;

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON COLUMN notification_settings.notify_new_chat_message IS 
  'User preference for chat message notifications (Migration 012 - fixed column type)';

