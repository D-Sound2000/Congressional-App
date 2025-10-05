# Planner Setup Instructions

The planner functionality requires setting up the database tables and policies. Follow these steps to get the planner working:

## Database Setup

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Go to the "SQL Editor" tab

2. **Run the Planner Setup Script**
   - Copy the contents of `planner_setup.sql` 
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

   This will create:
   - `planner_items` table with proper structure
   - Row Level Security (RLS) policies
   - Indexes for better performance
   - Automatic timestamp updates

## What Gets Created

### 1. **planner_items Table**
```sql
- id: Serial primary key
- user_id: UUID reference to auth.users
- plan_date: Date for the planned item
- item_type: Type (medication, meal_time, activity, reminder, exercise, checkup)
- title: Item title
- description: Optional description
- scheduled_time: Time (HH:MM format)
- duration: Duration in minutes
- completed: Boolean completion status
- priority: Priority level (low, medium, high)
- category: Time category (morning, afternoon, evening, bedtime)
- metadata: JSONB for additional data (medication dosage, etc.)
- created_at: Timestamp
- updated_at: Timestamp
```

### 2. **Security Features**
- Row Level Security (RLS) enabled
- Users can only access their own planner items
- Automatic user_id assignment on insert/update

### 3. **Performance Optimizations**
- Indexes on user_id, plan_date, and scheduled_time
- Indexes on item_type and completion status

## Features After Setup

### 1. **Add Planner Items**
- Medications with dosage and timing
- Meal times with food suggestions
- Activities, reminders, exercises, and checkups
- Schedule items with specific times
- Set priority levels and categories

### 2. **View Reminders**
- Today's uncompleted items appear on home page
- Items are sorted by scheduled time
- Different icons for different item types
- Click to navigate to planner

### 3. **Manage Items**
- Mark items as completed
- Edit item details
- Delete items
- View items by date

## Testing the Setup

1. **Add a Test Item**
   - Go to the Planner tab
   - Click "Add" button
   - Add a medication or meal time
   - Verify it appears in the planner

2. **Check Home Page**
   - Go to the Home tab
   - Look for "Today's Reminders" section
   - Verify your test item appears there

3. **Test Completion**
   - Tap the checkmark on an item
   - Verify it gets marked as completed
   - Check that completed items don't appear in reminders

## Troubleshooting

If items aren't being added:

1. **Check Console Logs**
   - Look for error messages in the browser console
   - Check for database connection errors

2. **Verify Database Setup**
   - Ensure the `planner_items` table was created
   - Check that RLS policies are active

3. **Check Authentication**
   - Make sure you're logged in
   - Verify user_id is being set correctly

4. **Test Database Connection**
   - Run a simple query in Supabase SQL Editor:
   ```sql
   SELECT * FROM planner_items LIMIT 5;
   ```

## Sample Data (Optional)

The setup script includes commented sample data that you can uncomment to add test items immediately after setup. This helps verify everything is working correctly.
