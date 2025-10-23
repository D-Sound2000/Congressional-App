import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createPlannerItem, CreatePlannerItemData } from '@/lib/plannerService';

// Modal for adding planner items - had to simplify this a lot
interface AddItemModalProps {
  isDark: boolean;
  selectedDate: Date;
  onClose: () => void;
  onItemAdded: () => void;
}

// Item types for the planner - removed activity/exercise as requested
const ITEM_TYPES = [
  { value: 'medication', label: 'Medication', icon: '💊' },
  { value: 'meal_time', label: 'Meal Time', icon: '🍽️' },
  { value: 'reminder', label: 'Reminder', icon: '⏰' },
  { value: 'checkup', label: 'Checkup', icon: '🩺' },
];

const CATEGORIES = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'bedtime', label: 'Bedtime' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function AddItemModal({ isDark, selectedDate, onClose, onItemAdded }: AddItemModalProps) {
  const [itemType, setItemType] = useState<CreatePlannerItemData['item_type']>('reminder');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CreatePlannerItemData['category']>('morning');
  const [priority, setPriority] = useState<CreatePlannerItemData['priority']>('medium');
  const [scheduledTime, setScheduledTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState('');
  const [hasScheduledTime, setHasScheduledTime] = useState(false);
  
  // Medication-specific fields
  const [dosage, setDosage] = useState('');
  const [medicationName, setMedicationName] = useState('');
  
  // Meal time specific fields
  const [mealType, setMealType] = useState('breakfast');
  const [foodSuggestions, setFoodSuggestions] = useState('');

  const handleSave = async () => {
    // Validate based on item type
    if (itemType === 'medication' && (!medicationName.trim() || !dosage.trim())) {
      Alert.alert('Error', 'Please enter medication name and dosage');
      return;
    }
    if (itemType !== 'medication' && !title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      const itemData: CreatePlannerItemData = {
        plan_date: selectedDate.toISOString().split('T')[0],
        item_type: itemType,
        title: itemType === 'medication' ? `${medicationName} (${dosage})` : title,
        description: description.trim() || undefined,
        category,
        priority,
        scheduled_time: hasScheduledTime ? 
          `${scheduledTime.getHours().toString().padStart(2, '0')}:${scheduledTime.getMinutes().toString().padStart(2, '0')}` : 
          undefined,
        duration: duration ? parseInt(duration) : undefined,
        metadata: {
          ...(itemType === 'medication' && {
            medication_name: medicationName,
            dosage,
          }),
          ...(itemType === 'meal_time' && {
            meal_type: mealType,
            food_suggestions: foodSuggestions,
          }),
        },
      };

      await createPlannerItem(itemData);
      Alert.alert('Success', 'Item added to your planner!');
      onItemAdded();
    } catch (error) {
      console.error('Error creating planner item:', error);
      Alert.alert('Error', 'Failed to add item to planner');
    }
  };

  const getSelectedItemType = () => {
    return ITEM_TYPES.find(type => type.value === itemType);
  };

  const renderMedicationFields = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>Medication Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Medication Name *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: isDark ? '#2d3a4d' : '#fff',
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#404040' : '#ddd'
          }]}
          placeholder="e.g., Metformin, Insulin"
          placeholderTextColor={isDark ? '#999' : '#999'}
          value={medicationName}
          onChangeText={setMedicationName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Dosage *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: isDark ? '#2d3a4d' : '#fff',
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#404040' : '#ddd'
          }]}
          placeholder="e.g., 500mg, 10 units"
          placeholderTextColor={isDark ? '#999' : '#999'}
          value={dosage}
          onChangeText={setDosage}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Description (Optional)</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: isDark ? '#2d3a4d' : '#fff',
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#404040' : '#ddd'
          }]}
          placeholder="Add any additional details..."
          placeholderTextColor={isDark ? '#999' : '#999'}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  const renderMealTimeFields = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>Meal Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Title *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: isDark ? '#2d3a4d' : '#fff',
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#404040' : '#ddd'
          }]}
          placeholder="e.g., Healthy Lunch"
          placeholderTextColor={isDark ? '#999' : '#999'}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Meal Type</Text>
        <View style={[styles.pickerContainer, { backgroundColor: isDark ? '#2d3a4d' : '#fff' }]}>
          <Picker
            selectedValue={mealType}
            onValueChange={setMealType}
            style={[styles.picker, { color: isDark ? '#fff' : '#333' }]}
          >
            <Picker.Item label="Breakfast" value="breakfast" />
            <Picker.Item label="Lunch" value="lunch" />
            <Picker.Item label="Dinner" value="dinner" />
            <Picker.Item label="Snack" value="snack" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Food Suggestions (Optional)</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: isDark ? '#2d3a4d' : '#fff',
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#404040' : '#ddd'
          }]}
          placeholder="e.g., Low-carb options, protein-rich foods"
          placeholderTextColor={isDark ? '#999' : '#999'}
          value={foodSuggestions}
          onChangeText={setFoodSuggestions}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Description (Optional)</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: isDark ? '#2d3a4d' : '#fff',
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#404040' : '#ddd'
          }]}
          placeholder="Add any additional details..."
          placeholderTextColor={isDark ? '#999' : '#999'}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  const renderReminderFields = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>Reminder Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Title *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: isDark ? '#2d3a4d' : '#fff',
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#404040' : '#ddd'
          }]}
          placeholder="e.g., Take medication, Check glucose"
          placeholderTextColor={isDark ? '#999' : '#999'}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Description (Optional)</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: isDark ? '#2d3a4d' : '#fff',
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#404040' : '#ddd'
          }]}
          placeholder="Add any additional details..."
          placeholderTextColor={isDark ? '#999' : '#999'}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  const renderCheckupFields = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>Checkup Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Title *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: isDark ? '#2d3a4d' : '#fff',
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#404040' : '#ddd'
          }]}
          placeholder="e.g., Doctor Appointment, Blood Test"
          placeholderTextColor={isDark ? '#999' : '#999'}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Description (Optional)</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: isDark ? '#2d3a4d' : '#fff',
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#404040' : '#ddd'
          }]}
          placeholder="Add any additional details..."
          placeholderTextColor={isDark ? '#999' : '#999'}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#181a20' : '#f6f8fa' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#333' }]}>Add Planner Item</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Item Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>Item Type</Text>
          <View style={styles.typeGrid}>
            {ITEM_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  { 
                    backgroundColor: itemType === type.value 
                      ? '#007AFF' 
                      : isDark ? '#2d3a4d' : '#fff',
                    borderColor: itemType === type.value 
                      ? '#007AFF' 
                      : isDark ? '#404040' : '#ddd'
                  }
                ]}
                onPress={() => setItemType(type.value as CreatePlannerItemData['item_type'])}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeLabel,
                  { 
                    color: itemType === type.value 
                      ? '#fff' 
                      : isDark ? '#fff' : '#333'
                  }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Type-specific fields */}
        {itemType === 'medication' && renderMedicationFields()}
        {itemType === 'meal_time' && renderMealTimeFields()}
        {itemType === 'reminder' && renderReminderFields()}
        {itemType === 'checkup' && renderCheckupFields()}

        {/* Scheduling */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>Scheduling</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Schedule Time</Text>
              <Switch
                value={hasScheduledTime}
                onValueChange={setHasScheduledTime}
                trackColor={{ false: isDark ? '#404040' : '#ddd', true: '#007AFF' }}
                thumbColor={hasScheduledTime ? '#fff' : (isDark ? '#666' : '#f4f3f4')}
              />
            </View>
            
            {hasScheduledTime && (
              <TouchableOpacity
                style={[styles.timeButton, { 
                  backgroundColor: isDark ? '#2d3a4d' : '#fff',
                  borderColor: isDark ? '#404040' : '#ddd'
                }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={isDark ? '#fff' : '#333'} />
                <Text style={[styles.timeText, { color: isDark ? '#fff' : '#333' }]}>
                  {scheduledTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Duration/Time (minutes)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? '#2d3a4d' : '#fff',
                color: isDark ? '#fff' : '#333',
                borderColor: isDark ? '#404040' : '#ddd'
              }]}
              placeholder="e.g., 30"
              placeholderTextColor={isDark ? '#999' : '#999'}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Category</Text>
            <View style={[styles.pickerContainer, { backgroundColor: isDark ? '#2d3a4d' : '#fff' }]}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={[styles.picker, { color: isDark ? '#fff' : '#333' }]}
              >
                {CATEGORIES.map((cat) => (
                  <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Priority</Text>
            <View style={[styles.pickerContainer, { backgroundColor: isDark ? '#2d3a4d' : '#fff' }]}>
              <Picker
                selectedValue={priority}
                onValueChange={setPriority}
                style={[styles.picker, { color: isDark ? '#fff' : '#333' }]}
              >
                {PRIORITIES.map((pri) => (
                  <Picker.Item key={pri.value} label={pri.label} value={pri.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={scheduledTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) {
                setScheduledTime(selectedDate);
              }
            }}
          />
        )}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Add to Planner</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  timeText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
