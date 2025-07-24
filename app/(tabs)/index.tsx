import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Pressable } from 'react-native';
import BloodSugarSnapshot from '@/components/BloodSugarSnapshot';
import QuickActionButton from '@/components/QuickActionButton';
import RecipeCard from '@/components/RecipeCard';
import ReminderCard from '@/components/ReminderCard';
import FloatingEmergencyButton from '@/components/FloatingEmergencyButton';

// Mock data for the blood sugar snapshot graph
const bloodSugarData = [
  { value: 110, color: '#388e3c' }, // healthy
  { value: 98, color: '#388e3c' }, // healthy
  { value: 120, color: '#e65100' }, // high
  { value: 90, color: '#fbc02d' }, // low
  { value: 105, color: '#388e3c' }, // healthy
  { value: 112, color: '#388e3c' }, // healthy
  { value: 108, color: '#388e3c' }, // healthy
];

// Placeholder image for recipes
const placeholderImage = { uri: 'https://placehold.co/120x80/png' };
const recipes = [
  {
    image: placeholderImage,
    title: 'Avocado Toast',
    time: '10 min',
    carbs: '15g carbs',
    badge: { label: 'Low-Carb', color: '#43a047' },
  },
  {
    image: placeholderImage,
    title: 'Grilled Chicken Salad',
    time: '20 min',
    carbs: '18g carbs',
    badge: { label: 'Low-Carb', color: '#43a047' },
  },
  {
    image: placeholderImage,
    title: 'Berry Yogurt Bowl',
    time: '8 min',
    carbs: '22g carbs',
    badge: { label: 'Medium', color: '#fbc02d' },
  },
  {
    image: placeholderImage,
    title: 'Quinoa Veggie Mix',
    time: '15 min',
    carbs: '30g carbs',
    badge: { label: 'High', color: '#e65100' },
  },
];

// Mock data for reminders
const reminders = [
  { icon: '💊', text: 'Take Metformin', time: '6:00 PM' },
  { icon: '🍽️', text: 'Eat a light dinner', time: 'before 8:00 PM' },
  { icon: '💧', text: 'Drink water', time: '7:00 PM' },
];

// Helper to get greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning, Om 👋';
  if (hour < 17) return 'Good afternoon, Om 👋';
  return 'Good evening, Om 👋';
}

export default function Index() {
  // Typing animation state for greeting
  const [typedGreeting, setTypedGreeting] = useState('');
  const greeting = getGreeting();

  // Theme state
  const [theme, setTheme] = useState('light');
  const isDark = theme === 'dark';

  useEffect(() => {
    setTypedGreeting('');
    let i = 0;
    const interval = setInterval(() => {
      setTypedGreeting(greeting.slice(0, i + 1));
      i++;
      if (i === greeting.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [greeting]);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#181a20' : '#f6f8fa' }]}> 
      {/* Combined App Title and Greeting Card with Theme Toggle */}
      <View style={[styles.greetingCard, { backgroundColor: isDark ? '#232b3a' : '#fff', borderColor: isDark ? '#353945' : '#e0e0e0' }]}> 
        <Text style={[styles.appTitle, { color: isDark ? '#90caf9' : '#1976d2' }]}>DiaBite</Text>
        <Text style={[styles.greetingText, { color: isDark ? '#fff' : '#333' }]}>{typedGreeting}</Text>
        <Pressable
          style={[styles.themeToggleButton, { backgroundColor: isDark ? '#2d3a4d' : '#f0f0f0' }]}
          onPress={() => setTheme(isDark ? 'light' : 'dark')}
          accessibilityLabel="Toggle dark/light mode"
        >
          <Text style={[styles.themeToggleText, { color: isDark ? '#fff' : '#333' }]}>
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </Text>
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Blood Sugar Snapshot Section */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#232b3a' : '#fff', borderColor: isDark ? '#353945' : '#e0e0e0' }]}> 
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#222' }]}>Blood Sugar Snapshot</Text>
          <BloodSugarSnapshot
            glucose={110}
            time="8:00 AM"
            context="Fasting"
            data={bloodSugarData}
          />
        </View>
        {/* Quick Action Buttons */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}> 
          <View style={styles.quickActionsRow}>
            <QuickActionButton
              icon="add-circle-outline"
              label="Log Sugar"
              backgroundColor={isDark ? '#2d3a4d' : '#e3f2fd'}
              textColor={isDark ? '#fff' : '#333'}
              onPress={() => alert('Log Sugar')}
              style={styles.quickActionBtn}
            />
            <QuickActionButton
              icon="calendar-outline"
              label="Planner"
              backgroundColor={isDark ? '#2d3a4d' : '#fce4ec'}
              textColor={isDark ? '#fff' : '#333'}
              onPress={() => alert('Planner')}
              style={styles.quickActionBtn}
            />
            <QuickActionButton
              icon="camera-outline"
              label="Scan Food"
              backgroundColor={isDark ? '#2d3a4d' : '#e8f5e9'}
              textColor={isDark ? '#fff' : '#333'}
              onPress={() => alert('Scan Food')}
              style={styles.quickActionBtn}
            />
          </View>
        </View>
        {/* Today's Smart Picks (Recipe Cards) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#222' }]}>Today's Smart Picks</Text>
          <TouchableOpacity onPress={() => alert('See More Recipes')}>
            <Text style={[styles.seeMore, { color: isDark ? '#90caf9' : '#1976d2' }]}>➡️ See More Recipes</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={recipes}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <RecipeCard
              image={item.image}
              title={item.title}
              time={item.time}
              carbs={item.carbs}
              badge={item.badge}
              onPress={() => alert(item.title)}
              dark={isDark}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
          style={{ marginBottom: 16 }}
        />
        {/* Reminders Section */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#232b3a' : '#fff', borderColor: isDark ? '#353945' : '#e0e0e0' }]}> 
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#222' }]}>Reminders</Text>
          <View style={styles.remindersList}>
            {reminders.map((reminder, idx) => (
              <ReminderCard
                key={idx}
                icon={reminder.icon}
                text={reminder.text}
                time={reminder.time}
                onPress={() => alert('Edit reminder')}
                dark={isDark}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      {/* Floating Emergency Button */}
      <FloatingEmergencyButton onPress={() => alert('Emergency Info')} />
    </View>
  );
}

// Styles for the home screen layout
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
  },
  themeToggleButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeToggleText: {
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
    shadowOpacity: 0.08,
    shadowRadius: 6,
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
  remindersList: {
    marginHorizontal: 4,
    marginBottom: 8,
  },
});


