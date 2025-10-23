-- Remove constraints and fix RLS policies
-- Run this SQL in your Supabase SQL editor

-- Drop foreign key constraints
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_breakfast_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_lunch_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_dinner_recipe_id_fkey;

-- Drop check constraints
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_breakfast_recipe_id_check;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_lunch_recipe_id_check;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_dinner_recipe_id_check;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Recipes are viewable by everyone" ON recipes;
DROP POLICY IF EXISTS "Users can insert recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can insert recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can update recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can delete recipes" ON recipes;

-- Create new RLS policies
CREATE POLICY "Recipes are viewable by everyone" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert recipes" ON recipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update recipes" ON recipes
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete recipes" ON recipes
  FOR DELETE USING (true);

-- Test recipe insertion
INSERT INTO recipes (name, description, category, difficulty, servings, calories, carbs, protein, fat, fiber, sugar, sodium, tags, ingredients, instructions)
VALUES ('Test Recipe', 'Test recipe for database', 'dinner', 'easy', 4, 300, 25, 15, 10, 5, 8, 400, ARRAY['test'], '[]', '[]')
RETURNING id;

-- Clean up
DELETE FROM recipes WHERE name = 'Test Recipe';
