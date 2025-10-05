-- Recipes Database Setup for DiaBite App
-- Run this SQL in your Supabase SQL editor to populate the recipes table

-- Insert sample diabetes-friendly recipes
INSERT INTO recipes (name, description, image_url, prep_time, cook_time, servings, calories, carbs, protein, fat, fiber, sugar, sodium, category, difficulty, tags, ingredients, instructions) VALUES

-- Breakfast Recipes
('Greek Yogurt Parfait', 'A protein-rich breakfast with controlled carbs', 'https://placehold.co/300x200/png', 5, 0, 1, 180, 15, 12, 8, 3, 12, 120, 'breakfast', 'easy', ARRAY['low-carb', 'high-protein', 'quick'],
'[{"name": "Greek yogurt", "amount": "1 cup", "unit": "cup"}, {"name": "Berries", "amount": "1/2 cup", "unit": "cup"}, {"name": "Nuts", "amount": "1 tbsp", "unit": "tablespoon"}, {"name": "Honey", "amount": "1 tsp", "unit": "teaspoon"}]',
'[{"step": 1, "instruction": "Layer yogurt in a glass"}, {"step": 2, "instruction": "Add berries on top"}, {"step": 3, "instruction": "Sprinkle with nuts"}, {"step": 4, "instruction": "Drizzle with honey"}]'),

('Avocado Toast', 'A simple, healthy breakfast option', 'https://placehold.co/300x200/png', 5, 5, 1, 250, 18, 8, 16, 7, 2, 300, 'breakfast', 'easy', ARRAY['quick', 'healthy-fats', 'fiber'],
'[{"name": "Whole grain bread", "amount": "1 slice", "unit": "slice"}, {"name": "Avocado", "amount": "1/2", "unit": "medium"}, {"name": "Lemon juice", "amount": "1 tsp", "unit": "teaspoon"}, {"name": "Salt", "amount": "pinch", "unit": "pinch"}]',
'[{"step": 1, "instruction": "Toast bread until golden"}, {"step": 2, "instruction": "Mash avocado with lemon and salt"}, {"step": 3, "instruction": "Spread on toast"}, {"step": 4, "instruction": "Serve immediately"}]'),

('Spinach Omelet', 'High-protein, low-carb breakfast', 'https://placehold.co/300x200/png', 5, 10, 1, 220, 4, 16, 15, 2, 3, 420, 'breakfast', 'easy', ARRAY['low-carb', 'high-protein', 'quick'],
'[{"name": "Eggs", "amount": "2", "unit": "large"}, {"name": "Spinach", "amount": "1 cup", "unit": "cup"}, {"name": "Cheese", "amount": "1 oz", "unit": "ounce"}, {"name": "Olive oil", "amount": "1 tsp", "unit": "teaspoon"}]',
'[{"step": 1, "instruction": "Beat eggs in a bowl"}, {"step": 2, "instruction": "Sauté spinach in oil"}, {"step": 3, "instruction": "Pour eggs over spinach"}, {"step": 4, "instruction": "Add cheese and fold"}]'),

-- Lunch Recipes
('Quinoa Buddha Bowl', 'A balanced lunch with complex carbs and vegetables', 'https://placehold.co/300x200/png', 10, 20, 1, 420, 35, 18, 12, 8, 6, 380, 'lunch', 'medium', ARRAY['balanced', 'vegetarian', 'fiber-rich'],
'[{"name": "Quinoa", "amount": "1/2 cup", "unit": "cup"}, {"name": "Chickpeas", "amount": "1/2 cup", "unit": "cup"}, {"name": "Avocado", "amount": "1/2", "unit": "medium"}, {"name": "Spinach", "amount": "1 cup", "unit": "cup"}]',
'[{"step": 1, "instruction": "Cook quinoa according to package directions"}, {"step": 2, "instruction": "Rinse and drain chickpeas"}, {"step": 3, "instruction": "Slice avocado"}, {"step": 4, "instruction": "Assemble bowl with all ingredients"}]'),

('Mediterranean Wrap', 'A flavorful lunch with lean protein and vegetables', 'https://placehold.co/300x200/png', 10, 5, 1, 380, 28, 22, 18, 6, 8, 520, 'lunch', 'easy', ARRAY['mediterranean', 'balanced', 'portable'],
'[{"name": "Whole wheat tortilla", "amount": "1", "unit": "large"}, {"name": "Grilled chicken", "amount": "3 oz", "unit": "ounces"}, {"name": "Hummus", "amount": "2 tbsp", "unit": "tablespoon"}, {"name": "Cucumber", "amount": "1/4", "unit": "medium"}]',
'[{"step": 1, "instruction": "Warm tortilla slightly"}, {"step": 2, "instruction": "Spread hummus on tortilla"}, {"step": 3, "instruction": "Add chicken and vegetables"}, {"step": 4, "instruction": "Roll tightly and slice in half"}]'),

