import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logGlucose, getGlucoseLogs, GlucoseLog } from '@/lib/mealPlannerService';

interface BloodSugarLoggerProps {
  visible: boolean;
  onClose: () => void;
  onLogSuccess?: (log: GlucoseLog) => void;
  isDark?: boolean;
}

const GLUCOSE_RANGES = {
  low: { min: 0, max: 70, color: '#f44336', label: 'Low', icon: '⚠️' },
  normal: { min: 70, max: 140, color: '#4caf50', label: 'Normal', icon: '✅' },
  high: { min: 140, max: 200, color: '#ff9800', label: 'High', icon: '⚠️' },
  veryHigh: { min: 200, max: 999, color: '#f44336', label: 'Very High', icon: '🚨' },
};

const CONTEXT_OPTIONS = [
  { value: 'fasting', label: 'Fasting (before breakfast)', icon: '🌅' },
  { value: 'pre-meal', label: 'Pre-meal', icon: '🍽️' },
  { value: 'post-meal', label: 'Post-meal (2 hours after)', icon: '⏰' },
  { value: 'bedtime', label: 'Bedtime', icon: '🌙' },
  { value: 'random', label: 'Random check', icon: '📊' },
  { value: 'exercise', label: 'Before/after exercise', icon: '🏃' },
];

