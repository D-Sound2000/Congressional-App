import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getGlucoseLogs, GlucoseLog } from '@/lib/mealPlannerService';
import Svg, { Line, Circle, Text as SvgText, G, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 80;
const GRAPH_HEIGHT = 200;

const GlucoseGraph = ({ data, timeRange }: { data: GlucoseLog[], timeRange: '24h' | '7d' | '30d' }) => {
  if (data.length === 0) return null;

  const sortedData = [...data].sort((a, b) => 
    new Date(a.measurement_time).getTime() - new Date(b.measurement_time).getTime()
  );

  const targetMin = 70;
  const targetMax = 140;
  const highThreshold = 200;
  const lowThreshold = 60;

  const values = sortedData.map(log => log.glucose_value);
  const minValue = Math.min(...values, lowThreshold) - 10;
  const maxValue = Math.max(...values, highThreshold) + 10;
  const valueRange = maxValue - minValue;
  const points = sortedData.map((log, index) => {
    const x = sortedData.length === 1 ? GRAPH_WIDTH / 2 : (index / (sortedData.length - 1)) * GRAPH_WIDTH;
    const y = GRAPH_HEIGHT - ((log.glucose_value - minValue) / valueRange) * GRAPH_HEIGHT;
    return { x, y, value: log.glucose_value, time: log.measurement_time };
  });

  const pathData = points.length > 1 
    ? points.map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ')
    : points.length === 1 
      ? `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`
      : '';
  const formatTimeLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === '24h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.graphContainer}>
      <Text style={styles.graphTitle}>Glucose Trend</Text>
      <View style={styles.graphWrapper}>
        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT + 40}>
          <G>
            <Line
              x1={0}
              y1={GRAPH_HEIGHT - ((targetMin - minValue) / valueRange) * GRAPH_HEIGHT}
              x2={GRAPH_WIDTH}
              y2={GRAPH_HEIGHT - ((targetMin - minValue) / valueRange) * GRAPH_HEIGHT}
              stroke="#4caf50"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
            <Line
              x1={0}
              y1={GRAPH_HEIGHT - ((targetMax - minValue) / valueRange) * GRAPH_HEIGHT}
              x2={GRAPH_WIDTH}
              y2={GRAPH_HEIGHT - ((targetMax - minValue) / valueRange) * GRAPH_HEIGHT}
              stroke="#4caf50"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
          </G>
          {points.length > 1 ? (
            <>
              <Path
                d={pathData}
                stroke="#007AFF"
                strokeWidth={3}
                fill="none"
              />
              {points.map((point, index) => {
                if (index === 0) return null;
                const prevPoint = points[index - 1];
                return (
                  <Line
                    key={`line-${index}`}
                    x1={prevPoint.x}
                    y1={prevPoint.y}
                    x2={point.x}
                    y2={point.y}
                    stroke="#007AFF"
                    strokeWidth={3}
                  />
                );
              })}
            </>
          ) : points.length === 1 ? (
            <Circle
              cx={points[0].x}
              cy={points[0].y}
              r={6}
              fill="#007AFF"
              stroke="#fff"
              strokeWidth={2}
            />
          ) : null}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={point.value < 70 ? '#f44336' : point.value < 140 ? '#4caf50' : point.value < 200 ? '#ff9800' : '#f44336'}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}

          <SvgText x={-10} y={GRAPH_HEIGHT - ((targetMin - minValue) / valueRange) * GRAPH_HEIGHT + 5} fontSize="12" fill="#4caf50">
            {targetMin}
          </SvgText>
          <SvgText x={-10} y={GRAPH_HEIGHT - ((targetMax - minValue) / valueRange) * GRAPH_HEIGHT + 5} fontSize="12" fill="#4caf50">
            {targetMax}
          </SvgText>
          <SvgText x={-10} y={15} fontSize="12" fill="#666">
            {maxValue}
          </SvgText>
          <SvgText x={-10} y={GRAPH_HEIGHT - 5} fontSize="12" fill="#666">
            {minValue}
          </SvgText>
        </Svg>
      </View>
      
      <View style={styles.xAxisLabels}>
        {points.filter((_, index) => index % Math.ceil(points.length / 5) === 0).map((point, index) => (
          <Text key={index} style={styles.xAxisLabel}>
            {formatTimeLabel(point.time)}
          </Text>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4caf50' }]} />
          <Text style={styles.legendText}>Target Range (70-140)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Your Readings</Text>
        </View>
      </View>
    </View>
  );
};

export default function InsightsPage() {
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
    
    const inRange = values.filter(val => val >= 70 && val <= 140).length;
    const timeInRange = (inRange / values.length) * 100;

    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { 
      avg: Math.round(avg), 
      min, 
      max, 
      timeInRange: Math.round(timeInRange),
      stdDev: Math.round(stdDev),
      readings: values.length
    };
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
        priority: 'high',
        description: 'Your average glucose is above target. Focus on meals with fewer carbohydrates.'
      });
      recommendations.push({
        icon: '🏃',
        text: 'Light exercise after meals',
        priority: 'medium',
        description: 'A 15-30 minute walk after eating can help lower post-meal glucose.'
      });
    }

    if (stats.avg < 80) {
      recommendations.push({
        icon: '🍎',
        text: 'Add healthy snacks between meals',
        priority: 'high',
        description: 'Your average glucose is below target. Consider adding healthy snacks.'
      });
    }

    if (stats.timeInRange < 70) {
      recommendations.push({
        icon: '📊',
        text: 'Monitor glucose more frequently',
        priority: 'high',
        description: 'You\'re spending less than 70% of time in range. Consider checking glucose more often.'
      });
    }

    if (stats.stdDev > 50) {
      recommendations.push({
        icon: '📈',
        text: 'High glucose variability detected',
        priority: 'high',
        description: 'Your glucose levels are very variable. Consider more consistent meal timing and portions.'
      });
    }

    const trend = getGlucoseTrend();
    if (trend === 'rising') {
      recommendations.push({
        icon: '⚠️',
        text: 'Glucose trending upward',
        priority: 'high',
        description: 'Your recent readings are higher than older ones. Consider consulting your healthcare provider.'
      });
    }

    if (trend === 'falling') {
      recommendations.push({
        icon: '📉',
        text: 'Glucose trending downward',
        priority: 'medium',
        description: 'Your recent readings are lower than older ones. Monitor for hypoglycemia.'
      });
    }

    return recommendations.slice(0, 5);
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return '#f44336';
      case 'falling': return '#2196f3';
      default: return '#4caf50';
    }
  };

  const stats = getGlucoseStats();
  const recommendations = getRecommendations();
  const trend = getGlucoseTrend();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Glucose Insights</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading glucose insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (glucoseLogs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Glucose Insights</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No glucose readings yet</Text>
          <Text style={styles.emptySubtext}>Log your first reading to see insights</Text>
          <TouchableOpacity 
            style={styles.logButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.logButtonText}>Log Glucose Reading</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Glucose Insights</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.timeRangeContainer}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <View style={styles.timeRangeSelector}>
            {(['24h', '7d', '30d'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  timeRange === range && styles.timeRangeButtonActive,
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive
                ]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {stats && (
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: getGlucoseColor(stats.avg) }]}>
                  {stats.avg}
                </Text>
                <Text style={styles.statLabel}>Average (mg/dL)</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: stats.timeInRange >= 70 ? '#4caf50' : '#ff9800' }]}>
                  {stats.timeInRange}%
                </Text>
                <Text style={styles.statLabel}>Time in Range</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {stats.min}-{stats.max}
                </Text>
                <Text style={styles.statLabel}>Range (mg/dL)</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: stats.stdDev > 50 ? '#f44336' : '#4caf50' }]}>
                  {stats.stdDev}
                </Text>
                <Text style={styles.statLabel}>Variability</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.graphSection}>
          <GlucoseGraph data={glucoseLogs} timeRange={timeRange} />
        </View>

        <View style={styles.trendSection}>
          <Text style={styles.sectionTitle}>Trend Analysis</Text>
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendIcon}>{getTrendIcon(trend)}</Text>
              <Text style={[styles.trendText, { color: getTrendColor(trend) }]}>
                {trend.charAt(0).toUpperCase() + trend.slice(1)}
              </Text>
            </View>
            <Text style={styles.trendDescription}>
              {trend === 'rising' && 'Your glucose levels have been increasing over time.'}
              {trend === 'falling' && 'Your glucose levels have been decreasing over time.'}
              {trend === 'stable' && 'Your glucose levels have been relatively stable.'}
            </Text>
          </View>
        </View>

        <View style={styles.readingsSection}>
          <Text style={styles.sectionTitle}>Recent Readings ({glucoseLogs.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.readingsContainer}>
              {glucoseLogs.slice(0, 15).map((log, index) => (
                <View key={log.id} style={styles.readingItem}>
                  <View style={[
                    styles.readingValue,
                    { backgroundColor: getGlucoseColor(log.glucose_value) }
                  ]}>
                    <Text style={styles.readingNumber}>{log.glucose_value}</Text>
                  </View>
                  <Text style={styles.readingTime}>
                    {formatTime(log.measurement_time)}
                  </Text>
                  <Text style={styles.readingContext}>
                    {log.context || 'Random'}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        {recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationIcon}>{rec.icon}</Text>
                  <Text style={styles.recommendationTitle}>{rec.text}</Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: rec.priority === 'high' ? '#f44336' : '#ff9800' }
                  ]}>
                    <Text style={styles.priorityText}>
                      {rec.priority === 'high' ? 'High' : 'Medium'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recommendationDescription}>
                  {rec.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  logButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeRangeContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#007AFF',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  overviewSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  trendSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trendCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  trendText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trendDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  readingsSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#666',
    marginBottom: 2,
  },
  readingContext: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
  },
  recommendationsSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
  graphSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  graphContainer: {
    alignItems: 'center',
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  graphWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: GRAPH_WIDTH,
    paddingHorizontal: 20,
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});
