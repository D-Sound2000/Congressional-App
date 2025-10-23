-- Fix RLS policies for recipes table to allow inserts
-- Run this SQL in your Supabase SQL editor

-- Add INSERT policy for recipes table
CREATE POLICY "Users can insert recipes" ON recipes
  FOR INSERT WITH CHECK (true);

-- Add UPDATE policy for recipes table  
CREATE POLICY "Users can update recipes" ON recipes
  FOR UPDATE USING (true);

-- Add DELETE policy for recipes table
CREATE POLICY "Users can delete recipes" ON recipes
  FOR DELETE USING (true);