('Grilled Chicken Salad', 'Lean protein with fresh vegetables', 'https://placehold.co/300x200/png', 15, 20, 1, 320, 12, 28, 18, 6, 8, 450, 'lunch', 'easy', ARRAY['low-carb', 'high-protein', 'fresh'],
'[{"name": "Chicken breast", "amount": "4 oz", "unit": "ounces"}, {"name": "Mixed greens", "amount": "2 cups", "unit": "cups"}, {"name": "Cherry tomatoes", "amount": "1/2 cup", "unit": "cup"}, {"name": "Olive oil", "amount": "2 tbsp", "unit": "tablespoon"}]',
'[{"step": 1, "instruction": "Season and grill chicken"}, {"step": 2, "instruction": "Wash and prepare vegetables"}, {"step": 3, "instruction": "Make olive oil dressing"}, {"step": 4, "instruction": "Toss salad and top with chicken"}]'),

-- Dinner Recipes
('Grilled Salmon with Roasted Vegetables', 'A healthy, low-carb dinner perfect for diabetes management', 'https://placehold.co/300x200/png', 15, 25, 2, 320, 12, 28, 18, 4, 8, 450, 'dinner', 'easy', ARRAY['low-carb', 'diabetes-friendly', 'high-protein'], 
'[{"name": "Salmon fillet", "amount": "6 oz", "unit": "piece"}, {"name": "Broccoli", "amount": "1 cup", "unit": "chopped"}, {"name": "Bell peppers", "amount": "1", "unit": "medium"}, {"name": "Olive oil", "amount": "2 tbsp", "unit": "tablespoon"}]',
'[{"step": 1, "instruction": "Preheat oven to 400°F"}, {"step": 2, "instruction": "Season salmon with salt and pepper"}, {"step": 3, "instruction": "Roast vegetables for 20 minutes"}, {"step": 4, "instruction": "Grill salmon for 4-5 minutes per side"}]'),

('Turkey Meatballs with Zucchini Noodles', 'Low-carb alternative to pasta', 'https://placehold.co/300x200/png', 20, 25, 2, 280, 8, 24, 16, 4, 6, 520, 'dinner', 'medium', ARRAY['low-carb', 'high-protein', 'comfort-food'],
'[{"name": "Ground turkey", "amount": "1 lb", "unit": "pound"}, {"name": "Zucchini", "amount": "2", "unit": "medium"}, {"name": "Marinara sauce", "amount": "1 cup", "unit": "cup"}, {"name": "Parmesan cheese", "amount": "2 tbsp", "unit": "tablespoon"}]',
'[{"step": 1, "instruction": "Form turkey into meatballs"}, {"step": 2, "instruction": "Spiralize zucchini into noodles"}, {"step": 3, "instruction": "Cook meatballs in sauce"}, {"step": 4, "instruction": "Serve over zucchini noodles with cheese"}]'),

('Cauliflower Fried Rice', 'Low-carb alternative to traditional fried rice', 'https://placehold.co/300x200/png', 10, 15, 2, 180, 12, 8, 12, 4, 6, 420, 'dinner', 'easy', ARRAY['low-carb', 'vegetarian', 'asian-inspired'],
'[{"name": "Cauliflower rice", "amount": "3 cups", "unit": "cups"}, {"name": "Eggs", "amount": "2", "unit": "large"}, {"name": "Peas", "amount": "1/2 cup", "unit": "cup"}, {"name": "Soy sauce", "amount": "2 tbsp", "unit": "tablespoon"}]',
'[{"step": 1, "instruction": "Scramble eggs and set aside"}, {"step": 2, "instruction": "Sauté cauliflower rice"}, {"step": 3, "instruction": "Add peas and eggs"}, {"step": 4, "instruction": "Season with soy sauce"}]'),

-- Snack Recipes
('Apple with Almond Butter', 'Balanced snack with protein and fiber', 'https://placehold.co/300x200/png', 2, 0, 1, 180, 20, 6, 8, 4, 16, 5, 'snack', 'easy', ARRAY['quick', 'balanced', 'portable'],
'[{"name": "Apple", "amount": "1", "unit": "medium"}, {"name": "Almond butter", "amount": "2 tbsp", "unit": "tablespoon"}]',
'[{"step": 1, "instruction": "Slice apple into wedges"}, {"step": 2, "instruction": "Serve with almond butter for dipping"}]'),

('Greek Yogurt with Berries', 'Protein-rich snack with antioxidants', 'https://placehold.co/300x200/png', 3, 0, 1, 120, 15, 12, 0, 2, 12, 60, 'snack', 'easy', ARRAY['high-protein', 'antioxidants', 'quick'],
'[{"name": "Greek yogurt", "amount": "1 cup", "unit": "cup"}, {"name": "Mixed berries", "amount": "1/2 cup", "unit": "cup"}]',
'[{"step": 1, "instruction": "Scoop yogurt into bowl"}, {"step": 2, "instruction": "Top with fresh berries"}]'),

('Hard-Boiled Eggs', 'Simple protein snack', 'https://placehold.co/300x200/png', 5, 10, 2, 140, 1, 12, 10, 0, 1, 140, 'snack', 'easy', ARRAY['high-protein', 'low-carb', 'portable'],
'[{"name": "Eggs", "amount": "2", "unit": "large"}]',
'[{"step": 1, "instruction": "Place eggs in boiling water"}, {"step": 2, "instruction": "Boil for 10 minutes"}, {"step": 3, "instruction": "Cool in ice water"}, {"step": 4, "instruction": "Peel and serve"}]');

-- Verify the recipes were inserted
SELECT COUNT(*) as recipe_count FROM recipes;

-- Show sample of inserted recipes
SELECT name, category, carbs, protein FROM recipes ORDER BY category, name;
