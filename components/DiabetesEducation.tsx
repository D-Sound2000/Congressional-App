import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DiabetesEducationProps {
  isDark?: boolean;
}

const { width } = Dimensions.get('window');

const EDUCATION_CATEGORIES = [
  {
    id: 'basics',
    title: 'Diabetes Basics',
    icon: '📚',
    color: '#2196f3',
    articles: [
      {
        title: 'What is Diabetes?',
        content: 'Diabetes is a chronic condition that affects how your body processes glucose (sugar). There are different types of diabetes, each with its own causes and management strategies.',
        readTime: '3 min read'
      },
      {
        title: 'Understanding Blood Sugar',
        content: 'Blood sugar (glucose) is your body\'s main source of energy. Learn how it works and why keeping it balanced is crucial for your health.',
        readTime: '4 min read'
      },
      {
        title: 'Types of Diabetes',
        content: 'Type 1, Type 2, Gestational, and Prediabetes - understand the differences and what each means for your health.',
        readTime: '5 min read'
      }
    ]
  },
  {
    id: 'nutrition',
    title: 'Nutrition & Diet',
    icon: '🍎',
    color: '#4caf50',
    articles: [
      {
        title: 'Carb Counting Made Simple',
        content: 'Learn how to count carbohydrates effectively to manage your blood sugar levels and maintain a healthy diet.',
        readTime: '6 min read'
      },
      {
        title: 'Glycemic Index Guide',
        content: 'Understand how different foods affect your blood sugar and make better food choices for diabetes management.',
        readTime: '5 min read'
      },
      {
        title: 'Meal Planning for Diabetes',
        content: 'Discover strategies for planning balanced meals that help maintain stable blood sugar levels throughout the day.',
        readTime: '7 min read'
      }
    ]
  },
  {
    id: 'monitoring',
    title: 'Blood Sugar Monitoring',
    icon: '📊',
    color: '#ff9800',
    articles: [
      {
        title: 'When to Check Your Blood Sugar',
        content: 'Learn the optimal times to check your blood sugar and how often you should monitor based on your diabetes type.',
        readTime: '4 min read'
      },
      {
        title: 'Understanding Your Readings',
        content: 'Decode your blood sugar readings and understand what different numbers mean for your health.',
        readTime: '5 min read'
      },
      {
        title: 'Continuous Glucose Monitoring',
        content: 'Explore the benefits and usage of continuous glucose monitors (CGMs) for better diabetes management.',
        readTime: '6 min read'
      }
    ]
  },
  {
    id: 'medications',
    title: 'Medications & Insulin',
    icon: '💊',
    color: '#9c27b0',
    articles: [
      {
        title: 'Understanding Insulin',
        content: 'Learn about different types of insulin, how they work, and when to use each type for optimal blood sugar control.',
        readTime: '8 min read'
      },
      {
        title: 'Oral Diabetes Medications',
        content: 'Explore common oral medications for diabetes, how they work, and their potential side effects.',
        readTime: '6 min read'
      },
      {
        title: 'Medication Management Tips',
        content: 'Practical tips for managing your diabetes medications effectively and avoiding common mistakes.',
        readTime: '5 min read'
      }
    ]
  },
  {
    id: 'complications',
    title: 'Preventing Complications',
    icon: '🛡️',
    color: '#f44336',
    articles: [
      {
        title: 'Eye Health and Diabetes',
        content: 'Learn how diabetes affects your eyes and what you can do to prevent diabetic eye complications.',
        readTime: '6 min read'
      },
      {
        title: 'Foot Care Essentials',
        content: 'Proper foot care is crucial for people with diabetes. Learn how to prevent foot problems and complications.',
        readTime: '5 min read'
      },
      {
        title: 'Heart Health and Diabetes',
        content: 'Understand the connection between diabetes and heart disease, and how to protect your cardiovascular health.',
        readTime: '7 min read'
      }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle & Exercise',
    icon: '🏃',
    color: '#00bcd4',
    articles: [
      {
        title: 'Exercise and Blood Sugar',
        content: 'Discover how different types of exercise affect your blood sugar and how to exercise safely with diabetes.',
        readTime: '6 min read'
      },
      {
        title: 'Stress Management',
        content: 'Learn how stress affects diabetes and discover effective stress management techniques for better blood sugar control.',
        readTime: '5 min read'
      },
      {
        title: 'Sleep and Diabetes',
        content: 'Understand the important relationship between sleep quality and diabetes management.',
        readTime: '4 min read'
      }
    ]
  }
];

const TIPS = [
  {
    category: 'Daily Tip',
    tip: 'Always carry fast-acting carbohydrates like glucose tablets for low blood sugar emergencies.',
    icon: '💡'
  },
  {
    category: 'Nutrition Tip',
    tip: 'Pair carbohydrates with protein and healthy fats to slow down glucose absorption.',
    icon: '🥗'
  },
  {
    category: 'Exercise Tip',
    tip: 'Check your blood sugar before, during, and after exercise to understand how activity affects you.',
    icon: '🏃'
  },
  {
    category: 'Monitoring Tip',
    tip: 'Keep a detailed log of your blood sugar readings, meals, and activities to identify patterns.',
    icon: '📝'
  }
];

export default function DiabetesEducation({ isDark = false }: DiabetesEducationProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const renderCategory = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        { backgroundColor: isDark ? '#2d3a4d' : '#fff' }
      ]}
      onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
    >
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
          <Text style={styles.categoryIconText}>{category.icon}</Text>
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryTitle, { color: isDark ? '#fff' : '#333' }]}>
            {category.title}
          </Text>
          <Text style={[styles.categoryCount, { color: isDark ? '#ccc' : '#666' }]}>
            {category.articles.length} articles
          </Text>
        </View>
        <Ionicons 
          name={selectedCategory === category.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={isDark ? '#fff' : '#333'} 
        />
      </View>
      
      {selectedCategory === category.id && (
        <View style={styles.articlesList}>
          {category.articles.map((article: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.articleCard,
                { backgroundColor: isDark ? '#1e2a3a' : '#f8f9fa' }
              ]}
              onPress={() => setSelectedArticle(article)}
            >
              <Text style={[styles.articleTitle, { color: isDark ? '#fff' : '#333' }]}>
                {article.title}
              </Text>
              <Text style={[styles.articleContent, { color: isDark ? '#ccc' : '#666' }]}>
                {article.content}
              </Text>
              <Text style={[styles.readTime, { color: isDark ? '#999' : '#999' }]}>
                {article.readTime}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderArticleModal = () => (
    <View style={styles.articleModal}>
      <View style={[styles.articleHeader, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setSelectedArticle(null)}
        >
          <Ionicons name="close" size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.articleModalTitle, { color: isDark ? '#fff' : '#333' }]}>
          {selectedArticle?.title}
        </Text>
      </View>
      
      <ScrollView style={styles.articleContent}>
        <Text style={[styles.articleText, { color: isDark ? '#fff' : '#333' }]}>
          {selectedArticle?.content}
        </Text>
        
        {/* Additional content would go here */}
        <View style={[styles.articleFooter, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
          <Text style={[styles.articleFooterText, { color: isDark ? '#ccc' : '#666' }]}>
            This article is for educational purposes only and should not replace professional medical advice. 
            Always consult with your healthcare provider for personalized guidance.
          </Text>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#181a20' : '#f6f8fa' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#333' }]}>
          Diabetes Education
        </Text>
        <Text style={[styles.headerSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
          Learn how to manage your diabetes effectively
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Tips */}
        <View style={[styles.tipsSection, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
            Daily Tips
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tipsContainer}>
              {TIPS.map((tip, index) => (
                <View key={index} style={[styles.tipCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
                  <Text style={styles.tipIcon}>{tip.icon}</Text>
                  <Text style={[styles.tipCategory, { color: isDark ? '#ccc' : '#666' }]}>
                    {tip.category}
                  </Text>
                  <Text style={[styles.tipText, { color: isDark ? '#fff' : '#333' }]}>
                    {tip.tip}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Education Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
            Learning Topics
          </Text>
          {EDUCATION_CATEGORIES.map(renderCategory)}
        </View>

        {/* Quick Resources */}
        <View style={[styles.resourcesSection, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
            Quick Resources
          </Text>
          
          <View style={styles.resourcesGrid}>
            <TouchableOpacity style={[styles.resourceCard, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="calculator" size={24} color="#1976d2" />
              <Text style={styles.resourceText}>Carb Calculator</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.resourceCard, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="restaurant" size={24} color="#4caf50" />
              <Text style={styles.resourceText}>Food Database</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.resourceCard, { backgroundColor: '#fff3e0' }]}>
              <Ionicons name="fitness" size={24} color="#ff9800" />
              <Text style={styles.resourceText}>Exercise Guide</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.resourceCard, { backgroundColor: '#fce4ec' }]}>
              <Ionicons name="call" size={24} color="#e91e63" />
              <Text style={styles.resourceText}>Emergency Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Article Modal */}
      {selectedArticle && renderArticleModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tipsSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tipsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tipCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
  },
  tipIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  tipCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoryCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
  },
  articlesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  articleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  articleContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  readTime: {
    fontSize: 12,
  },
  articleModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  closeButton: {
    marginRight: 16,
  },
  articleModalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  articleContent: {
    flex: 1,
    padding: 20,
  },
  articleText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  articleFooter: {
    padding: 16,
    borderRadius: 12,
  },
  articleFooterText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  resourcesSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resourceCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  resourceText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});
