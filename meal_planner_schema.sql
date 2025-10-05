-- Meal Planner Database Schema for DiaBite App
-- Run this SQL in your Supabase SQL editor

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_calories ON recipes(calories);
CREATE INDEX IF NOT EXISTS idx_recipes_carbs ON recipes(carbs);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_glucose_logs_user_time ON glucose_logs(user_id, measurement_time);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE glucose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

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

-- Create triggers for updated_at columns
CREATE TRIGGER update_recipes_updated_at 
  BEFORE UPDATE ON recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at 
  BEFORE UPDATE ON meal_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update profiles table to include diabetes-specific fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diabetes_type VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insulin_dependent BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medications TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS doctor_info TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS glucose_targets JSONB;

-- Insert some sample diabetes-friendly recipes
INSERT INTO recipes (name, description, image_url, prep_time, cook_time, servings, calories, carbs, protein, fat, fiber, sugar, sodium, category, difficulty, tags, ingredients, instructions) VALUES
('Grilled Salmon with Roasted Vegetables', 'A healthy, low-carb dinner perfect for diabetes management', 'https://placehold.co/300x200/png', 15, 25, 2, 320, 12, 28, 18, 4, 8, 450, 'dinner', 'easy', ARRAY['low-carb', 'diabetes-friendly', 'high-protein'], 
'[{"name": "Salmon fillet", "amount": "6 oz", "unit": "piece"}, {"name": "Broccoli", "amount": "1 cup", "unit": "chopped"}, {"name": "Bell peppers", "amount": "1", "unit": "medium"}, {"name": "Olive oil", "amount": "2 tbsp", "unit": "tablespoon"}]',
'[{"step": 1, "instruction": "Preheat oven to 400°F"}, {"step": 2, "instruction": "Season salmon with salt and pepper"}, {"step": 3, "instruction": "Roast vegetables for 20 minutes"}, {"step": 4, "instruction": "Grill salmon for 4-5 minutes per side"}]'),

('Greek Yogurt Parfait', 'A protein-rich breakfast with controlled carbs', 'https://placehold.co/300x200/png', 5, 0, 1, 180, 15, 12, 8, 3, 12, 120, 'breakfast', 'easy', ARRAY['low-carb', 'high-protein', 'quick'],
'[{"name": "Greek yogurt", "amount": "1 cup", "unit": "cup"}, {"name": "Berries", "amount": "1/2 cup", "unit": "cup"}, {"name": "Nuts", "amount": "1 tbsp", "unit": "tablespoon"}, {"name": "Honey", "amount": "1 tsp", "unit": "teaspoon"}]',
'[{"step": 1, "instruction": "Layer yogurt in a glass"}, {"step": 2, "instruction": "Add berries on top"}, {"step": 3, "instruction": "Sprinkle with nuts"}, {"step": 4, "instruction": "Drizzle with honey"}]'),

('Quinoa Buddha Bowl', 'A balanced lunch with complex carbs and vegetables', 'https://placehold.co/300x200/png', 10, 20, 1, 420, 35, 18, 12, 8, 6, 380, 'lunch', 'medium', ARRAY['balanced', 'vegetarian', 'fiber-rich'],
'[{"name": "Quinoa", "amount": "1/2 cup", "unit": "cup"}, {"name": "Chickpeas", "amount": "1/2 cup", "unit": "cup"}, {"name": "Avocado", "amount": "1/2", "unit": "medium"}, {"name": "Spinach", "amount": "1 cup", "unit": "cup"}]',
'[{"step": 1, "instruction": "Cook quinoa according to package directions"}, {"step": 2, "instruction": "Rinse and drain chickpeas"}, {"step": 3, "instruction": "Slice avocado"}, {"step": 4, "instruction": "Assemble bowl with all ingredients"}]'),

('Avocado Toast', 'A simple, healthy breakfast option', 'https://placehold.co/300x200/png', 5, 5, 1, 250, 18, 8, 16, 7, 2, 300, 'breakfast', 'easy', ARRAY['quick', 'healthy-fats', 'fiber'],
'[{"name": "Whole grain bread", "amount": "1 slice", "unit": "slice"}, {"name": "Avocado", "amount": "1/2", "unit": "medium"}, {"name": "Lemon juice", "amount": "1 tsp", "unit": "teaspoon"}, {"name": "Salt", "amount": "pinch", "unit": "pinch"}]',
'[{"step": 1, "instruction": "Toast bread until golden"}, {"step": 2, "instruction": "Mash avocado with lemon and salt"}, {"step": 3, "instruction": "Spread on toast"}, {"step": 4, "instruction": "Serve immediately"}]'),

('Mediterranean Wrap', 'A flavorful lunch with lean protein and vegetables', 'https://placehold.co/300x200/png', 10, 5, 1, 380, 28, 22, 18, 6, 8, 520, 'lunch', 'easy', ARRAY['mediterranean', 'balanced', 'portable'],
'[{"name": "Whole wheat tortilla", "amount": "1", "unit": "large"}, {"name": "Grilled chicken", "amount": "3 oz", "unit": "ounces"}, {"name": "Hummus", "amount": "2 tbsp", "unit": "tablespoon"}, {"name": "Cucumber", "amount": "1/4", "unit": "medium"}]',
'[{"step": 1, "instruction": "Warm tortilla slightly"}, {"step": 2, "instruction": "Spread hummus on tortilla"}, {"step": 3, "instruction": "Add chicken and vegetables"}, {"step": 4, "instruction": "Roll tightly and slice in half"}]');
