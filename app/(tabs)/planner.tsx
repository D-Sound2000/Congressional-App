import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getRecipes, 
  getMealPlan, 
  updateMealInPlan, 
  getPersonalizedRecipes,
  Recipe, 
  MealPlan 
} from '@/lib/mealPlannerService'; // Meal planning logic - still working on this
import { getUserProfile } from '@/lib/userProfileService';
import {
  getPlannerItems,
  createPlannerItem,
  updatePlannerItem,
  deletePlannerItem,
  togglePlannerItemCompletion,
  PlannerItem,
  CreatePlannerItemData,
  formatTime,
  groupItemsByCategory,
  getPriorityColor,
  getTypeIcon,
} from '@/lib/plannerService';
import AddItemModal from '@/components/AddItemModal';

// Helper function to format date for API
const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get current week dates with extended range
const getWeekDates = (centerDate: Date = new Date()) => {
  const startOfWeek = new Date(centerDate);
  const currentDay = centerDate.getDay();
  
  // Fix Sunday (day 0) calculation
  const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
  startOfWeek.setDate(centerDate.getDate() - daysToSubtract);

  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    week.push({
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      date: date.getDate(),
      fullDate: date,
      isToday: date.toDateString() === new Date().toDateString(),
      isSelected: date.toDateString() === centerDate.toDateString(),
    });
  }
  return week;
};

// Get extended week dates (previous and next week)
const getExtendedWeekDates = (centerDate: Date = new Date()) => {
  const currentWeek = getWeekDates(centerDate);
  return currentWeek; // Just return current week for now
};

