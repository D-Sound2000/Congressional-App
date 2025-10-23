import { getUserProfile } from './userProfileService';
import { getGlucoseLogs } from './mealPlannerService';

const SPOONACULAR_API_KEY = '75eb74379764490691e81b22b93ebf10';
const BASE_URL = 'https://api.spoonacular.com/recipes';

export interface SmartRecipe {
  id: number;
  title: string;
  image: string;
  time: string;
  carbs: string;
  calories: number;
  sugar: number;
  protein: number;
  readyInMinutes: number;
  badge: {
    label: string;
    color: string;
  };
  sourceUrl?: string;
}

const getMealTypeByTime = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 17) return 'snack';
  return 'dinner';
};

const getBadgeForCarbs = (carbs: number): { label: string; color: string } => {
  if (carbs <= 20) return { label: 'Low-Carb', color: '#43a047' };
  if (carbs <= 35) return { label: 'Medium', color: '#fbc02d' };
  return { label: 'High-Carb', color: '#e65100' };
};
const calculateMaxCarbs = async (): Promise<number> => {
  try {
    const profile = await getUserProfile();
    const logs = await getGlucoseLogs(7);
    
    let averageBloodSugar = profile?.average_blood_sugar || 120;
    if (logs && logs.length > 0) {
      const recentLogs = logs.slice(0, 5);
      averageBloodSugar = recentLogs.reduce((sum, log) => sum + log.glucose_value, 0) / recentLogs.length;
    }
    
    let baseMaxCarbs = 45;
    
    if (profile?.diabetes_type?.toLowerCase().includes('type 1')) {
      baseMaxCarbs = profile.insulin_dependent ? 50 : 40;
    } else if (profile?.diabetes_type?.toLowerCase().includes('type 2')) {
      baseMaxCarbs = profile.insulin_dependent ? 45 : 35;
    }
    
    if (averageBloodSugar > 180) {
      baseMaxCarbs = Math.max(20, baseMaxCarbs - 15);
    } else if (averageBloodSugar > 140) {
      baseMaxCarbs = Math.max(25, baseMaxCarbs - 10);
    } else if (averageBloodSugar < 80) {
      baseMaxCarbs = baseMaxCarbs + 10;
    }
    
    return baseMaxCarbs;
  } catch (error) {
    console.log('Error calculating max carbs, using default:', error);
    return 35;
  }
};

const getDietTags = async (): Promise<string> => {
  try {
    const profile = await getUserProfile();
    const tags: string[] = [];
    
    tags.push('low glycemic');
    
    if (profile?.insulin_dependent) {
      tags.push('balanced');
    } else {
      tags.push('low carb');
    }
    
    return tags.join(',');
  } catch (error) {
    console.log('Error getting diet tags:', error);
    return 'low glycemic,balanced';
  }
};

export const getSmartRecommendations = async (count: number = 4): Promise<SmartRecipe[]> => {
  try {
    const mealType = getMealTypeByTime();
    const maxCarbs = await calculateMaxCarbs();
    const dietTags = await getDietTags();
    const randomOffset = Math.floor(Math.random() * 51);
    
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      number: '20',
      type: mealType,
      maxCarbs: maxCarbs.toString(),
      maxSugar: '15',
      addRecipeNutrition: 'true',
      sort: 'random',
      offset: randomOffset.toString(),
    });
    
    const response = await fetch(`${BASE_URL}/complexSearch?${params.toString()}`);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      const relaxedParams = new URLSearchParams({
        apiKey: SPOONACULAR_API_KEY,
        number: '15',
        type: mealType,
        maxCarbs: (maxCarbs + 10).toString(),
        addRecipeNutrition: 'true',
        sort: 'random',
      });
      
      const relaxedResponse = await fetch(`${BASE_URL}/complexSearch?${relaxedParams.toString()}`);
      const relaxedData = await relaxedResponse.json();
      
      if (!relaxedData.results || relaxedData.results.length === 0) {
        throw new Error('No recipes found');
      }
      
      const shuffled = shuffleArray(relaxedData.results);
      return formatRecipes(shuffled.slice(0, count));
    }
    
    const filteredRecipes = data.results.filter((recipe: any) => {
      const carbs = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0;
      return carbs <= maxCarbs + 5;
    });
    
    const shuffled = shuffleArray(filteredRecipes);
    return formatRecipes(shuffled.slice(0, count));
  } catch (error) {
    console.error('Error fetching smart recommendations:', error);
    return getFallbackRecipes();
  }
};

const shuffleArray = (array: any[]): any[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const formatRecipes = (apiRecipes: any[]): SmartRecipe[] => {
  return apiRecipes.map((recipe: any) => {
    const carbs = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0;
    const calories = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0;
    const sugar = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Sugar')?.amount || 0;
    const protein = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0;
    
    return {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image || 'https://placehold.co/120x80/png',
      time: `${recipe.readyInMinutes || 30} min`,
      carbs: `${Math.round(carbs)}g carbs`,
      calories: Math.round(calories),
      sugar: Math.round(sugar),
      protein: Math.round(protein),
      readyInMinutes: recipe.readyInMinutes || 30,
      badge: getBadgeForCarbs(carbs),
      sourceUrl: recipe.sourceUrl,
    };
  });
};
const getFallbackRecipes = (): SmartRecipe[] => {
  return [
    {
      id: 1,
      title: 'Avocado Toast with Eggs',
      image: 'https://placehold.co/120x80/png',
      time: '10 min',
      carbs: '15g carbs',
      calories: 250,
      sugar: 2,
      protein: 12,
      readyInMinutes: 10,
      badge: { label: 'Low-Carb', color: '#43a047' },
    },
    {
      id: 2,
      title: 'Grilled Chicken Salad',
      image: 'https://placehold.co/120x80/png',
      time: '20 min',
      carbs: '18g carbs',
      calories: 320,
      sugar: 5,
      protein: 35,
      readyInMinutes: 20,
      badge: { label: 'Low-Carb', color: '#43a047' },
    },
    {
      id: 3,
      title: 'Greek Yogurt Bowl',
      image: 'https://placehold.co/120x80/png',
      time: '5 min',
      carbs: '22g carbs',
      calories: 280,
      sugar: 12,
      protein: 20,
      readyInMinutes: 5,
      badge: { label: 'Medium', color: '#fbc02d' },
    },
    {
      id: 4,
      title: 'Vegetable Stir-Fry',
      image: 'https://placehold.co/120x80/png',
      time: '25 min',
      carbs: '28g carbs',
      calories: 310,
      sugar: 8,
      protein: 15,
      readyInMinutes: 25,
      badge: { label: 'Medium', color: '#fbc02d' },
    },
  ];
};

export const getRecommendationsForMealType = async (
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  count: number = 4
): Promise<SmartRecipe[]> => {
  try {
    const maxCarbs = await calculateMaxCarbs();
    
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      number: count.toString(),
      type: mealType,
      maxCarbs: maxCarbs.toString(),
      maxSugar: '15',
      addRecipeNutrition: 'true',
      sort: 'healthiness',
      sortDirection: 'desc',
    });
    
    const response = await fetch(`${BASE_URL}/complexSearch?${params.toString()}`);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return getFallbackRecipes();
    }
    
    return formatRecipes(data.results);
  } catch (error) {
    console.error('Error fetching meal type recommendations:', error);
    return getFallbackRecipes();
  }
};

