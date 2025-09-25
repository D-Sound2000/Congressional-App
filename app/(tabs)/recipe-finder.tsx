import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  Linking,
} from 'react-native';
import { supabase } from '@/lib/supabase';

interface Recipe {
  id: number;
  title: string;
  image: string;
  sugar: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  readyInMinutes: number;
  servings: number;
  isFavorite?: boolean;
  sourceUrl?: string;
  summary?: string;
}

interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  summary: string;
  instructions: string;
  ingredients: string[];
  nutrition: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    sugar: number;
  };
  readyInMinutes: number;
  servings: number;
  sourceUrl?: string;
}

// Common ingredients for Supercook-style selection
const COMMON_INGREDIENTS = [
  'chicken', 'beef', 'pork', 'fish', 'shrimp', 'eggs', 'milk', 'cheese', 'yogurt',
  'rice', 'pasta', 'bread', 'potatoes', 'onions', 'garlic', 'tomatoes', 'carrots',
  'broccoli', 'spinach', 'lettuce', 'cucumber', 'bell peppers', 'mushrooms',
  'apples', 'bananas', 'oranges', 'strawberries', 'blueberries', 'lemons', 'limes',
  'olive oil', 'butter', 'flour', 'sugar', 'salt', 'pepper', 'basil', 'oregano',
  'thyme', 'rosemary', 'cumin', 'paprika', 'chili powder', 'soy sauce', 'vinegar',
  'honey', 'maple syrup', 'nuts', 'seeds', 'beans', 'lentils', 'quinoa', 'oats'
];