export default function BloodSugarLogger({ 
  visible, 
  onClose, 
  onLogSuccess,
  isDark = false 
}: BloodSugarLoggerProps) {
  const [glucoseValue, setGlucoseValue] = useState('');
  const [selectedContext, setSelectedContext] = useState('random');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentLogs, setRecentLogs] = useState<GlucoseLog[]>([]);

  useEffect(() => {
    if (visible) {
      loadRecentLogs();
    }
  }, [visible]);

  const loadRecentLogs = async () => {
    try {
      const logs = await getGlucoseLogs(5); // Last 5 readings
      setRecentLogs(logs);
    } catch (error) {
      console.error('Error loading recent logs:', error);
    }
  };

  const getGlucoseRange = (value: number) => {
    if (value < GLUCOSE_RANGES.low.max) return GLUCOSE_RANGES.low;
    if (value < GLUCOSE_RANGES.normal.max) return GLUCOSE_RANGES.normal;
    if (value < GLUCOSE_RANGES.high.max) return GLUCOSE_RANGES.high;
    return GLUCOSE_RANGES.veryHigh;
  };

  const handleLogGlucose = async () => {
    if (!glucoseValue || isNaN(Number(glucoseValue))) {
      Alert.alert('Invalid Input', 'Please enter a valid glucose reading');
      return;
    }

    const value = Number(glucoseValue);
    if (value < 20 || value > 600) {
      Alert.alert('Invalid Range', 'Glucose reading should be between 20-600 mg/dL');
      return;
    }

    try {
      setLoading(true);
      console.log('Logging glucose:', value, selectedContext, notes);
      const log = await logGlucose(value, selectedContext, notes);
      console.log('Glucose logged successfully:', log);
      
      // Show feedback based on glucose level
      const range = getGlucoseRange(value);
      
      // Clear the form immediately
      setGlucoseValue('');
      setNotes('');
      
      // Call the success callback to refresh parent data
      console.log('Calling onLogSuccess callback...');
      onLogSuccess?.(log);
      
      // Close the modal immediately
      console.log('Closing modal...');
      onClose();
      
      // Show success message after closing
      setTimeout(() => {
        Alert.alert(
          `Glucose Logged Successfully!`,
          `Your reading of ${value} mg/dL is ${range.label.toLowerCase()}. ${getGlucoseAdvice(range, selectedContext)}`,
          [{ text: 'OK' }]
        );
      }, 100);
    } catch (error) {
      console.error('Error logging glucose:', error);
      Alert.alert('Error', 'Failed to log glucose reading');
    } finally {
      setLoading(false);
    }
  };

  const getGlucoseAdvice = (range: any, context: string) => {
    if (range.label === 'Low') {
      return 'Eat 15g fast-acting carbs (4 glucose tablets, 4oz juice, or 1 tbsp honey). Recheck in 15 minutes.';
    } else if (range.label === 'High') {
      return 'Take a 20-30 minute walk to help lower your glucose naturally. Consider reducing carbs in your next meal.';
    } else if (range.label === 'Very High') {
      return 'Drink plenty of water and consider light exercise. If this persists, contact your healthcare provider.';
    } else {
      return 'Excellent! Your glucose is in a healthy range. Keep up your great management!';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const range = glucoseValue ? getGlucoseRange(Number(glucoseValue)) : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: isDark ? '#181a20' : '#f6f8fa' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#333' }]}>
            Log Blood Sugar
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={isDark ? '#fff' : '#333'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Glucose Input */}
          <View style={[styles.section, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
              Glucose Reading (mg/dL)
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.glucoseInput,
                  { 
                    backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa',
                    color: isDark ? '#fff' : '#333',
                    borderColor: range?.color || '#ddd'
                  }
                ]}
                value={glucoseValue}
                onChangeText={setGlucoseValue}
                placeholder="Enter glucose reading"
                placeholderTextColor={isDark ? '#ccc' : '#666'}
                keyboardType="numeric"
                maxLength={3}
              />
              {range && (
                <View style={[styles.rangeIndicator, { backgroundColor: range.color }]}>
                  <Text style={styles.rangeText}>{range.icon} {range.label}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Context Selection */}
          <View style={[styles.section, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
              When did you check?
            </Text>
            <View style={styles.contextGrid}>
              {CONTEXT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.contextOption,
                    selectedContext === option.value && styles.contextOptionSelected,
                    { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }
                  ]}
                  onPress={() => setSelectedContext(option.value)}
                >
                  <Text style={styles.contextIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.contextLabel,
                    { color: isDark ? '#fff' : '#333' }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={[styles.section, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
              Notes (Optional)
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                { 
                  backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa',
                  color: isDark ? '#fff' : '#333'
                }
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes..."
              placeholderTextColor={isDark ? '#ccc' : '#666'}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Recent Logs */}
          {recentLogs.length > 0 && (
            <View style={[styles.section, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
                Recent Readings
              </Text>
              {recentLogs.map((log) => {
                const logRange = getGlucoseRange(log.glucose_value);
                return (
                  <View key={log.id} style={styles.recentLogItem}>
                    <View style={styles.recentLogInfo}>
                      <Text style={[styles.recentLogValue, { color: logRange.color }]}>
                        {log.glucose_value}
                      </Text>
                      <Text style={[styles.recentLogUnit, { color: isDark ? '#ccc' : '#666' }]}>
                        mg/dL
                      </Text>
                    </View>
                    <View style={styles.recentLogDetails}>
                      <Text style={[styles.recentLogContext, { color: isDark ? '#fff' : '#333' }]}>
                        {CONTEXT_OPTIONS.find(c => c.value === log.context)?.label || log.context}
                      </Text>
                      <Text style={[styles.recentLogTime, { color: isDark ? '#ccc' : '#666' }]}>
                        {formatTime(log.measurement_time)}
                      </Text>
                    </View>
                    <View style={[styles.recentLogRange, { backgroundColor: logRange.color }]}>
                      <Text style={styles.recentLogRangeText}>{logRange.icon}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Log Button */}
          <TouchableOpacity
            style={[
              styles.logButton,
              loading && styles.logButtonDisabled,
              (!glucoseValue || loading) && styles.logButtonDisabled,
              range && { backgroundColor: range.color }
            ]}
            onPress={handleLogGlucose}
            disabled={loading || !glucoseValue}
          >
            <Text style={styles.logButtonText}>
              {loading ? 'Logging...' : 'Log Reading'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  glucoseInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rangeIndicator: {
    position: 'absolute',
    top: -8,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rangeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contextOption: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  contextOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  contextIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  contextLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  recentLogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentLogInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 16,
  },
  recentLogValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  recentLogUnit: {
    fontSize: 14,
    marginLeft: 4,
  },
  recentLogDetails: {
    flex: 1,
  },
  recentLogContext: {
    fontSize: 16,
    fontWeight: '500',
  },
  recentLogTime: {
    fontSize: 14,
    marginTop: 2,
  },
  recentLogRange: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentLogRangeText: {
    fontSize: 16,
  },
  logButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logButtonDisabled: {
    backgroundColor: '#ccc',
  },
  logButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
