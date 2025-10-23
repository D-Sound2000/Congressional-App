-- Complete database cleanup for meal planner
-- Run this SQL in your Supabase SQL editor

-- Check existing constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='meal_plans';

-- Drop foreign key constraints
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_breakfast_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_lunch_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_dinner_recipe_id_fkey;

-- Drop check constraints
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_breakfast_recipe_id_check;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_lunch_recipe_id_check;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_dinner_recipe_id_check;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete recipes" ON recipes;

-- Create new policies
CREATE POLICY "Users can insert recipes" ON recipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update recipes" ON recipes
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete recipes" ON recipes
  FOR DELETE USING (true);

-- Test recipe insertion
INSERT INTO recipes (id, name, description, category, difficulty, servings, calories, carbs, protein, fat, fiber, sugar, sodium, tags, ingredients, instructions)
VALUES (999999, 'Test Recipe', 'Test description', 'dinner', 'easy', 4, 300, 25, 15, 10, 5, 8, 400, ARRAY['test'], '[]', '[]')
ON CONFLICT (id) DO NOTHING;

-- Clean up
DELETE FROM recipes WHERE id = 999999;

-- Verify constraints are gone
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='meal_plans'
AND kcu.column_name IN ('breakfast_recipe_id', 'lunch_recipe_id', 'dinner_recipe_id');
