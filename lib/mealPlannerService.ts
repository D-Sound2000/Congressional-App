import { supabase } from './supabase';
import { getUserProfile } from './userProfileService';

// Types for our meal planner data
export interface Recipe {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  prep_time?: number;
  cook_time?: number;
  servings: number;
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  ingredients: any[];
  instructions: any[];
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: number;
  user_id: string;
  plan_date: string;
  breakfast_recipe_id?: number;
  lunch_recipe_id?: number;
  dinner_recipe_id?: number;
  snacks: any[];
  reminders: any[];
  total_calories?: number;
  total_carbs?: number;
  total_protein?: number;
  created_at: string;
  updated_at: string;
  // Populated recipe data
  breakfast_recipe?: Recipe;
  lunch_recipe?: Recipe;
  dinner_recipe?: Recipe;
}

export interface GlucoseLog {
  id: number;
  user_id: string;
  glucose_value: number;
  measurement_time: string;
  context?: string;
  notes?: string;
  created_at: string;
}

export interface UserPreferences {
  id: number;
  user_id: string;
  max_daily_carbs: number;
  max_daily_calories: number;
  preferred_meal_times: any;
  dietary_restrictions: string[];
  disliked_ingredients: string[];
  preferred_cuisines: string[];
  meal_complexity: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
}

// Recipe Management Functions
export const getRecipes = async (category?: string, searchQuery?: string): Promise<Recipe[]> => {
  try {
    let query = supabase
      .from('recipes')
      .select('*')
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRecipes:', error);
    throw error;
  }
};

export const getRecipeById = async (id: number): Promise<Recipe | null> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getRecipeById:', error);
    throw error;
  }
};

export const saveRecipe = async (recipeData: Partial<Recipe>): Promise<Recipe> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipeData])
      .select()
      .single();

    if (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveRecipe:', error);
    throw error;
  }
};

