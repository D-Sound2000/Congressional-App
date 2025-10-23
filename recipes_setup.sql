-- Recipes Database Setup for DiaBite App
-- Run this SQL in your Supabase SQL editor to populate the recipes table

-- Insert sample diabetes-friendly recipes
INSERT INTO recipes (name, description, image_url, prep_time, cook_time, servings, calories, carbs, protein, fat, fiber, sugar, sodium, category, difficulty, tags, ingredients, instructions) VALUES

-- Breakfast Recipes
('Greek Yogurt Parfait', 'A protein-rich breakfast with controlled carbs', 'https://placehold.co/300x200/png', 5, 0, 1, 180, 15, 12, 8, 3, 12, 120, 'breakfast', 'easy', ARRAY['low-carb', 'high-protein', 'quick'],
'Greek yogurt (1 cup), Berries (1/2 cup), Nuts (1 tbsp), Honey (1 tsp)',
'Layer yogurt in a glass. Add berries on top. Sprinkle with nuts. Drizzle with honey.'),

('Avocado Toast', 'A simple, healthy breakfast option', 'https://placehold.co/300x200/png', 5, 5, 1, 250, 18, 8, 16, 7, 2, 300, 'breakfast', 'easy', ARRAY['quick', 'healthy-fats', 'fiber'],
'Whole grain bread (1 slice), Avocado (1/2 medium), Lemon juice (1 tsp), Salt (pinch)',
'Toast bread until golden. Mash avocado with lemon and salt. Spread on toast. Serve immediately.'),

('Spinach Omelet', 'High-protein, low-carb breakfast', 'https://placehold.co/300x200/png', 5, 10, 1, 220, 4, 16, 15, 2, 3, 420, 'breakfast', 'easy', ARRAY['low-carb', 'high-protein', 'quick'],
'Eggs (2 large), Spinach (1 cup), Cheese (1 oz), Olive oil (1 tsp)',
'Beat eggs in a bowl. Sauté spinach in oil. Pour eggs over spinach. Add cheese and fold.'),

-- Lunch Recipes
('Quinoa Buddha Bowl', 'A balanced lunch with complex carbs and vegetables', 'https://placehold.co/300x200/png', 10, 20, 1, 420, 35, 18, 12, 8, 6, 380, 'lunch', 'medium', ARRAY['balanced', 'vegetarian', 'fiber-rich'],
'Quinoa (1/2 cup), Chickpeas (1/2 cup), Avocado (1/2 medium), Spinach (1 cup)',
'Cook quinoa according to package directions. Rinse and drain chickpeas. Slice avocado. Assemble bowl with all ingredients.'),

('Mediterranean Wrap', 'A flavorful lunch with lean protein and vegetables', 'https://placehold.co/300x200/png', 10, 5, 1, 380, 28, 22, 18, 6, 8, 520, 'lunch', 'easy', ARRAY['mediterranean', 'balanced', 'portable'],
'Whole wheat tortilla (1 large), Grilled chicken (3 oz), Hummus (2 tbsp), Cucumber (1/4 medium)',
'Warm tortilla slightly. Spread hummus on tortilla. Add chicken and vegetables. Roll tightly and slice in half.'),

('Grilled Chicken Salad', 'Lean protein with fresh vegetables', 'https://placehold.co/300x200/png', 15, 20, 1, 320, 12, 28, 18, 6, 8, 450, 'lunch', 'easy', ARRAY['low-carb', 'high-protein', 'fresh'],
'Chicken breast (4 oz), Mixed greens (2 cups), Cherry tomatoes (1/2 cup), Olive oil (2 tbsp)',
'Season and grill chicken. Wash and prepare vegetables. Make olive oil dressing. Toss salad and top with chicken.'),

-- Dinner Recipes
('Grilled Salmon with Roasted Vegetables', 'A healthy, low-carb dinner perfect for diabetes management', 'https://placehold.co/300x200/png', 15, 25, 2, 320, 12, 28, 18, 4, 8, 450, 'dinner', 'easy', ARRAY['low-carb', 'diabetes-friendly', 'high-protein'], 
'Salmon fillet (6 oz), Broccoli (1 cup chopped), Bell peppers (1 medium), Olive oil (2 tbsp)',
'Preheat oven to 400°F. Season salmon with salt and pepper. Roast vegetables for 20 minutes. Grill salmon for 4-5 minutes per side.'),

('Turkey Meatballs with Zucchini Noodles', 'Low-carb alternative to pasta', 'https://placehold.co/300x200/png', 20, 25, 2, 280, 8, 24, 16, 4, 6, 520, 'dinner', 'medium', ARRAY['low-carb', 'high-protein', 'comfort-food'],
'Ground turkey (1 lb), Zucchini (2 medium), Marinara sauce (1 cup), Parmesan cheese (2 tbsp)',
'Form turkey into meatballs. Spiralize zucchini into noodles. Cook meatballs in sauce. Serve over zucchini noodles with cheese.'),

('Cauliflower Fried Rice', 'Low-carb alternative to traditional fried rice', 'https://placehold.co/300x200/png', 10, 15, 2, 180, 12, 8, 12, 4, 6, 420, 'dinner', 'easy', ARRAY['low-carb', 'vegetarian', 'asian-inspired'],
'Cauliflower rice (3 cups), Eggs (2 large), Peas (1/2 cup), Soy sauce (2 tbsp)',
'Scramble eggs and set aside. Sauté cauliflower rice. Add peas and eggs. Season with soy sauce.'),

-- Snack Recipes
('Apple with Almond Butter', 'Balanced snack with protein and fiber', 'https://placehold.co/300x200/png', 2, 0, 1, 180, 20, 6, 8, 4, 16, 5, 'snack', 'easy', ARRAY['quick', 'balanced', 'portable'],
'Apple (1 medium), Almond butter (2 tbsp)',
'Slice apple into wedges. Serve with almond butter for dipping.'),

('Greek Yogurt with Berries', 'Protein-rich snack with antioxidants', 'https://placehold.co/300x200/png', 3, 0, 1, 120, 15, 12, 0, 2, 12, 60, 'snack', 'easy', ARRAY['high-protein', 'antioxidants', 'quick'],
'Greek yogurt (1 cup), Mixed berries (1/2 cup)',
'Scoop yogurt into bowl. Top with fresh berries.'),

('Hard-Boiled Eggs', 'Simple protein snack', 'https://placehold.co/300x200/png', 5, 10, 2, 140, 1, 12, 10, 0, 1, 140, 'snack', 'easy', ARRAY['high-protein', 'low-carb', 'portable'],
'Eggs (2 large)',
'Place eggs in boiling water. Boil for 10 minutes. Cool in ice water. Peel and serve.');

-- Verify the recipes were inserted
SELECT COUNT(*) as recipe_count FROM recipes;

-- Show sample of inserted recipes
SELECT name, category, carbs, protein FROM recipes ORDER BY category, name;
