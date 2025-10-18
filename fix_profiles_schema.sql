-- Fix missing columns in profiles table
-- Run this SQL in your Supabase SQL editor

-- Add missing columns to profiles table if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diabetes_type VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insulin_dependent BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medications TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS doctor_info TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS glucose_targets JSONB;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY column_name;


