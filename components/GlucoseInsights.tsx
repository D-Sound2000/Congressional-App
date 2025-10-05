import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getGlucoseLogs, GlucoseLog } from '@/lib/mealPlannerService';

interface GlucoseInsightsProps {
  isDark?: boolean;
}

const { width } = Dimensions.get('window');

export default function GlucoseInsights({ isDark = false }: GlucoseInsightsProps) {
  const [glucoseLogs, setGlucoseLogs] = useState<GlucoseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    loadGlucoseData();
  }, [timeRange]);

  const loadGlucoseData = async () => {
    try {
      setLoading(true);
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      const logs = await getGlucoseLogs(days);
      setGlucoseLogs(logs);
    } catch (error) {
      console.error('Error loading glucose data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGlucoseStats = () => {
    if (glucoseLogs.length === 0) return null;

    const values = glucoseLogs.map(log => log.glucose_value);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate time in range (70-140 mg/dL)
    const inRange = values.filter(val => val >= 70 && val <= 140).length;
    const timeInRange = (inRange / values.length) * 100;

    return { avg: Math.round(avg), min, max, timeInRange: Math.round(timeInRange) };
  };

  const getGlucoseTrend = () => {
    if (glucoseLogs.length < 2) return 'stable';
    
    const recent = glucoseLogs.slice(0, 3).map(log => log.glucose_value);
    const older = glucoseLogs.slice(-3).map(log => log.glucose_value);
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 10) return 'rising';
    if (diff < -10) return 'falling';
    return 'stable';
  };

  const getRecommendations = () => {
    const stats = getGlucoseStats();
    if (!stats) return [];

    const recommendations = [];

    if (stats.avg > 140) {
      recommendations.push({
        icon: '🍽️',
        text: 'Consider lower-carb meals',
        priority: 'high'
      });
      recommendations.push({
        icon: '🏃',
        text: 'Light exercise after meals',
        priority: 'medium'
      });
    }

    if (stats.avg < 80) {
      recommendations.push({
        icon: '🍎',
        text: 'Add healthy snacks between meals',
        priority: 'high'
      });
    }

    if (stats.timeInRange < 70) {
      recommendations.push({
        icon: '📊',
        text: 'Monitor glucose more frequently',
        priority: 'high'
      });
    }

    const trend = getGlucoseTrend();
    if (trend === 'rising') {
      recommendations.push({
        icon: '⚠️',
        text: 'Glucose trending upward - check with doctor',
        priority: 'high'
      });
    }

    return recommendations.slice(0, 3); // Show top 3 recommendations
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === '24h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getGlucoseColor = (value: number) => {
    if (value < 70) return '#f44336';
    if (value < 140) return '#4caf50';
    if (value < 200) return '#ff9800';
    return '#f44336';
  };

  const stats = getGlucoseStats();
  const recommendations = getRecommendations();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
        <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#333' }]}>
          Loading glucose insights...
        </Text>
      </View>
    );
  }

  if (glucoseLogs.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
        <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#333' }]}>
          No glucose readings yet
        </Text>
        <Text style={[styles.emptySubtext, { color: isDark ? '#ccc' : '#666' }]}>
          Log your first reading to see insights
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#333' }]}>
          Glucose Insights
        </Text>
        <View style={styles.timeRangeSelector}>
          {(['24h', '7d', '30d'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
                { backgroundColor: timeRange === range ? '#007AFF' : isDark ? '#2d3a4d' : '#f8f9fa' }
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[
                styles.timeRangeText,
                { color: timeRange === range ? '#fff' : isDark ? '#fff' : '#333' }
              ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
            <Text style={[styles.statValue, { color: getGlucoseColor(stats.avg) }]}>
              {stats.avg}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#ccc' : '#666' }]}>
              Average (mg/dL)
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
            <Text style={[styles.statValue, { color: isDark ? '#fff' : '#333' }]}>
              {stats.timeInRange}%
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#ccc' : '#666' }]}>
              Time in Range
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
            <Text style={[styles.statValue, { color: isDark ? '#fff' : '#333' }]}>
              {stats.min}-{stats.max}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#ccc' : '#666' }]}>
              Range (mg/dL)
            </Text>
          </View>
        </View>
      )}

      {/* Recent Readings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
          Recent Readings
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.readingsContainer}>
            {glucoseLogs.slice(0, 10).map((log, index) => (
              <View key={log.id} style={styles.readingItem}>
                <View style={[
                  styles.readingValue,
                  { backgroundColor: getGlucoseColor(log.glucose_value) }
                ]}>
                  <Text style={styles.readingNumber}>{log.glucose_value}</Text>
                </View>
                <Text style={[styles.readingTime, { color: isDark ? '#ccc' : '#666' }]}>
                  {formatTime(log.measurement_time)}
                </Text>
                <Text style={[styles.readingContext, { color: isDark ? '#fff' : '#333' }]}>
                  {log.context || 'Random'}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
            Recommendations
          </Text>
          {recommendations.map((rec, index) => (
            <View key={index} style={[
              styles.recommendationItem,
              { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }
            ]}>
              <Text style={styles.recommendationIcon}>{rec.icon}</Text>
              <Text style={[styles.recommendationText, { color: isDark ? '#fff' : '#333' }]}>
                {rec.text}
              </Text>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: rec.priority === 'high' ? '#f44336' : '#ff9800' }
              ]}>
                <Text style={styles.priorityText}>
                  {rec.priority === 'high' ? 'High' : 'Medium'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeRangeButtonActive: {
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  readingsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  readingItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  readingValue: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  readingNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  readingTime: {
    fontSize: 10,
    marginBottom: 2,
  },
  readingContext: {
    fontSize: 10,
    textAlign: 'center',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
  },
});
