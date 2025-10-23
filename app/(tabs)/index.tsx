import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BloodSugarSnapshot from '@/components/BloodSugarSnapshot';
import BloodSugarLogger from '@/components/BloodSugarLogger';
import GlucoseInsights from '@/components/GlucoseInsights';
import DiabetesEmergency from '@/components/DiabetesEmergency';
import DiabetesEducation from '@/components/DiabetesEducation';
import MedicationReminder from '@/components/MedicationReminder';
import QuickActionButton from '@/components/QuickActionButton';
import RecipeCard from '@/components/RecipeCard';
import ReminderCard from '@/components/ReminderCard';
import FloatingEmergencyButton from '@/components/FloatingEmergencyButton';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { getGlucoseLogs, GlucoseLog } from '@/lib/mealPlannerService';
import { getPlannerItems, formatTime, getTypeIcon } from '@/lib/plannerService';
import { getSmartRecommendations, SmartRecipe } from '@/lib/smartRecommendationsService';

const bloodSugarData = [
  { value: 110, color: '#388e3c' },
  { value: 98, color: '#388e3c' },
  { value: 120, color: '#e65100' },
  { value: 90, color: '#fbc02d' },
  { value: 105, color: '#388e3c' },
  { value: 112, color: '#388e3c' },
  { value: 108, color: '#388e3c' },
];

const fallbackReminders = [
  { icon: '💊', text: 'Take Metformin', time: '6:00 PM' },
  { icon: '🍽️', text: 'Eat a light dinner', time: 'before 8:00 PM' },
  { icon: '💧', text: 'Drink water', time: '7:00 PM' },
];

// Helper to get greeting
function getGreeting(username: string) {
  const hour = new Date().getHours();
  const name = username || 'there';
  if (hour < 12) return `Good morning, ${name} `;
  if (hour < 17) return `Good afternoon, ${name} `;
  return `Good evening, ${name}`;
}

// Helper to get glucose color based on value
function getGlucoseColor(value: number) {
  if (value < 70) return '#f44336'; // Low - Red
  if (value < 140) return '#4caf50'; // Normal - Green
  if (value < 200) return '#ff9800'; // High - Orange
  return '#f44336'; // Very High - Red
}

