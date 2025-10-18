-- Planner Database Schema for DiaBite App
-- This extends the existing meal_planner_schema.sql to support comprehensive planning

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

-- Create trigger for updated_at column
CREATE TRIGGER update_planner_items_updated_at 
  BEFORE UPDATE ON planner_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample planner items (optional)
-- INSERT INTO planner_items (user_id, plan_date, item_type, title, description, scheduled_time, priority, category, metadata) VALUES
-- ('00000000-0000-0000-0000-000000000000', CURRENT_DATE, 'medication', 'Take Metformin', 'Take with breakfast', '08:00', 'high', 'morning', '{"dosage": "500mg", "with_food": true}'),
-- ('00000000-0000-0000-0000-000000000000', CURRENT_DATE, 'meal_time', 'Breakfast', 'Morning meal', '08:30', 'medium', 'morning', '{"carbs_target": "30g"}'),
-- ('00000000-0000-0000-0000-000000000000', CURRENT_DATE, 'reminder', 'Check blood sugar', 'Test glucose levels', '09:00', 'high', 'morning', '{"test_type": "post_meal"}'),
-- ('00000000-0000-0000-0000-000000000000', CURRENT_DATE, 'exercise', 'Morning walk', '30-minute walk', '07:00', 'medium', 'morning', '{"duration": 30, "intensity": "moderate"}'),
-- ('00000000-0000-0000-0000-000000000000', CURRENT_DATE, 'medication', 'Insulin injection', 'Pre-lunch insulin', '12:00', 'high', 'afternoon', '{"dosage": "8 units", "type": "rapid_acting"}');

-- Verify the table was created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'planner_items' 
ORDER BY column_name;


