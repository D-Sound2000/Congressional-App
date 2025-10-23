-- SIMPLE TEST: Verify database is working correctly
-- Run this SQL in your Supabase SQL editor

-- Test 1: Check if we can insert a recipe
INSERT INTO recipes (name, description, category, difficulty, servings, calories, carbs, protein, fat, fiber, sugar, sodium, tags, ingredients, instructions)
VALUES ('Test Recipe', 'Test description', 'dinner', 'easy', 4, 300, 25, 15, 10, 5, 8, 400, ARRAY['test'], '[]', '[]')
RETURNING id;

-- Test 2: Get a real user ID from the auth.users table
-- First, let's see what users exist
SELECT id, email FROM auth.users LIMIT 5;

-- Test 3: Use a real user ID (replace with an actual user ID from step 2)
-- INSERT INTO meal_plans (user_id, plan_date, breakfast_recipe_id)
-- VALUES ('REPLACE_WITH_REAL_USER_ID', CURRENT_DATE, (SELECT id FROM recipes WHERE name = 'Test Recipe' LIMIT 1))
-- RETURNING id;

-- Test 4: Clean up test data
-- DELETE FROM meal_plans WHERE breakfast_recipe_id = (SELECT id FROM recipes WHERE name = 'Test Recipe' LIMIT 1);
DELETE FROM recipes WHERE name = 'Test Recipe';

-- If recipe insertion works, the database is working correctly