export default function RecipeFinder() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  
  // Search mode states
  const [searchMode, setSearchMode] = useState<'text' | 'ingredients' | 'nutrients'>('text');
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  
  // Nutrient search states
  const [maxSugar, setMaxSugar] = useState('');
  const [maxCarbs, setMaxCarbs] = useState('');
  const [minProtein, setMinProtein] = useState('');
  const [maxCalories, setMaxCalories] = useState('');
  
  // Ingredient search states
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  
  // Website URL extraction
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [showUrlExtraction, setShowUrlExtraction] = useState(false);

  // Replace with your Spoonacular API key
  const SPOONACULAR_API_KEY = '75eb74379764490691e81b22b93ebf10';
  const BASE_URL = 'https://api.spoonacular.com/recipes';

  const [nutritionValues, setNutritionValues] = useState<any>(null);


  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('favorite_recipes')
          .select('*')
          .eq('user_id', user.id);
        
        if (data) {
          setFavorites(data.map(item => ({ ...item.recipe_data, isFavorite: true })));
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  // Helper function to extract nutrition data from API response
  const extractNutritionData = (nutritionData: any, fallbackCalories?: number) => {
    const getNutrientAmount = (name: string) => 
      nutritionData?.nutrients?.find((n: any) => n.name === name)?.amount || 0;
    
    return {
      sugar: getNutrientAmount('Sugar'),
      calories: fallbackCalories || getNutrientAmount('Calories'),
      carbs: getNutrientAmount('Carbohydrates'),
      protein: getNutrientAmount('Protein'),
      fat: getNutrientAmount('Fat'),
    };
  };

  const searchRecipes = async () => {
    if (!searchQuery.trim() && searchMode === 'text') {
      Alert.alert('Please enter a search term');
      return;
    }

    if (searchMode === 'ingredients' && selectedIngredients.length === 0) {
      Alert.alert('Please select at least one ingredient');
      return;
    }

    setLoading(true);
    try {
      let url = '';
      
      switch (searchMode) {
        case 'text':
          // url = `${BASE_URL}/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(searchQuery)}&number=5`;
          url = `${BASE_URL}/autocomplete?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(searchQuery)}&number=5`;
          console.log('searchQuery:', encodeURIComponent(searchQuery));
          break;
          
        case 'ingredients':
          const ingredientsString = selectedIngredients.join(',');
          url = `${BASE_URL}/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${encodeURIComponent(ingredientsString)}&number=5&ranking=2&ignorePantry=true`;
          break;
          
        case 'nutrients':
          url = `${BASE_URL}/findByNutrients?apiKey=${SPOONACULAR_API_KEY}&number=5`;
          if (maxSugar) url += `&maxSugar=${maxSugar}`;
          if (maxCarbs) url += `&maxCarbs=${maxCarbs}`;
          if (minProtein) url += `&minProtein=${minProtein}`;
          if (maxCalories) url += `&maxCalories=${maxCalories}`;
          break;
      }

      console.log('Searching URL:', url);
      let response = await fetch(url);
      let data = await response.json();
      console.log('data:', data);
      if(searchMode === 'text'){
        let ids = data.map((recipe: any) => recipe.id).join(',');
        url = `${BASE_URL}/informationBulk?apiKey=${SPOONACULAR_API_KEY}&ids=${ids}&includeNutrition=true`;
        response = await fetch(url);
        data = await response.json();
        console.log('newdata:', data);
      }

      if (data && data.length > 0) {
        let processedRecipes: Recipe[] = [];
        
        if (searchMode === 'ingredients') {
          // Handle ingredient search results - need to get nutrition data separately
          const recipeIds = data.map((recipe: any) => recipe.id).join(',');
          const nutritionUrl = `${BASE_URL}/informationBulk?apiKey=${SPOONACULAR_API_KEY}&ids=${recipeIds}&includeNutrition=true`;
          const nutritionResponse = await fetch(nutritionUrl);
          const nutritionData = await nutritionResponse.json();
          setNutritionValues(nutritionData);
          console.log('Nutrition data:', nutritionData);
          
          processedRecipes = data.map((recipe: any) => {
            const nutritionInfo = nutritionData.find((n: any) => n.id === recipe.id);
            const nutrition = extractNutritionData(nutritionInfo?.nutrition);
            return {
              id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              ...nutrition,
              readyInMinutes: nutritionInfo?.readyInMinutes || 0,
              servings: nutritionInfo?.servings || 1,
              sourceUrl: nutritionInfo?.sourceUrl,
              summary: nutritionInfo?.summary,
              isFavorite: favorites.some(fav => fav.id === recipe.id),
            };
          });
        } else if (searchMode === 'nutrients') {
          // Handle nutrient search results
          processedRecipes = data.results?.map((recipe: any) => {
            const nutrition = extractNutritionData(recipe.nutrition, recipe.calories);
            
            return {
              id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              ...nutrition,
              readyInMinutes: recipe.readyInMinutes || 0,
              servings: recipe.servings || 1,
              sourceUrl: recipe.sourceUrl,
              summary: recipe.summary,
              isFavorite: favorites.some(fav => fav.id === recipe.id),
            };
          });
          
          // If nutrition data is missing, fetch it separately
          if (processedRecipes.length > 0 && processedRecipes[0].sugar === 0) {
            console.log('Fetching nutrition data separately for nutrient search...');
            const recipeIds = processedRecipes.map(recipe => recipe.id).join(',');
            const nutritionUrl = `${BASE_URL}/informationBulk?apiKey=${SPOONACULAR_API_KEY}&ids=${recipeIds}`;
            
            try {
              const nutritionResponse = await fetch(nutritionUrl);
              const nutritionData = await nutritionResponse.json();
              
              processedRecipes = processedRecipes.map(recipe => {
                const nutritionInfo = nutritionData.find((n: any) => n.id === recipe.id);
                const nutrition = extractNutritionData(nutritionInfo?.nutrition, recipe.calories);
                return {
                  ...recipe,
                  ...nutrition,
                };
              });
            } catch (error) {
              console.error('Error fetching nutrition data:', error);
            }
          }
        } else {
          // print(data.results);
          // Handle text search results
          processedRecipes = data.map((recipe: any) => {
            const nutrition = extractNutritionData(recipe.nutrition, recipe.calories);
            return {
              id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              ...nutrition,
              readyInMinutes: recipe.readyInMinutes,
              servings: recipe.servings,
              sourceUrl: recipe.sourceUrl,
              summary: recipe.summary,
              isFavorite: favorites.some(fav => fav.id === recipe.id),
            };
          }) || [];
        }
        
        // Fetch nutrition widget data for all recipes to get accurate nutrition info
        processedRecipes = await Promise.all(
          processedRecipes.map(async (recipe) => {
            try {
              const nutritionWidgetUrl = `${BASE_URL}/${recipe.id}/nutritionWidget.json?apiKey=${SPOONACULAR_API_KEY}`;
              const nutritionResponse = await fetch(nutritionWidgetUrl);
              const nutritionData = await nutritionResponse.json();
              
              // Parse nutrition widget data to extract values
              const nutritionText = nutritionData.html || '';
              const caloriesMatch = nutritionText.match(/(\d+)\s*calories/i);
              const carbsMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*carbs/i);
              const proteinMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*protein/i);
              const fatMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*fat/i);
              const sugarMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*sugar/i);
              
              return {
                ...recipe,
                calories: caloriesMatch ? parseInt(caloriesMatch[1]) : recipe.calories,
                carbs: carbsMatch ? parseFloat(carbsMatch[1]) : recipe.carbs,
                protein: proteinMatch ? parseFloat(proteinMatch[1]) : recipe.protein,
                fat: fatMatch ? parseFloat(fatMatch[1]) : recipe.fat,
                sugar: sugarMatch ? parseFloat(sugarMatch[1]) : recipe.sugar,
              };
            } catch (error) {
              console.log(`Could not fetch nutrition widget for recipe ${recipe.id}:`, error);
              return recipe; // Return original recipe if nutrition fetch fails
            }
          })
        );
        
        setRecipes(processedRecipes);
      } else {
        console.log('No results found or empty results array');
        setRecipes([]);
        Alert.alert('No Results', 'No recipes found for your search. Try different criteria.');
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      Alert.alert('Error', 'Failed to fetch recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractRecipeFromUrl = async () => {
    if (!websiteUrl.trim()) {
      Alert.alert('Please enter a website URL');
      return;
    }

    setLoading(true);
    try {
      const url = `${BASE_URL}/extract?apiKey=${SPOONACULAR_API_KEY}&url=${encodeURIComponent(websiteUrl)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.title) {
        // Try to get nutrition data by searching for the recipe title
        let nutritionData = null;
        try {
          const searchUrl = `${BASE_URL}/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(data.title)}&number=1&addRecipeNutrition=true`;
          const searchResponse = await fetch(searchUrl);
          const searchData = await searchResponse.json();
          
          if (searchData.results && searchData.results.length > 0) {
            const similarRecipe = searchData.results[0];
            nutritionData = similarRecipe.nutrition;
          }
        } catch (error) {
          console.log('Could not fetch nutrition data for extracted recipe:', error);
        }

        const nutrition = extractNutritionData(nutritionData);
        const recipe: Recipe = {
          id: data.id, // Generate temporary ID
          title: data.title,
          image: data.image || 'https://via.placeholder.com/300x200',
          ...nutrition,
          readyInMinutes: data.readyInMinutes || 0,
          servings: data.servings || 1,
          sourceUrl: websiteUrl,
          summary: data.summary,
        };
        
        setRecipes([recipe]);
        setShowUrlExtraction(false);
        setWebsiteUrl('');
      } else {
        Alert.alert('Error', 'Could not extract recipe from this URL. Please try a different website.');
      }
    } catch (error) {
      console.error('Error extracting recipe:', error);
      Alert.alert('Error', 'Failed to extract recipe from URL.');
    } finally {
      setLoading(false);
    }
  };

  const getRecipeDetails = async (recipeId: number) => {
    setLoadingRecipe(true);
    try {
      const url = `${BASE_URL}/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      // Also fetch nutrition widget data for more accurate nutrition info
      let nutritionWidgetData = null;
      try {
        const nutritionWidgetUrl = `${BASE_URL}/${recipeId}/nutritionWidget.json?apiKey=${SPOONACULAR_API_KEY}`;
        const nutritionWidgetResponse = await fetch(nutritionWidgetUrl);
        nutritionWidgetData = await nutritionWidgetResponse.json();
      } catch (error) {
        console.log('Could not fetch nutrition widget data:', error);
      }

      // Parse nutrition widget data if available
      let widgetNutrition = {
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        sugar: 0,
      };

      if (nutritionWidgetData && nutritionWidgetData.html) {
        const nutritionText = nutritionWidgetData.html;
        const caloriesMatch = nutritionText.match(/(\d+)\s*calories/i);
        const carbsMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*carbs/i);
        const proteinMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*protein/i);
        const fatMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*fat/i);
        const sugarMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*sugar/i);
        
        widgetNutrition = {
          calories: caloriesMatch ? parseInt(caloriesMatch[1]) : 0,
          carbs: carbsMatch ? parseFloat(carbsMatch[1]) : 0,
          protein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
          fat: fatMatch ? parseFloat(fatMatch[1]) : 0,
          sugar: sugarMatch ? parseFloat(sugarMatch[1]) : 0,
        };
      }

      console.log('selectedRecipe', selectedRecipe);

      const nutrition = extractNutritionData(data.nutrition);
      console.log('data.nutrition', data);
      const nutritionFacts = nutritionValues.filter((nutrient: any)=> nutrient.id === data.id)
      console.log('nutritionFacts', nutritionFacts);
      const recipeDetail: RecipeDetail = {
        id: data.id,
        title: data.title,
        image: data.image,
        summary: data.summary.replace(/<[^>]*>/g, ''),
        instructions: data.instructions.replace(/<[^>]*>/g, ''),
        ingredients: data.extendedIngredients?.map((ing: any) => ing.original) || [],
        nutrition: {
          calories: nutritionFacts[0].nutrition.nutrients[0].amount,
          carbs:  nutritionFacts[0].nutrition.nutrients[3].amount,
          protein:  nutritionFacts[0].nutrition.nutrients[10].amount,
          fat:  nutritionFacts[0].nutrition.nutrients[1].amount,
          sugar: nutritionFacts[0].nutrition.nutrients[5].amount,
        },
        readyInMinutes: data.readyInMinutes,
        servings: data.servings,
        sourceUrl: data.sourceUrl,
      };

      setSelectedRecipe(recipeDetail);
      setShowRecipeModal(true);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      Alert.alert('Error', 'Failed to load recipe details.');
    } finally {
      setLoadingRecipe(false);
    }
  };

  const openRecipeUrl = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const toggleFavorite = async (recipe: Recipe) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (recipe.isFavorite) {
        await supabase
          .from('favorite_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.id);
        
        setFavorites(prev => prev.filter(fav => fav.id !== recipe.id));
        setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, isFavorite: false } : r));
      } else {
        await supabase
          .from('favorite_recipes')
          .insert({
            user_id: user.id,
            recipe_id: recipe.id,
            recipe_data: recipe,
          });
        
        setFavorites(prev => [...prev, { ...recipe, isFavorite: true }]);
        setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, isFavorite: true } : r));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites.');
      console.error('Error toggling favorite:', error);
    }
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => getRecipeDetails(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        
        {item.summary && (
          <Text style={styles.recipeSummary} numberOfLines={2}>
            {item.summary.replace(/<[^>]*>/g, '')}
          </Text>
        )}
        
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionText}>Calories: {item.calories.toFixed(0)}</Text>
          <Text style={styles.nutritionText}>Sugar: {item.sugar.toFixed(1)}g</Text>
        </View>
        
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionText}>Carbs: {item.carbs.toFixed(1)}g</Text>
          <Text style={styles.nutritionText}>Protein: {item.protein.toFixed(1)}g</Text>
        </View>
        
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionText}>Ready in {item.readyInMinutes} min</Text>
          <Text style={styles.nutritionText}>Serves {item.servings}</Text>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.favoriteButton, item.isFavorite && styles.favoriteButtonActive]}
            onPress={() => toggleFavorite(item)}
          >
            <Text style={styles.favoriteButtonText}>
              {item.isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
          
          {item.sourceUrl && (
            <TouchableOpacity
              style={styles.recipeLinkButton}
              onPress={() => openRecipeUrl(item.sourceUrl!)}
            >
              <Text style={styles.recipeLinkText}>🌐 View Original</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderIngredientButtons = () => (
    <View style={styles.ingredientSelectionContainer}>
      <Text style={styles.ingredientSelectionTitle}>
        Select ingredients you have ({selectedIngredients.length} selected)
      </Text>
      <Text style={styles.pantryNote}>
        💡 Salt, pepper, water, oil, butter, flour, and sugar are assumed to be available
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {COMMON_INGREDIENTS.map((ingredient) => (
          <TouchableOpacity
            key={ingredient}
            style={[
              styles.ingredientButton,
              selectedIngredients.includes(ingredient) && styles.selectedIngredientButton
            ]}
            onPress={() => toggleIngredient(ingredient)}
          >
            <Text style={[
              styles.ingredientButtonText,
              selectedIngredients.includes(ingredient) && styles.selectedIngredientButtonText
            ]}>
              {ingredient}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSearchOptions = () => (
    <View style={styles.searchOptionsContainer}>
      <TouchableOpacity
        style={styles.searchModeToggle}
        onPress={() => setShowSearchOptions(!showSearchOptions)}
      >
        <Text style={styles.searchModeToggleText}>
          {searchMode === 'text' ? 'Text Search' : 
           searchMode === 'ingredients' ? 'Ingredient Search' : 'Nutrient Search'}
        </Text>
        <Text style={styles.searchModeToggleArrow}>
          {showSearchOptions ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>
      
      {showSearchOptions && (
        <View style={styles.searchModeSelector}>
          <TouchableOpacity
            style={[styles.searchModeOption, searchMode === 'text' && styles.activeSearchMode]}
            onPress={() => setSearchMode('text')}
          >
            <Text style={[styles.searchModeOptionText, searchMode === 'text' && styles.activeSearchModeText]}>
              Text Search
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.searchModeOption, searchMode === 'ingredients' && styles.activeSearchMode]}
            onPress={() => setSearchMode('ingredients')}
          >
            <Text style={[styles.searchModeOptionText, searchMode === 'ingredients' && styles.activeSearchModeText]}>
              Ingredient Search
            </Text>
          </TouchableOpacity>
          
         
        </View>
      )}
    </View>
  );

  const renderSearchInputs = () => {
    switch (searchMode) {
      case 'text':
        return (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes by name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} onPress={searchRecipes}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'ingredients':
        return (
          <View style={styles.searchContainer}>
            {renderIngredientButtons()}
            <TouchableOpacity 
              style={[styles.searchButton, selectedIngredients.length === 0 && styles.disabledButton]} 
              onPress={searchRecipes}
              disabled={selectedIngredients.length === 0}
            >
              <Text style={styles.searchButtonText}>
                Find Recipes with {selectedIngredients.length} Ingredients
              </Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'nutrients':
        return (
          <View style={styles.searchContainer}>
            <Text style={styles.nutrientSearchTitle}>Diabetic-Friendly Nutrient Limits</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Max sugar (g)"
              value={maxSugar}
              onChangeText={setMaxSugar}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Max carbs (g)"
              value={maxCarbs}
              onChangeText={setMaxCarbs}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Min protein (g)"
              value={minProtein}
              onChangeText={setMinProtein}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Max calories"
              value={maxCalories}
              onChangeText={setMaxCalories}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.searchButton} onPress={searchRecipes}>
              <Text style={styles.searchButtonText}>Search by Nutrients</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipe Finder</Text>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            Favorites ({favorites.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'search' && (
        <>
          {renderSearchOptions()}
          {renderSearchInputs()}
          
          {/* URL Extraction */}
          <TouchableOpacity
            style={styles.urlExtractionButton}
            onPress={() => setShowUrlExtraction(true)}
          >
            <Text style={styles.urlExtractionText}>🔗 Extract Recipe from Website</Text>
          </TouchableOpacity>
        </>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={activeTab === 'search' ? recipes : favorites}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id.toString()}
          style={styles.recipeList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* URL Extraction Modal */}
      <Modal
        visible={showUrlExtraction}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUrlExtraction(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Extract Recipe from Website</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter website URL..."
              value={websiteUrl}
              onChangeText={setWebsiteUrl}
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowUrlExtraction(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={extractRecipeFromUrl}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Extract Recipe
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recipe Detail Modal */}
      <Modal
        visible={showRecipeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRecipeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {loadingRecipe ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : selectedRecipe ? (
              <ScrollView style={styles.modalScroll}>
                <Image source={{ uri: selectedRecipe.image }} style={styles.modalImage} />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowRecipeModal(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Nutrition Info */}
                <View style={styles.nutritionSection}>
                  <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                      <Text style={styles.nutritionValue}>{selectedRecipe.nutrition.calories.toFixed(1)}</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                      <Text style={styles.nutritionValue}>{selectedRecipe.nutrition.carbs.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                      <Text style={styles.nutritionValue}>{selectedRecipe.nutrition.protein.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Fat</Text>
                      <Text style={styles.nutritionValue}>{selectedRecipe.nutrition.fat.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Sugar</Text>
                      <Text style={styles.nutritionValue}>{selectedRecipe.nutrition.sugar.toFixed(1)}g</Text>
                    </View>
                  </View>
                </View>

                {/* Recipe Info */}
                <View style={styles.recipeInfoSection}>
                  <Text style={styles.recipeInfoText}>
                    Ready in {selectedRecipe.readyInMinutes} minutes • Serves {selectedRecipe.servings}
                  </Text>
                </View>

                {/* Ingredients */}
                {selectedRecipe.ingredients.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <Text key={index} style={styles.ingredientText}>• {ingredient}</Text>
                    ))}
                  </View>
                )}

                {/* Instructions */}
                {selectedRecipe.instructions && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Instructions</Text>
                    <Text style={styles.instructionsText}>{selectedRecipe.instructions}</Text>
                  </View>
                )}

                {/* Original Recipe Link */}
                {selectedRecipe.sourceUrl && (
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.originalRecipeButton}
                      onPress={() => openRecipeUrl(selectedRecipe.sourceUrl!)}
                    >
                      <Text style={styles.originalRecipeText}>🌐 View Original Recipe</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 50,
  },
  recipeList: {
    flex: 1,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  recipeInfo: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  recipeSummary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nutritionText: {
    fontSize: 14,
    color: '#666',
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  favoriteButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  favoriteButtonActive: {
    // Already handled by emoji
  },
  favoriteButtonText: {
    fontSize: 20,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  recipeLinkButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  recipeLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    height: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalScroll: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  nutritionSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%', // Two items per row
    marginBottom: 10,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  recipeInfoSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipeInfoText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  ingredientText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  instructionsText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  urlExtractionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  urlExtractionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchOptionsContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchModeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  searchModeToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  searchModeToggleArrow: {
    fontSize: 18,
    color: '#666',
  },
  searchModeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  searchModeOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  activeSearchMode: {
    backgroundColor: '#007AFF',
  },
  searchModeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  activeSearchModeText: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonTextPrimary: {
    color: '#fff',
  },
  originalRecipeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  originalRecipeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nutrientSearchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  ingredientSelectionContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ingredientSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  pantryNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },

  ingredientButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  ingredientButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedIngredientButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectedIngredientButtonText: {
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
}); 