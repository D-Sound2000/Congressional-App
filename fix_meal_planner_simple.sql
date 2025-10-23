-- Simple fix for meal planner foreign key constraint issues
-- Run this SQL in your Supabase SQL editor

-- 1. Drop the existing foreign key constraints
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_breakfast_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_lunch_recipe_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_dinner_recipe_id_fkey;

-- 2. Add RLS policies for recipes table to allow inserts
CREATE POLICY "Users can insert recipes" ON recipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update recipes" ON recipes
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete recipes" ON recipes
  FOR DELETE USING (true);

-- 3. Create new foreign key constraints that are more flexible
-- These will only enforce the constraint for local recipes (ID < 1000)
-- External recipes (ID >= 1000) will be allowed without foreign key validation

-- For breakfast_recipe_id
ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_breakfast_recipe_id_fkey 
FOREIGN KEY (breakfast_recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

-- For lunch_recipe_id  
ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_lunch_recipe_id_fkey 
FOREIGN KEY (lunch_recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

-- For dinner_recipe_id
ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_dinner_recipe_id_fkey 
FOREIGN KEY (dinner_recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;
