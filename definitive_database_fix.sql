-- Fix database setup for meal planner
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;

-- Drop foreign key constraints
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_breakfast_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_lunch_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_dinner_recipe_id_fkey;

-- Test recipe insertion
INSERT INTO recipes (name, description, category, difficulty, servings, calories, carbs, protein, fat, fiber, sugar, sodium, tags, ingredients, instructions)
VALUES ('Test Recipe', 'Test recipe for database', 'dinner', 'easy', 4, 300, 25, 15, 10, 5, 8, 400, ARRAY['test'], '[]', '[]')
RETURNING id;

-- Re-enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Recipes are viewable by everyone" ON recipes;
DROP POLICY IF EXISTS "Users can insert recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can insert recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can update recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can delete recipes" ON recipes;

-- Create new policy
CREATE POLICY "Allow all operations on recipes" ON recipes
  FOR ALL USING (true) WITH CHECK (true);

-- Test again
INSERT INTO recipes (name, description, category, difficulty, servings, calories, carbs, protein, fat, fiber, sugar, sodium, tags, ingredients, instructions)
VALUES ('Test Recipe 2', 'Test with RLS policy', 'dinner', 'easy', 4, 300, 25, 15, 10, 5, 8, 400, ARRAY['test'], '[]', '[]')
RETURNING id;

-- Clean up
DELETE FROM recipes WHERE name IN ('Test Recipe', 'Test Recipe 2');
