-- Planner Database Setup for DiaBite App
-- Run this SQL in your Supabase SQL editor to set up the planner functionality

-- Create planner_items table for storing all planned activities
CREATE TABLE IF NOT EXISTS planner_items (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  item_type VARCHAR(20) NOT NULL, -- 'medication', 'meal_time', 'activity', 'reminder', 'exercise', 'checkup'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_time TIME,
  duration INTEGER, -- in minutes
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high'
  category VARCHAR(50), -- 'morning', 'afternoon', 'evening', 'bedtime'
  metadata JSONB DEFAULT '{}', -- store additional data like medication dosage, exercise type, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_date, item_type, title, scheduled_time)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_planner_items_user_date ON planner_items(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_planner_items_user_date_time ON planner_items(user_id, plan_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_planner_items_type ON planner_items(item_type);
CREATE INDEX IF NOT EXISTS idx_planner_items_completed ON planner_items(completed);

-- Enable Row Level Security (RLS)
ALTER TABLE planner_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for planner_items
CREATE POLICY "Users can view their own planner items" ON planner_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planner items" ON planner_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planner items" ON planner_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planner items" ON planner_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_planner_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_planner_items_updated_at 
  BEFORE UPDATE ON planner_items 
  FOR EACH ROW EXECUTE FUNCTION update_planner_updated_at_column();

-- Insert some sample data for testing (optional)
-- Uncomment the following lines if you want to add sample data
/*
INSERT INTO planner_items (user_id, plan_date, item_type, title, description, scheduled_time, priority, category, metadata)
SELECT 
  auth.uid(),
  CURRENT_DATE,
  'medication',
  'Metformin',
  'Take with breakfast',
  '08:00',
  'high',
  'morning',
  '{"medication_name": "Metformin", "dosage": "500mg"}'::jsonb
WHERE auth.uid() IS NOT NULL;

INSERT INTO planner_items (user_id, plan_date, item_type, title, description, scheduled_time, priority, category, metadata)
SELECT 
  auth.uid(),
  CURRENT_DATE,
  'meal_time',
  'Healthy Lunch',
  'Low-carb meal with protein',
  '13:00',
  'medium',
  'afternoon',
  '{"meal_type": "lunch", "food_suggestions": "Grilled chicken salad, quinoa"}'::jsonb
WHERE auth.uid() IS NOT NULL;

INSERT INTO planner_items (user_id, plan_date, item_type, title, description, scheduled_time, priority, category)
SELECT 
  auth.uid(),
  CURRENT_DATE,
  'exercise',
  'Evening Walk',
  '30-minute walk around the neighborhood',
  '19:00',
  'low',
  'evening'
WHERE auth.uid() IS NOT NULL;
*/

-- Verify the table was created successfully
SELECT 'planner_items table created successfully!' as status;
