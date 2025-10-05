# Recipes Setup Instructions

The meal search functionality requires the `recipes` table to be populated with sample data. Follow these steps to get meal search working:

## Database Setup

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Go to the "SQL Editor" tab

2. **Run the Recipes Setup Script**
   - Copy the contents of `recipes_setup.sql` 
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

   This will populate the `recipes` table with:
   - 12 diabetes-friendly recipes across breakfast, lunch, dinner, and snack categories
   - Proper nutritional information (carbs, protein, calories)
   - Ingredient lists and cooking instructions
   - Tags for filtering (low-carb, high-protein, etc.)

## What Gets Added

### Breakfast Recipes (3)
- Greek Yogurt Parfait
- Avocado Toast  
- Spinach Omelet

### Lunch Recipes (3)
- Quinoa Buddha Bowl
- Mediterranean Wrap
- Grilled Chicken Salad

### Dinner Recipes (3)
- Grilled Salmon with Roasted Vegetables
- Turkey Meatballs with Zucchini Noodles
- Cauliflower Fried Rice

### Snack Recipes (3)
- Apple with Almond Butter
- Greek Yogurt with Berries
- Hard-Boiled Eggs

## Search Functionality After Setup

### 1. **Search by Recipe Name**
- Type "chicken" → finds "Grilled Chicken Salad"
- Type "salmon" → finds "Grilled Salmon with Roasted Vegetables"
- Type "yogurt" → finds Greek yogurt recipes

### 2. **Search by Ingredients**
- Type "eggs" → finds recipes containing eggs
- Type "spinach" → finds recipes with spinach
- Type "avocado" → finds avocado recipes

### 3. **Enhanced Search Features**
- Case-insensitive search
- Partial matches (e.g., "chick" finds "chicken")
- Combines name and ingredient searches
- Shows helpful suggestions when no results found
- Option to view all recipes if search fails

## Testing the Setup

1. **Test Basic Search**
   - Go to Planner tab
   - Click "Add" on any meal (Breakfast/Lunch/Dinner)
   - Type "chicken" in search box
   - Click "🔍 Search"
   - Should show "Grilled Chicken Salad"

2. **Test Ingredient Search**
   - Search for "eggs"
   - Should show multiple recipes containing eggs

3. **Test No Results**
   - Search for "pizza"
   - Should show helpful message with option to view all recipes

## Troubleshooting

If search still doesn't work:

1. **Check Database Connection**
   - Look for error messages in console
   - Verify Supabase connection is working

2. **Verify Recipes Table**
   - Run this query in Supabase SQL Editor:
   ```sql
   SELECT COUNT(*) FROM recipes;
   ```
   - Should return 12

3. **Check Table Structure**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'recipes' 
   ORDER BY column_name;
   ```

4. **Test Direct Query**
   ```sql
   SELECT name, category FROM recipes WHERE name ILIKE '%chicken%';
   ```

## Sample Search Terms

Try these searches to test functionality:
- `chicken` → Grilled Chicken Salad
- `salmon` → Grilled Salmon with Roasted Vegetables  
- `eggs` → Spinach Omelet, Hard-Boiled Eggs
- `yogurt` → Greek Yogurt Parfait, Greek Yogurt with Berries
- `avocado` → Avocado Toast, Quinoa Buddha Bowl
- `cauliflower` → Cauliflower Fried Rice

## Next Steps

After setting up recipes, you can:
1. Search and add meals to your daily planner
2. View nutritional information for each recipe
3. Plan your meals for different days
4. Track carbs and calories for diabetes management
