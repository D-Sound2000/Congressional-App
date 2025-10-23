-- SIMPLE RECIPE TEST: Just test if we can insert recipes
-- Run this SQL in your Supabase SQL editor

-- Test 1: Check if we can insert a recipe
INSERT INTO recipes (name, description, category, difficulty, servings, calories, carbs, protein, fat, fiber, sugar, sodium, tags, ingredients, instructions)
VALUES ('Test Recipe', 'Test description', 'dinner', 'easy', 4, 300, 25, 15, 10, 5, 8, 400, ARRAY['test'], '[]', '[]')
RETURNING id;

-- Test 2: Check if we can insert an external recipe (simulating Spoonacular)
INSERT INTO recipes (name, description, category, difficulty, servings, calories, carbs, protein, fat, fiber, sugar, sodium, tags, ingredients, instructions)
VALUES ('External Recipe Test', 'External Recipe ID: 12345\n\nThis is a test external recipe', 'dinner', 'medium', 2, 250, 20, 12, 8, 3, 6, 350, ARRAY['external', 'test'], '[]', '[]')
RETURNING id;

-- Test 3: Clean up test data
DELETE FROM recipes WHERE name IN ('Test Recipe', 'External Recipe Test');

-- If both insertions work, the database is ready for the app
