-- ULTIMATE FIX: Remove foreign key constraints and add RLS policies
-- Run this SQL in your Supabase SQL editor

-- 1. Drop all foreign key constraints on meal_plans table
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_breakfast_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_lunch_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_dinner_recipe_id_fkey;

-- 2. Add RLS policies for recipes table to allow all operations
CREATE POLICY "Users can insert recipes" ON recipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update recipes" ON recipes
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete recipes" ON recipes
  FOR DELETE USING (true);

-- 3. Optional: Add check constraints to ensure data integrity without foreign keys
-- This allows external recipe IDs (> 1000) while still maintaining some validation
ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_breakfast_recipe_id_check 
CHECK (breakfast_recipe_id IS NULL OR breakfast_recipe_id > 0);

ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_lunch_recipe_id_check 
CHECK (lunch_recipe_id IS NULL OR lunch_recipe_id > 0);

ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_dinner_recipe_id_check 
CHECK (dinner_recipe_id IS NULL OR dinner_recipe_id > 0);
