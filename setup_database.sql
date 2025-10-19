-- Complete Database Setup for DiaBite App
-- Run this SQL in your Supabase SQL editor to set up all required tables

-- First, create the update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  diabetes_type VARCHAR(20),
  insulin_dependent BOOLEAN DEFAULT false,
  medications TEXT[],
  emergency_contact TEXT,
  doctor_info TEXT,
  glucose_targets JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table for storing recipe data
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER DEFAULT 1,
  calories INTEGER,
  carbs DECIMAL(5,2), -- grams
  protein DECIMAL(5,2), -- grams
  fat DECIMAL(5,2), -- grams
  fiber DECIMAL(5,2), -- grams
  sugar DECIMAL(5,2), -- grams
  sodium DECIMAL(5,2), -- mg
  category VARCHAR(50), -- breakfast, lunch, dinner, snack
  difficulty VARCHAR(20), -- easy, medium, hard
  tags TEXT[], -- array of tags like ['low-carb', 'diabetes-friendly', 'quick']
  ingredients JSONB, -- array of ingredient objects
  instructions JSONB, -- array of instruction steps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal_plans table for storing user meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  breakfast_recipe_id INTEGER REFERENCES recipes(id),
  lunch_recipe_id INTEGER REFERENCES recipes(id),
  dinner_recipe_id INTEGER REFERENCES recipes(id),
  snacks JSONB DEFAULT '[]'::jsonb, -- array of snack objects
  reminders JSONB DEFAULT '[]'::jsonb, -- array of reminder objects
  total_calories INTEGER,
  total_carbs DECIMAL(5,2),
  total_protein DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_date)
);

-- Create glucose_logs table for tracking blood sugar
CREATE TABLE IF NOT EXISTS glucose_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  glucose_value INTEGER NOT NULL,
  measurement_time TIMESTAMP WITH TIME ZONE NOT NULL,
  context VARCHAR(50), -- fasting, pre-meal, post-meal, bedtime, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table for storing dietary preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_daily_carbs INTEGER DEFAULT 150,
  max_daily_calories INTEGER DEFAULT 2000,
  preferred_meal_times JSONB DEFAULT '{"breakfast": "08:00", "lunch": "13:00", "dinner": "19:00"}'::jsonb,
  dietary_restrictions TEXT[], -- vegetarian, vegan, gluten-free, etc.
  disliked_ingredients TEXT[],
  preferred_cuisines TEXT[],
  meal_complexity VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create the favorite_recipes table
CREATE TABLE IF NOT EXISTS favorite_recipes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL,
  recipe_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_calories ON recipes(calories);
CREATE INDEX IF NOT EXISTS idx_recipes_carbs ON recipes(carbs);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_glucose_logs_user_time ON glucose_logs(user_id, measurement_time);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_recipes_user_id ON favorite_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_recipes_recipe_id ON favorite_recipes(recipe_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE glucose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- RLS Policies for recipes (public read access)
CREATE POLICY "Recipes are viewable by everyone" ON recipes
  FOR SELECT USING (true);

-- RLS Policies for meal_plans
CREATE POLICY "Users can view their own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans" ON meal_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans" ON meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for glucose_logs
CREATE POLICY "Users can view their own glucose logs" ON glucose_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own glucose logs" ON glucose_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own glucose logs" ON glucose_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own glucose logs" ON glucose_logs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for favorite_recipes
CREATE POLICY "Users can view their own favorites" ON favorite_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorite_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" ON favorite_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorite_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at 
  BEFORE UPDATE ON recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at 
  BEFORE UPDATE ON meal_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_favorite_recipes_updated_at 
  BEFORE UPDATE ON favorite_recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as recipe_count FROM recipes;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'recipes', 'meal_plans', 'glucose_logs', 'user_preferences', 'favorite_recipes');
