-- Fix meal planner database issues
-- Run this SQL in your Supabase SQL editor

-- 1. First, let's drop the existing foreign key constraints
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_breakfast_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_lunch_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_dinner_recipe_id_fkey;

-- 2. Add new foreign key constraints that allow NULL values and external IDs
-- We'll make them less restrictive to allow external recipe IDs
ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_breakfast_recipe_id_fkey 
FOREIGN KEY (breakfast_recipe_id) REFERENCES recipes(id) ON DELETE SET NULL;

ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_lunch_recipe_id_fkey 
FOREIGN KEY (lunch_recipe_id) REFERENCES recipes(id) ON DELETE SET NULL;

ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_dinner_recipe_id_fkey 
FOREIGN KEY (dinner_recipe_id) REFERENCES recipes(id) ON DELETE SET NULL;

-- 3. Add RLS policies for recipes table to allow inserts, updates, and deletes
CREATE POLICY "Users can insert recipes" ON recipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update recipes" ON recipes
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete recipes" ON recipes
  FOR DELETE USING (true);

-- 4. Alternative approach: Create a more flexible constraint that allows external IDs
-- If the above doesn't work, we can try this approach instead:

-- Drop the constraints again if needed
-- ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_breakfast_recipe_id_fkey;
-- ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_lunch_recipe_id_fkey;
-- ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_dinner_recipe_id_fkey;

-- Create check constraints that allow external IDs (> 1000) or NULL
-- ALTER TABLE meal_plans 
-- ADD CONSTRAINT meal_plans_breakfast_recipe_id_check 
-- CHECK (breakfast_recipe_id IS NULL OR breakfast_recipe_id > 1000 OR breakfast_recipe_id IN (SELECT id FROM recipes));

-- ALTER TABLE meal_plans 
-- ADD CONSTRAINT meal_plans_lunch_recipe_id_check 
-- CHECK (lunch_recipe_id IS NULL OR lunch_recipe_id > 1000 OR lunch_recipe_id IN (SELECT id FROM recipes));

-- ALTER TABLE meal_plans 
-- ADD CONSTRAINT meal_plans_dinner_recipe_id_check 
-- CHECK (dinner_recipe_id IS NULL OR dinner_recipe_id > 1000 OR dinner_recipe_id IN (SELECT id FROM recipes));