// Meal card component
const MealCard = ({ 
  title, 
  icon, 
  meal, 
  onPress, 
  isDark = false 
}: {
  title: string;
  icon: string;
  meal?: Recipe;
  onPress: () => void;
  isDark?: boolean;
}) => (
  <TouchableOpacity 
    style={[
      styles.mealCard, 
      { backgroundColor: '#fff' }
    ]} 
    onPress={onPress}
  >
    <View style={styles.mealHeader}>
      <Text style={styles.mealIcon}>{icon}</Text>
      <Text style={[styles.mealTitle, { color: '#333' }]}>
        {title}
      </Text>
    </View>
    
    {meal ? (
      <View style={styles.mealContent}>
        <Image 
          source={{ uri: meal.image_url || 'https://placehold.co/80x60/png' }} 
          style={styles.mealImage} 
        />
        <View style={styles.mealInfo}>
          <Text style={[styles.mealName, { color: '#333' }]}>
            {meal.name}
          </Text>
          <View style={styles.nutritionInfo}>
            <Text style={[styles.nutritionText, { color: '#666' }]}>
              {meal.calories} cal
            </Text>
            <Text style={[styles.nutritionText, { color: '#666' }]}>
              {meal.carbs}g carbs
            </Text>
          </View>
        </View>
      </View>
    ) : (
      <View style={styles.emptyMeal}>
        <Text style={[styles.addMealText, { color: '#666' }]}>
          + Add a Meal
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

// Snack item component
const SnackItem = ({ 
  snack, 
  onPress, 
  isDark = false 
}: {
  snack: any;
  onPress: () => void;
  isDark?: boolean;
}) => (
  <TouchableOpacity 
    style={[
      styles.snackItem, 
      { backgroundColor: '#f8f9fa' }
    ]} 
    onPress={onPress}
  >
    <Text style={styles.snackIcon}>{snack.icon}</Text>
    <View style={styles.snackInfo}>
      <Text style={[styles.snackText, { color: '#333' }]}>
        {snack.text}
      </Text>
      {snack.carbs && (
        <Text style={[styles.snackCarbs, { color: '#666' }]}>
          {snack.carbs}
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [mealSearchQuery, setMealSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // Removed dark mode - using light theme only
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [snacks, setSnacks] = useState([
    { id: '1', icon: '🥛', text: 'Greek Yogurt', carbs: '10g carbs' },
    { id: '2', icon: '💧', text: 'Drink water', carbs: null },
    { id: '3', icon: '💊', text: 'Check glucose after lunch', carbs: null },
  ]);
  const [medications, setMedications] = useState<any[]>([]);

  const weekDates = getWeekDates(selectedDate);
  const extendedWeekDates = getExtendedWeekDates(selectedDate);
  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category === selectedMeal
  );
  const groupedItems = groupItemsByCategory(plannerItems);

  // Load meal plan and planner items for selected date
  useEffect(() => {
    loadMealPlan();
    loadUserProfile();
    loadPlannerItems();
  }, [selectedDate]);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
      if (profile?.medications) {
        setMedications(profile.medications.map((med: string, index: number) => ({
          id: index.toString(),
          name: med,
          icon: '💊',
          time: 'Morning'
        })));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadPlannerItems = async () => {
    try {
      setLoading(true);
      const dateString = formatDateForAPI(selectedDate);
      const items = await getPlannerItems(dateString);
      setPlannerItems(items);
    } catch (error) {
      console.error('Error loading planner items:', error);
      Alert.alert('Error', 'Failed to load planner items');
    } finally {
      setLoading(false);
    }
  };

  // Load recipes when modal opens
  useEffect(() => {
    if (showMealModal && selectedMeal) {
      loadRecipes();
    }
  }, [showMealModal, selectedMeal]);

  const loadMealPlan = async () => {
    try {
      setLoading(true);
      const dateString = formatDateForAPI(selectedDate);
      const plan = await getMealPlan(dateString);
      setMealPlan(plan);
      
      // Update snacks and reminders from meal plan
      if (plan?.snacks) {
        setSnacks(plan.snacks);
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
      Alert.alert('Error', 'Failed to load meal plan');
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const personalizedRecipes = await getPersonalizedRecipes(
        selectedMeal as 'breakfast' | 'lunch' | 'dinner',
        20
      );
      setRecipes(personalizedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
      Alert.alert('Error', 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleMealSelect = (mealType: string) => {
    setSelectedMeal(mealType);
    setShowMealModal(true);
  };

  const handleAddMeal = (mealType: string) => {
    setSelectedMealType(mealType);
    setShowAddMealModal(true);
  };

  const handleRecipeSelect = async (recipe: Recipe) => {
    try {
      setLoading(true);
      const dateString = formatDateForAPI(selectedDate);
      const updatedPlan = await updateMealInPlan(
        dateString,
        selectedMeal as 'breakfast' | 'lunch' | 'dinner',
        recipe.id
      );
      setMealPlan(updatedPlan);
      setShowMealModal(false);
      setSelectedMeal(null);
    } catch (error) {
      console.error('Error selecting recipe:', error);
      Alert.alert('Error', 'Failed to save meal selection');
    } finally {
      setLoading(false);
    }
  };

  const handleMealSearch = async () => {
    if (!mealSearchQuery.trim()) {
      Alert.alert('Error', 'Please enter a meal or ingredient to search');
      return;
    }

    try {
      setLoading(true);
      console.log('Searching for:', mealSearchQuery);
      
      // Use Spoonacular API like the recipe finder
      const SPOONACULAR_API_KEY = '75eb74379764490691e81b22b93ebf10';
      const BASE_URL = 'https://api.spoonacular.com/recipes';
      
      // First get recipe IDs from autocomplete
      const autocompleteUrl = `${BASE_URL}/autocomplete?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(mealSearchQuery)}&number=10`;
      console.log('Autocomplete URL:', autocompleteUrl);
      
      const autocompleteResponse = await fetch(autocompleteUrl);
      const autocompleteData = await autocompleteResponse.json();
      console.log('Autocomplete results:', autocompleteData);
      
      if (!autocompleteData || autocompleteData.length === 0) {
        Alert.alert('No Results', `No recipes found for "${mealSearchQuery}". Try different keywords.`);
        setRecipes([]);
        return;
      }
      
      // Get detailed recipe information with nutrition
      const recipeIds = autocompleteData.map((recipe: any) => recipe.id).join(',');
      const detailsUrl = `${BASE_URL}/informationBulk?apiKey=${SPOONACULAR_API_KEY}&ids=${recipeIds}&includeNutrition=true`;
      console.log('Details URL:', detailsUrl);
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      console.log('Recipe details:', detailsData);
      
      // Convert to our Recipe format
      const convertedRecipes = detailsData.map((recipe: any) => ({
        id: recipe.id,
        name: recipe.title,
        description: recipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        image_url: recipe.image,
        prep_time: recipe.preparationMinutes || 15,
        cook_time: recipe.cookingMinutes || 20,
        servings: recipe.servings || 4,
        calories: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0,
        carbs: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0,
        protein: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0,
        fat: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0,
        fiber: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fiber')?.amount || 0,
        sugar: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Sugar')?.amount || 0,
        sodium: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Sodium')?.amount || 0,
        category: 'dinner', // Default category
        difficulty: 'medium',
        tags: recipe.diets || [],
        ingredients: recipe.extendedIngredients || [],
        instructions: recipe.analyzedInstructions?.[0]?.steps || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      console.log('Converted recipes:', convertedRecipes);
      setRecipes(convertedRecipes);
      
    } catch (error) {
      console.error('Error searching meals:', error);
      Alert.alert('Error', 'Failed to search meals. Please check your internet connection.');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItemCompletion = async (item: PlannerItem) => {
    try {
      await togglePlannerItemCompletion(item.id, !item.completed);
      await loadPlannerItems(); // Reload items
    } catch (error) {
      console.error('Error toggling item completion:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = async (item: PlannerItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlannerItem(item.id);
              await loadPlannerItems(); // Reload items
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(selectedDate.getDate() - 1);
    } else {
      newDate.setDate(selectedDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#f6f8fa' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#fff' }]}>
        <Text style={[styles.headerTitle, { color: '#333' }]}>
          Daily Planner
        </Text>
      </View>

      {/* Date Navigation */}
      <View style={[styles.dateNavigation, { backgroundColor: '#fff' }]}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleDateNavigation('prev')}
        >
          <Ionicons name="chevron-back" size={24} color={'#333'} />
        </TouchableOpacity>
        
        <View style={styles.dateInfo}>
          <Text style={[styles.selectedDate, { color: '#333' }]}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleDateNavigation('next')}
        >
          <Ionicons name="chevron-forward" size={24} color={'#333'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Week Calendar */}
        <View style={[styles.calendarContainer, { backgroundColor: '#fff' }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.weekRow}>
              {weekDates.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayBox,
                    day.isToday && styles.todayBox,
                    day.isSelected && styles.selectedBox,
                    { 
                      backgroundColor: day.isToday 
                        ? '#007AFF' 
                        : day.isSelected 
                          ? '#34C759' 
                          : '#f8f9fa' 
                    }
                  ]}
                  onPress={() => setSelectedDate(day.fullDate)}
                >
                  <Text style={[
                    styles.dayText,
                    { color: (day.isToday || day.isSelected) ? '#fff' : '#333' }
                  ]}>
                    {day.day}
                  </Text>
                  <Text style={[
                    styles.dateText,
                    { color: (day.isToday || day.isSelected) ? '#fff' : '#333' }
                  ]}>
                    {day.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Add Planner Item Button */}
        <TouchableOpacity 
          style={[styles.addPlannerItemButton, { backgroundColor: '#fff' }]}
          onPress={() => setShowAddItemModal(true)}
        >
          <View style={styles.addPlannerItemContent}>
            <View style={styles.addPlannerItemIcon}>
              <Ionicons name="add-circle" size={32} color="#007AFF" />
            </View>
            <View style={styles.addPlannerItemText}>
              <Text style={[styles.addPlannerItemTitle, { color: '#333' }]}>
                Add Planner Item
              </Text>
              <Text style={[styles.addPlannerItemSubtitle, { color: '#666' }]}>
                Medications, Reminders, Checkups & More
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={'#666'} />
          </View>
        </TouchableOpacity>

        {/* Meal Cards */}
        <View style={styles.mealsContainer}>
          <MealCard
            title="Breakfast"
            icon="☀️"
            meal={mealPlan?.breakfast_recipe}
            onPress={() => handleAddMeal('breakfast')}
            isDark={false}
          />
          <MealCard
            title="Lunch"
            icon="🌞"
            meal={mealPlan?.lunch_recipe}
            onPress={() => handleAddMeal('lunch')}
            isDark={false}
          />
          <MealCard
            title="Dinner"
            icon="🌙"
            meal={mealPlan?.dinner_recipe}
            onPress={() => handleAddMeal('dinner')}
            isDark={false}
          />
        </View>

        {/* Medications */}
        {medications.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: '#333' }]}>Today's Medications</Text>
            {medications.map((medication) => (
              <View key={medication.id} style={styles.medicationItem}>
                <Text style={styles.medicationIcon}>{medication.icon}</Text>
                <View style={styles.medicationInfo}>
                  <Text style={[styles.medicationText, { color: '#333' }]}>{medication.name}</Text>
                  <Text style={[styles.medicationTime, { color: '#666' }]}>{medication.time}</Text>
                </View>
                <TouchableOpacity style={styles.medicationCheck}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={'#666'} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Planner Items by Category */}
        {Object.entries(groupedItems).map(([category, items]) => {
          if (items.length === 0) return null;
          
          const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
          
          return (
            <View key={category} style={[styles.plannerSection, { backgroundColor: '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: '#333' }]}>
                {categoryTitle} ({items.length})
              </Text>
              <View style={styles.plannerItemsList}>
                {items.map((item) => (
                  <View key={item.id} style={[styles.plannerItem, { backgroundColor: '#f8f9fa' }]}>
                    <TouchableOpacity
                      style={styles.plannerItemContent}
                      onPress={() => handleToggleItemCompletion(item)}
                    >
                      <View style={styles.plannerItemLeft}>
                        <Text style={styles.plannerItemIcon}>{getTypeIcon(item.item_type)}</Text>
                        <View style={styles.plannerItemInfo}>
                          <Text style={[
                            styles.plannerItemTitle, 
                            { 
                              color: '#333',
                              textDecorationLine: item.completed ? 'line-through' : 'none',
                              opacity: item.completed ? 0.6 : 1
                            }
                          ]}>
                            {item.title}
                          </Text>
                          {item.description && (
                            <Text style={[styles.plannerItemDescription, { color: '#666' }]}>
                              {item.description}
                            </Text>
                          )}
                          <View style={styles.plannerItemMeta}>
                            {item.scheduled_time && (
                              <Text style={[styles.plannerItemTime, { color: '#666' }]}>
                                {formatTime(item.scheduled_time)}
                              </Text>
                            )}
                            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                          </View>
                        </View>
                      </View>
                      <View style={styles.plannerItemActions}>
                        <TouchableOpacity
                          style={styles.plannerItemCheck}
                          onPress={() => handleToggleItemCompletion(item)}
                        >
                          <Ionicons 
                            name={item.completed ? "checkmark-circle" : "checkmark-circle-outline"} 
                            size={24} 
                            color={item.completed ? '#34C759' : ('#666')} 
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.plannerItemDelete}
                          onPress={() => handleDeleteItem(item)}
                        >
                          <Ionicons name="trash-outline" size={20} color={'#666'} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Meal Selection Modal */}
      <Modal
        visible={showMealModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMealModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: '#f6f8fa' }]}>
          <View style={[styles.modalHeader, { backgroundColor: '#fff' }]}>
            <Text style={[styles.modalTitle, { color: '#333' }]}>
              Choose {selectedMeal}
            </Text>
            <TouchableOpacity onPress={() => setShowMealModal(false)}>
              <Ionicons name="close" size={24} color={'#333'} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: '#fff' }]}
              placeholder="Search recipes..."
              placeholderTextColor={'#666'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.scanButton}>
              <Text style={styles.scanButtonText}>📸 Scan Food</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={[styles.loadingText, { color: '#333' }]}>
                Loading recipes...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredRecipes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.recipeItem, { backgroundColor: '#fff' }]}
                  onPress={() => handleRecipeSelect(item)}
                >
                  <Image 
                    source={{ uri: item.image_url || 'https://placehold.co/80x60/png' }} 
                    style={styles.recipeImage} 
                  />
                  <View style={styles.recipeInfo}>
                    <Text style={[styles.recipeName, { color: '#333' }]}>
                      {item.name}
                    </Text>
                    <View style={styles.recipeDetails}>
                      <Text style={[styles.recipeDetail, { color: '#666' }]}>
                        {item.calories} cal
                      </Text>
                      <Text style={[styles.recipeDetail, { color: '#666' }]}>
                        {item.carbs}g carbs
                      </Text>
                      <Text style={[styles.recipeDetail, { color: '#666' }]}>
                        {item.prep_time} min
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.recipesList}
            />
          )}
        </View>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        visible={showAddItemModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddItemModal(false)}
      >
        <AddItemModal 
          isDark={false}
          selectedDate={selectedDate}
          onClose={() => setShowAddItemModal(false)}
          onItemAdded={() => {
            setShowAddItemModal(false);
            loadPlannerItems();
          }}
        />
      </Modal>

      {/* Add Meal Modal */}
      <Modal
        visible={showAddMealModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddMealModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: '#f6f8fa' }]}>
          <View style={[styles.modalHeader, { backgroundColor: '#fff' }]}>
            <Text style={[styles.modalTitle, { color: '#333' }]}>
              Add {selectedMealType}
            </Text>
            <TouchableOpacity onPress={() => setShowAddMealModal(false)}>
              <Ionicons name="close" size={24} color={'#333'} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: '#fff', color: '#333' }]}
              placeholder="Search meals or ingredients..."
              placeholderTextColor={'#666'}
              value={mealSearchQuery}
              onChangeText={setMealSearchQuery}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleMealSearch}
            >
              <Text style={styles.searchButtonText}>🔍 Search</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.searchButton, { backgroundColor: '#34C759' }]}
              onPress={async () => {
                try {
                  setLoading(true);
                  console.log('Loading popular recipes...');
                  
                  // Load popular recipes using Spoonacular API
                  const SPOONACULAR_API_KEY = '75eb74379764490691e81b22b93ebf10';
                  const BASE_URL = 'https://api.spoonacular.com/recipes';
                  
                  const popularUrl = `${BASE_URL}/complexSearch?apiKey=${SPOONACULAR_API_KEY}&number=10&sort=popularity`;
                  const response = await fetch(popularUrl);
                  const data = await response.json();
                  
                  if (data.results && data.results.length > 0) {
                    const recipeIds = data.results.map((recipe: any) => recipe.id).join(',');
                    const detailsUrl = `${BASE_URL}/informationBulk?apiKey=${SPOONACULAR_API_KEY}&ids=${recipeIds}&includeNutrition=true`;
                    const detailsResponse = await fetch(detailsUrl);
                    const detailsData = await detailsResponse.json();
                    
                    const convertedRecipes = detailsData.map((recipe: any) => ({
                      id: recipe.id,
                      name: recipe.title,
                      description: recipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
                      image_url: recipe.image,
                      prep_time: recipe.preparationMinutes || 15,
                      cook_time: recipe.cookingMinutes || 20,
                      servings: recipe.servings || 4,
                      calories: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0,
                      carbs: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0,
                      protein: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0,
                      fat: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0,
                      fiber: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fiber')?.amount || 0,
                      sugar: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Sugar')?.amount || 0,
                      sodium: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Sodium')?.amount || 0,
                      category: 'dinner',
                      difficulty: 'medium',
                      tags: recipe.diets || [],
                      ingredients: recipe.extendedIngredients || [],
                      instructions: recipe.analyzedInstructions?.[0]?.steps || [],
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    }));
                    
                    setRecipes(convertedRecipes);
                  } else {
                    setRecipes([]);
                  }
                } catch (error) {
                  console.error('Error loading popular recipes:', error);
                  Alert.alert('Error', 'Failed to load popular recipes');
                  setRecipes([]);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Text style={styles.searchButtonText}>🔥 Popular</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={[styles.loadingText, { color: '#333' }]}>
                Searching meals...
              </Text>
            </View>
          ) : (
            <FlatList
              data={recipes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.recipeItem, { backgroundColor: '#fff' }]}
                  onPress={() => {
                    // Add the selected recipe to the meal plan
                    handleRecipeSelect(item);
                    setShowAddMealModal(false);
                    setSelectedMealType(null);
                    setMealSearchQuery('');
                  }}
                >
                  <Image 
                    source={{ uri: item.image_url || 'https://placehold.co/80x60/png' }} 
                    style={styles.recipeImage} 
                  />
                  <View style={styles.recipeInfo}>
                    <Text style={[styles.recipeName, { color: '#333' }]}>
                      {item.name}
                    </Text>
                    <View style={styles.recipeDetails}>
                      <Text style={[styles.recipeDetail, { color: '#666' }]}>
                        {item.calories} cal
                      </Text>
                      <Text style={[styles.recipeDetail, { color: '#666' }]}>
                        {item.carbs}g carbs
                      </Text>
                      <Text style={[styles.recipeDetail, { color: '#666' }]}>
                        {item.prep_time} min
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#007AFF" />
                </TouchableOpacity>
              )}
              style={styles.recipesList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: '#666' }]}>
                    Search for meals or ingredients to add to your {selectedMealType}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    padding: 8,
  },
  themeIcon: {
    fontSize: 20,
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  calendarContainer: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dayBox: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 60,
  },
  todayBox: {
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mealsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  mealCard: {
    borderRadius: 16,
    padding: 20,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  mealContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  nutritionInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  nutritionText: {
    fontSize: 14,
  },
  emptyMeal: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  addMealText: {
    fontSize: 16,
    fontWeight: '500',
  },
  snacksContainer: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  snacksList: {
    gap: 12,
  },
  snackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  snackIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  snackInfo: {
    flex: 1,
  },
  snackText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  snackCarbs: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  recipesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recipeDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  recipeDetail: {
    fontSize: 14,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  medicationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  medicationTime: {
    fontSize: 14,
    marginTop: 2,
  },
  medicationCheck: {
    padding: 4,
  },
  plannerSection: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  plannerItemsList: {
    gap: 12,
  },
  plannerItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  plannerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  plannerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plannerItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  plannerItemInfo: {
    flex: 1,
  },
  plannerItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  plannerItemDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  plannerItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plannerItemTime: {
    fontSize: 12,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  plannerItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plannerItemCheck: {
    padding: 4,
  },
  plannerItemDelete: {
    padding: 4,
  },
  selectedBox: {
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionCard: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addPlannerItemButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  addPlannerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  addPlannerItemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlannerItemText: {
    flex: 1,
  },
  addPlannerItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  addPlannerItemSubtitle: {
    fontSize: 14,
  },
});