export default function Index() {
  // Typing animation state for greeting
  const [typedGreeting, setTypedGreeting] = useState('');
  
  // State for planner reminders
  const [plannerReminders, setPlannerReminders] = useState<any[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [smartRecipes, setSmartRecipes] = useState<SmartRecipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<number[]>([]);
  const [showBloodSugarLogger, setShowBloodSugarLogger] = useState(false);
  const [recentGlucoseLogs, setRecentGlucoseLogs] = useState<GlucoseLog[]>([]);
  const [latestGlucose, setLatestGlucose] = useState<GlucoseLog | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showEducation, setShowEducation] = useState(false);

  const colors = {
    background: '#f6f8fa',
    card: '#fff',
    cardBorder: '#e0e0e0',
    text: '#222',
    title: '#1976d2',
    greeting: '#333',
    sectionTitle: '#222',
    seeMore: '#1976d2',
    shadow: '#000',
    quickAction: '#e3f2fd',
    quickAction2: '#fce4ec',
    quickAction3: '#e8f5e9',
  };
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();
          
          if (data && data.username) {
            setUsername(data.username);
          }

          try {
            const glucoseLogs = await getGlucoseLogs(5);
            setRecentGlucoseLogs(glucoseLogs);
            if (glucoseLogs.length > 0) {
              setLatestGlucose(glucoseLogs[0]);
            }
          } catch (glucoseError) {
            console.error('Error loading glucose logs:', glucoseError);
          }

          try {
            const today = new Date().toISOString().split('T')[0];
            const items = await getPlannerItems(today);
            
            const reminders = items
              .filter(item => !item.completed)
              .slice(0, 5)
              .map(item => ({
                icon: getTypeIcon(item.item_type),
                text: item.title,
                time: item.scheduled_time ? formatTime(item.scheduled_time) : undefined,
                id: item.id,
                item_type: item.item_type,
                priority: item.priority,
              }));
            
            setPlannerReminders(reminders);
          } catch (reminderError) {
            console.error('Error loading planner reminders:', reminderError);
            setPlannerReminders(fallbackReminders);
          }
          
          loadSmartRecipes();
          loadFavorites();
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const loadSmartRecipes = async () => {
    try {
      setLoadingRecipes(true);
      const recommendations = await getSmartRecommendations(3);
      setSmartRecipes(recommendations);
    } catch (recipeError) {
      console.error('Error loading smart recommendations:', recipeError);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorite_recipes')
        .select('recipe_id, recipe_data')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error loading favorites:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const ids = data.map(item => item.recipe_id || item.recipe_data?.id).filter(id => id != null);
        setFavoriteRecipeIds(ids);
      } else {
        setFavoriteRecipeIds([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (recipe: SmartRecipe) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign In Required', 'Please sign in to save favorites');
        return;
      }

      const isFavorite = favoriteRecipeIds.includes(recipe.id);

      if (isFavorite) {
        const newIds = favoriteRecipeIds.filter(id => id !== recipe.id);
        setFavoriteRecipeIds(newIds);
        
        const { error } = await supabase
          .from('favorite_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.id);

        if (error) {
          console.error('Database error removing favorite:', error);
          setFavoriteRecipeIds(prev => [...prev, recipe.id]);
          Alert.alert('Error', 'Failed to remove favorite: ' + error.message);
        }
      } else {
        const newIds = [...favoriteRecipeIds, recipe.id];
        setFavoriteRecipeIds(newIds);
        
        const recipeData = {
          user_id: user.id,
          recipe_id: recipe.id,
          recipe_data: {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            sugar: recipe.sugar,
            calories: recipe.calories,
            carbs: parseFloat(recipe.carbs.replace('g carbs', '') || '0'),
            protein: recipe.protein,
            fat: recipe.protein,
            servings: 4,
          },
        };
        
        const { error } = await supabase
          .from('favorite_recipes')
          .insert(recipeData)
          .select();

        if (error) {
          console.error('Database error adding favorite:', error);
          setFavoriteRecipeIds(prev => prev.filter(id => id !== recipe.id));
          
          if (error.message.includes('duplicate') || error.code === '23505') {
            setFavoriteRecipeIds(prev => [...prev, recipe.id]);
          } else {
            Alert.alert('Error', 'Failed to save favorite: ' + error.message);
          }
        }
      }
    } catch (error: any) {
      console.error('Exception in toggleFavorite:', error);
      Alert.alert('Error', 'Failed to save favorite: ' + (error?.message || 'Unknown error'));
    }
  };

  const refreshGlucoseData = async () => {
    try {
      const glucoseLogs = await getGlucoseLogs(5);
      setRecentGlucoseLogs([...glucoseLogs]);
      
      if (glucoseLogs.length > 0) {
        const latest = { ...glucoseLogs[0] };
        setLatestGlucose(latest);
      } else {
        setLatestGlucose(null);
      }

      const today = new Date().toISOString().split('T')[0];
      const items = await getPlannerItems(today);
      
      const reminders = items
        .filter(item => !item.completed)
        .slice(0, 5)
        .map(item => ({
          icon: getTypeIcon(item.item_type),
          text: item.title,
          time: item.scheduled_time ? formatTime(item.scheduled_time) : undefined,
          id: item.id,
          item_type: item.item_type,
          priority: item.priority,
        }));
      
      setPlannerReminders(reminders);
    } catch (error) {
      console.error('Error refreshing glucose logs:', error);
    }
  };

  const handleGlucoseLogged = async (log: GlucoseLog) => {
    setLatestGlucose({ ...log });
    
    setRecentGlucoseLogs(prevLogs => {
      const newLogs = [{ ...log }, ...prevLogs];
      return newLogs;
    });
    
    setTimeout(async () => {
      await refreshGlucoseData();
    }, 500);
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshGlucoseData();
    }, [])
  );

  const handleBloodSugarLoggerClose = () => {
    setShowBloodSugarLogger(false);
    setTimeout(() => {
      refreshGlucoseData();
    }, 200);
  };


  useEffect(() => {
    const greeting = getGreeting(username);
    setTypedGreeting('');
    let i = 0;
    const interval = setInterval(() => {
      setTypedGreeting(greeting.slice(0, i + 1));
      i++;
      if (i === greeting.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [username]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.greetingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}> 
        <Text style={[styles.appTitle, { color: colors.title }]}>DiaBite</Text>
        <Text style={[styles.greetingText, { color: colors.greeting }]}>{typedGreeting}</Text>
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.logoutButton, { backgroundColor: '#f44336' }]}
            onPress={() => supabase.auth.signOut()}
            accessibilityLabel="Sign out"
          >
            <Text style={[styles.logoutText, { color: '#fff' }]}>
              🚪 Sign Out
            </Text>
          </Pressable>
        </View>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}> 
          <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Blood Sugar Snapshot</Text>
            <TouchableOpacity onPress={refreshGlucoseData} style={styles.refreshButton}>
              <Text style={[styles.refreshButtonText, { color: colors.seeMore }]}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>
          <BloodSugarSnapshot
            key={`glucose-${latestGlucose?.id || 'none'}-${recentGlucoseLogs.length}-${recentGlucoseLogs.map(log => log.id).join(',')}`}
            glucose={latestGlucose?.glucose_value || 110}
            time={latestGlucose ? new Date(latestGlucose.measurement_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "8:00 AM"}
            context={latestGlucose?.context || "Fasting"}
            data={recentGlucoseLogs.length > 0 ? recentGlucoseLogs.map(log => ({ value: log.glucose_value, color: getGlucoseColor(log.glucose_value) })) : bloodSugarData}
          />
        </View>

        <GlucoseInsights isDark={false} />
        <MedicationReminder isDark={false} />
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}> 
          <View style={styles.quickActionsRow}>
            <QuickActionButton
              icon="add-circle-outline"
              label="Log Sugar"
              backgroundColor={colors.quickAction}
              textColor={colors.text}
              onPress={() => setShowBloodSugarLogger(true)}
              style={styles.quickActionBtn}
            />
            <QuickActionButton
              icon="calendar-outline"
              label="Planner"
              backgroundColor={colors.quickAction2}
              textColor={colors.text}
              onPress={() => router.push('/(tabs)/planner')}
              style={styles.quickActionBtn}
            />
          </View>
          
          <View style={styles.diabetesActionsRow}>
            <QuickActionButton
              icon="medical-outline"
              label="Emergency"
              backgroundColor="#f44336"
              textColor="#fff"
              onPress={() => setShowEmergency(true)}
              style={styles.diabetesActionBtn}
            />
            <QuickActionButton
              icon="book-outline"
              label="Education"
              backgroundColor="#2196f3"
              textColor="#fff"
              onPress={() => setShowEducation(true)}
              style={styles.diabetesActionBtn}
            />
            <QuickActionButton
              icon="pulse-outline"
              label="Insights"
              backgroundColor="#4caf50"
              textColor="#fff"
              onPress={() => router.push('/insights')}
              style={styles.diabetesActionBtn}
            />
          </View>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <TouchableOpacity
            style={styles.recipeFinderButton}
            onPress={() => router.push('/(tabs)/recipe-finder')}
          >
            <Text style={[styles.recipeFinderText, { color: colors.text }]}>
              🍽️ Recipe Finder
            </Text>
            <Text style={[styles.recipeFinderSubtext, { color: colors.text }]}>
              Find diabetes-friendly recipes by sugar content
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>
              Today's Smart Picks
            </Text>
            <TouchableOpacity 
              onPress={loadSmartRecipes}
              disabled={loadingRecipes}
              style={{ padding: 4 }}
            >
              <Text style={{ fontSize: 20 }}>{loadingRecipes ? '🔄' : '🔃'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/recipe-finder')}>
            <Text style={[styles.seeMore, { color: colors.seeMore }]}>➡️ See More</Text>
          </TouchableOpacity>
        </View>
        {loadingRecipes ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <Text style={[styles.loadingText, { color: '#666' }]}>
              Loading personalized recommendations...
            </Text>
          </View>
        ) : smartRecipes.length > 0 ? (
          <FlatList
            data={smartRecipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <RecipeCard
                image={{ uri: item.image }}
                title={item.title}
                time={item.time}
                carbs={item.carbs}
                badge={item.badge}
                onPress={() => {
                  router.push({
                    pathname: '/(tabs)/recipe-finder',
                    params: { recipeId: item.id.toString() }
                  });
                }}
                dark={false}
                showFavoriteButton={false}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            style={{ marginBottom: 16 }}
          />
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginVertical: 20 }}>
            <Text style={[styles.emptyText, { color: '#666' }]}>
              No recommendations available. Try the Recipe Finder!
            </Text>
          </View>
        )}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}> 
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Today's Reminders</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/planner')}>
              <Text style={[styles.seeMore, { color: colors.seeMore }]}>📋 Planner</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.remindersList}>
            {loadingReminders ? (
              <Text style={[styles.loadingText, { color: '#666' }]}>Loading reminders...</Text>
            ) : plannerReminders.length > 0 ? (
              plannerReminders.map((reminder, idx) => (
                <ReminderCard
                  key={reminder.id || idx}
                  icon={reminder.icon}
                  text={reminder.text}
                  time={reminder.time}
                  onPress={() => router.push('/(tabs)/planner')}
                  dark={false}
                />
              ))
            ) : (
              <Text style={[styles.emptyText, { color: '#666' }]}>
                No reminders for today. Add items in the planner!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      <FloatingEmergencyButton onPress={() => setShowEmergency(true)} />
      
      <BloodSugarLogger
        visible={showBloodSugarLogger}
        onClose={handleBloodSugarLoggerClose}
        onLogSuccess={handleGlucoseLogged}
        isDark={false}
      />
      
      {showEmergency && (
        <View style={styles.modalOverlay}>
          <DiabetesEmergency 
            isDark={false}
          />
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowEmergency(false)}
          >
            <Text style={styles.closeModalText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {showEducation && (
        <View style={styles.modalOverlay}>
          <DiabetesEducation 
            isDark={false}
          />
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowEducation(false)}
          >
            <Text style={styles.closeModalText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greetingCard: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    elevation: 4,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  themeToggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    elevation: 2,
  },
  themeToggleText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    elevation: 2,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'System',
    marginBottom: 0,
    textAlign: 'center',
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    minHeight: 28,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  sectionCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
    elevation: 3,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'System',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  quickActionBtn: {
    flex: 1,
    marginHorizontal: 2,
    minWidth: 90,
    maxWidth: 110,
  },
  diabetesActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  diabetesActionBtn: {
    flex: 1,
    marginHorizontal: 2,
    minWidth: 80,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
  },
  closeModalButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1001,
  },
  closeModalText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  seeMore: {
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  remindersList: {
    marginHorizontal: 4,
    marginBottom: 8,
  },
  recipeFinderButton: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  recipeFinderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeFinderSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
});