// Meal Planning Functions
export const getMealPlan = async (date: string): Promise<MealPlan | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        breakfast_recipe:recipes!breakfast_recipe_id(*),
        lunch_recipe:recipes!lunch_recipe_id(*),
        dinner_recipe:recipes!dinner_recipe_id(*)
      `)
      .eq('user_id', user.id)
      .eq('plan_date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching meal plan:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getMealPlan:', error);
    throw error;
  }
};

export const saveMealPlan = async (mealPlan: Partial<MealPlan>): Promise<MealPlan> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meal_plans')
      .upsert({
        ...mealPlan,
        user_id: user.id,
      })
      .select(`
        *,
        breakfast_recipe:recipes!breakfast_recipe_id(*),
        lunch_recipe:recipes!lunch_recipe_id(*),
        dinner_recipe:recipes!dinner_recipe_id(*)
      `)
      .single();

    if (error) {
      console.error('Error saving meal plan:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveMealPlan:', error);
    throw error;
  }
};

export const updateMealInPlan = async (
  date: string, 
  mealType: 'breakfast' | 'lunch' | 'dinner', 
  recipeId: number | null
): Promise<MealPlan> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, get or create the meal plan for this date
    let mealPlan = await getMealPlan(date);
    
    if (!mealPlan) {
      // Create new meal plan
      const newPlan = await saveMealPlan({
        plan_date: date,
        [mealType + '_recipe_id']: recipeId,
      });
      return newPlan;
    } else {
      // Update existing meal plan
      const updateData = {
        [mealType + '_recipe_id']: recipeId,
      };
      
      const { data, error } = await supabase
        .from('meal_plans')
        .update(updateData)
        .eq('id', mealPlan.id)
        .select(`
          *,
          breakfast_recipe:recipes!breakfast_recipe_id(*),
          lunch_recipe:recipes!lunch_recipe_id(*),
          dinner_recipe:recipes!dinner_recipe_id(*)
        `)
        .single();

      if (error) {
        console.error('Error updating meal plan:', error);
        throw error;
      }

      return data;
    }

    return mealPlan!;
  } catch (error) {
    console.error('Error in updateMealInPlan:', error);
    throw error;
  }
};

// Glucose Logging Functions
export const logGlucose = async (glucoseValue: number, context?: string, notes?: string): Promise<GlucoseLog> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('glucose_logs')
      .insert({
        user_id: user.id,
        glucose_value: glucoseValue,
        measurement_time: new Date().toISOString(),
        context,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging glucose:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in logGlucose:', error);
    throw error;
  }
};

export const getGlucoseLogs = async (days: number = 7): Promise<GlucoseLog[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('glucose_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('measurement_time', startDate.toISOString())
      .order('measurement_time', { ascending: false });

    if (error) {
      console.error('Error fetching glucose logs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getGlucoseLogs:', error);
    throw error;
  }
};

// User Preferences Functions
export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user preferences:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    throw error;
  }
};

export const saveUserPreferences = async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        ...preferences,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveUserPreferences:', error);
    throw error;
  }
};

// AI Chef Functions
export const getPersonalizedRecipes = async (
  mealType: 'breakfast' | 'lunch' | 'dinner',
  limit: number = 10
): Promise<Recipe[]> => {
  try {
    const preferences = await getUserPreferences();
    const userProfile = await getUserProfile();
    const glucoseLogs = await getGlucoseLogs(7);
    
    // Calculate glucose statistics
    const glucoseStats = calculateGlucoseStats(glucoseLogs);
    
    // Build query based on preferences, glucose trends, and diabetes type
    let query = supabase
      .from('recipes')
      .select('*')
      .eq('category', mealType);

    // Apply diabetes type specific filtering
    if (userProfile?.diabetes_type === 'type1') {
      // Type 1: Focus on carb counting and insulin timing
      query = query.lte('carbs', 45).gte('protein', 10);
    } else if (userProfile?.diabetes_type === 'type2') {
      // Type 2: Focus on low-carb and weight management
      query = query.lte('carbs', 35).gte('fiber', 3);
    } else if (userProfile?.diabetes_type === 'gestational') {
      // Gestational: Strict carb control
      query = query.lte('carbs', 30).gte('protein', 15);
    } else if (userProfile?.diabetes_type === 'prediabetes') {
      // Prediabetes: Prevent progression
      query = query.lte('carbs', 40).gte('fiber', 4);
    }

    // Apply glucose-based filtering with more sophisticated logic
    if (glucoseStats.avgGlucose > 160) {
      // Very high glucose - strict low carb
      query = query.lte('carbs', 20).gte('protein', 15);
    } else if (glucoseStats.avgGlucose > 140) {
      // High glucose - low carb options
      query = query.lte('carbs', 30);
    } else if (glucoseStats.avgGlucose < 70) {
      // Low glucose - can handle more carbs, but balanced
      query = query.lte('carbs', 45).gte('carbs', 20);
    } else {
      // Normal glucose - balanced options
      query = query.lte('carbs', 40);
    }

    // Apply time-based glucose patterns
    const recentGlucose = glucoseLogs.filter(log => {
      const logTime = new Date(log.measurement_time);
      const now = new Date();
      return (now.getTime() - logTime.getTime()) < 24 * 60 * 60 * 1000; // Last 24 hours
    });

    if (recentGlucose.length > 0) {
      const recentAvg = recentGlucose.reduce((sum, log) => sum + log.glucose_value, 0) / recentGlucose.length;
      
      // If glucose is trending up, be more restrictive
      if (recentAvg > glucoseStats.avgGlucose + 20) {
        query = query.lte('carbs', 25);
      }
    }

    // Apply dietary restrictions
    if (preferences?.dietary_restrictions?.length) {
      if (preferences.meal_complexity) {
        query = query.eq('difficulty', preferences.meal_complexity);
      }
    }

    // Apply calorie limits
    if (preferences?.max_daily_calories) {
      const maxMealCalories = Math.floor(preferences.max_daily_calories * 0.4);
      query = query.lte('calories', maxMealCalories);
    }

    // Order by relevance (lower carbs for high glucose, balanced for normal)
    if (glucoseStats.avgGlucose > 140) {
      query = query.order('carbs', { ascending: true });
    } else {
      query = query.order('name');
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      console.error('Error fetching personalized recipes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPersonalizedRecipes:', error);
    throw error;
  }
};

// Helper function to calculate glucose statistics
const calculateGlucoseStats = (glucoseLogs: GlucoseLog[]) => {
  if (glucoseLogs.length === 0) {
    return {
      avgGlucose: 100,
      timeInRange: 0,
      trend: 'stable',
      recentSpikes: 0
    };
  }

  const values = glucoseLogs.map(log => log.glucose_value);
  const avgGlucose = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Calculate time in range (70-140 mg/dL)
  const inRange = values.filter(val => val >= 70 && val <= 140).length;
  const timeInRange = (inRange / values.length) * 100;
  
  // Calculate trend
  const recent = values.slice(0, Math.min(3, values.length));
  const older = values.slice(-Math.min(3, values.length));
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
  
  let trend = 'stable';
  if (recentAvg > olderAvg + 15) trend = 'rising';
  else if (recentAvg < olderAvg - 15) trend = 'falling';
  
  // Count recent spikes (>180 mg/dL)
  const recentSpikes = values.filter(val => val > 180).length;
  
  return {
    avgGlucose: Math.round(avgGlucose),
    timeInRange: Math.round(timeInRange),
    trend,
    recentSpikes
  };
};

export const generateDayPlan = async (date: string): Promise<MealPlan> => {
  try {
    const preferences = await getUserPreferences();
    const glucoseLogs = await getGlucoseLogs(7);
    
    // Get personalized recipes for each meal
    const [breakfastRecipes, lunchRecipes, dinnerRecipes] = await Promise.all([
      getPersonalizedRecipes('breakfast', 5),
      getPersonalizedRecipes('lunch', 5),
      getPersonalizedRecipes('dinner', 5),
    ]);

    // Select recipes (for now, just pick the first one from each category)
    // In a real implementation, this would use more sophisticated AI logic
    const selectedBreakfast = breakfastRecipes[0];
    const selectedLunch = lunchRecipes[0];
    const selectedDinner = dinnerRecipes[0];

    // Calculate totals
    const totalCalories = (selectedBreakfast?.calories || 0) + 
                         (selectedLunch?.calories || 0) + 
                         (selectedDinner?.calories || 0);
    
    const totalCarbs = (selectedBreakfast?.carbs || 0) + 
                      (selectedLunch?.carbs || 0) + 
                      (selectedDinner?.carbs || 0);

    const totalProtein = (selectedBreakfast?.protein || 0) + 
                        (selectedLunch?.protein || 0) + 
                        (selectedDinner?.protein || 0);

    // Create the meal plan
    const mealPlan = await saveMealPlan({
      plan_date: date,
      breakfast_recipe_id: selectedBreakfast?.id,
      lunch_recipe_id: selectedLunch?.id,
      dinner_recipe_id: selectedDinner?.id,
      total_calories: totalCalories,
      total_carbs: totalCarbs,
      total_protein: totalProtein,
      snacks: [
        { id: '1', icon: '🥛', text: 'Greek Yogurt', carbs: '10g carbs' },
        { id: '2', icon: '💧', text: 'Drink water', carbs: null },
      ],
      reminders: [
        { id: '1', icon: '💊', text: 'Check glucose after lunch', time: '2:00 PM' },
        { id: '2', icon: '🍽️', text: 'Eat a light dinner', time: 'before 8:00 PM' },
      ],
    });

    return mealPlan;
  } catch (error) {
    console.error('Error in generateDayPlan:', error);
    throw error;
  }
};
