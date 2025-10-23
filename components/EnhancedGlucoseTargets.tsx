import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getGlucoseTargets, 
  getGlucoseTargetRanges, 
  analyzeGlucoseLevel, 
  getGlucoseTrend,
  GlucoseStatus 
} from '@/lib/glucoseTargetService';
import { getUserProfile, UserProfile } from '@/lib/userProfileService';

interface EnhancedGlucoseTargetsProps {
  isDark?: boolean;
  currentGlucose?: number;
  context?: 'fasting' | 'beforeMeal' | 'afterMeal' | 'bedtime';
}

export default function EnhancedGlucoseTargets({ 
  isDark = false, 
  currentGlucose,
  context = 'fasting'
}: EnhancedGlucoseTargetsProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<any>(null);
  const [glucoseStatus, setGlucoseStatus] = useState<GlucoseStatus | null>(null);

  useEffect(() => {
    loadData();
  }, [currentGlucose, context]);

  const loadData = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
      
      if (profile?.diabetes_type) {
        const trendData = await getGlucoseTrend(profile.diabetes_type);
        setTrend(trendData);
        
        if (currentGlucose) {
          const status = analyzeGlucoseLevel(currentGlucose, profile.diabetes_type, context);
          setGlucoseStatus(status);
        }
      }
    } catch (error) {
      console.error('Error loading glucose data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'fasting': return '🌅';
      case 'beforeMeal': return '🍽️';
      case 'afterMeal': return '⏰';
      case 'bedtime': return '🌙';
      default: return '📊';
    }
  };

  const getTrendIcon = (trendType: string) => {
    switch (trendType) {
      case 'improving': return '📈';
      case 'worsening': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#333'} />
        <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#333' }]}>
          Loading glucose insights...
        </Text>
      </View>
    );
  }

  if (!userProfile?.diabetes_type) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
        <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#333' }]}>
          Complete Your Profile
        </Text>
        <Text style={[styles.emptyText, { color: isDark ? '#ccc' : '#666' }]}>
          Set up your diabetes type to get personalized glucose targets
        </Text>
      </View>
    );
  }

  const targets = getGlucoseTargets(userProfile.diabetes_type);
  const ranges = getGlucoseTargetRanges(userProfile.diabetes_type);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#333' }]}>
          Your Glucose Targets
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#666' }]}>
          Based on {userProfile.diabetes_type.replace('_', ' ')} diabetes
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Glucose Status */}
        {currentGlucose && glucoseStatus && (
          <View style={[styles.statusCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
            <View style={styles.statusHeader}>
              <Text style={[styles.statusTitle, { color: isDark ? '#fff' : '#333' }]}>
                Current Reading
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: glucoseStatus.color }]}>
                <Text style={styles.statusBadgeText}>
                  {currentGlucose} mg/dL
                </Text>
              </View>
            </View>
            <Text style={[styles.statusMessage, { color: glucoseStatus.color }]}>
              {glucoseStatus.message}
            </Text>
            <Text style={[styles.recommendation, { color: isDark ? '#ccc' : '#666' }]}>
              {glucoseStatus.recommendation}
            </Text>
          </View>
        )}

        {/* Glucose Targets Grid */}
        <View style={styles.targetsGrid}>
          {Object.entries(targets).map(([key, value]) => (
            <View key={key} style={[styles.targetCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
              <Text style={styles.targetIcon}>{getTargetIcon(key)}</Text>
              <Text style={[styles.targetLabel, { color: isDark ? '#fff' : '#333' }]}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Text>
              <Text style={[styles.targetValue, { color: '#4caf50' }]}>
                {value}
              </Text>
              {ranges[key as keyof typeof ranges] && (
                <Text style={[styles.targetRange, { color: isDark ? '#ccc' : '#666' }]}>
                  Range: {ranges[key as keyof typeof ranges].min}-{ranges[key as keyof typeof ranges].max} mg/dL
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Trend Analysis */}
        {trend && (
          <View style={[styles.trendCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
            <Text style={[styles.trendTitle, { color: isDark ? '#fff' : '#333' }]}>
              7-Day Analysis
            </Text>
            <View style={styles.trendRow}>
              <Text style={[styles.trendLabel, { color: isDark ? '#ccc' : '#666' }]}>
                Average:
              </Text>
              <Text style={[styles.trendValue, { color: isDark ? '#fff' : '#333' }]}>
                {trend.average} mg/dL
              </Text>
            </View>
            <View style={styles.trendRow}>
              <Text style={[styles.trendLabel, { color: isDark ? '#ccc' : '#666' }]}>
                Trend:
              </Text>
              <View style={styles.trendBadge}>
                <Text style={styles.trendIcon}>{getTrendIcon(trend.trend)}</Text>
                <Text style={[styles.trendText, { color: isDark ? '#fff' : '#333' }]}>
                  {trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
                </Text>
              </View>
            </View>
            {trend.recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={[styles.recommendationsTitle, { color: isDark ? '#fff' : '#333' }]}>
                  Recommendations:
                </Text>
                {trend.recommendations.map((rec: string, index: number) => (
                  <Text key={index} style={[styles.recommendation, { color: isDark ? '#ccc' : '#666' }]}>
                    • {rec}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    margin: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendation: {
    fontSize: 14,
    lineHeight: 20,
  },
  targetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  targetCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  targetIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  targetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  targetRange: {
    fontSize: 12,
    textAlign: 'center',
  },
  trendCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 16,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  trendText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationsContainer: {
    marginTop: 12,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
