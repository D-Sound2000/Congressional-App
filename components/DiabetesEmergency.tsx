import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DiabetesEmergencyProps {
  isDark?: boolean;
}

const EMERGENCY_SCENARIOS = [
  {
    id: 'hypoglycemia',
    title: 'Low Blood Sugar (Hypoglycemia)',
    symptoms: ['Shaking', 'Sweating', 'Confusion', 'Dizziness', 'Weakness'],
    immediateActions: [
      'Check blood sugar if possible',
      'Eat 15g fast-acting carbs (glucose tablets, juice)',
      'Wait 15 minutes and recheck',
      'Repeat if still below 70 mg/dL',
      'Eat a snack after blood sugar normalizes'
    ],
    warningSigns: 'Blood sugar below 70 mg/dL',
    emergencyNumber: '911',
    color: '#f44336'
  },
  {
    id: 'hyperglycemia',
    title: 'High Blood Sugar (Hyperglycemia)',
    symptoms: ['Excessive thirst', 'Frequent urination', 'Blurred vision', 'Fatigue', 'Headache'],
    immediateActions: [
      'Check blood sugar',
      'Drink water to stay hydrated',
      'Take prescribed medication if due',
      'Check for ketones if blood sugar >250 mg/dL',
      'Contact doctor if symptoms worsen'
    ],
    warningSigns: 'Blood sugar above 250 mg/dL',
    emergencyNumber: '911',
    color: '#ff9800'
  },
  {
    id: 'dka',
    title: 'Diabetic Ketoacidosis (DKA)',
    symptoms: ['Nausea/vomiting', 'Abdominal pain', 'Rapid breathing', 'Fruity breath', 'Confusion'],
    immediateActions: [
      'Check blood sugar and ketones',
      'Drink water if able to keep down',
      'Seek immediate medical attention',
      'Do NOT take insulin without medical supervision',
      'Call emergency services immediately'
    ],
    warningSigns: 'Blood sugar >250 mg/dL with ketones',
    emergencyNumber: '911',
    color: '#d32f2f'
  },
  {
    id: 'severe_hypoglycemia',
    title: 'Severe Low Blood Sugar',
    symptoms: ['Unconsciousness', 'Seizures', 'Unable to swallow', 'Severe confusion'],
    immediateActions: [
      'Call emergency services immediately',
      'Do NOT try to give food or drink',
      'If trained, administer glucagon',
      'Position person on their side',
      'Stay with them until help arrives'
    ],
    warningSigns: 'Person is unconscious or having seizures',
    emergencyNumber: '911',
    color: '#b71c1c'
  }
];

const EMERGENCY_CONTACTS = [
  { name: 'Emergency Services', number: '911', type: 'emergency' },
  { name: 'Poison Control', number: '1-800-222-1222', type: 'emergency' },
  { name: 'Diabetes Hotline', number: '1-800-DIABETES', type: 'support' },
  { name: 'Your Doctor', number: 'Call your doctor', type: 'medical' },
  { name: 'Emergency Contact', number: 'Your emergency contact', type: 'personal' }
];

export default function DiabetesEmergency({ isDark = false }: DiabetesEmergencyProps) {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const handleEmergencyCall = (number: string) => {
    Alert.alert(
      'Emergency Call',
      `Calling ${number}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            if (number === '911') {
              Linking.openURL('tel:911');
            } else if (number.startsWith('1-800')) {
              Linking.openURL(`tel:${number.replace(/-/g, '')}`);
            } else {
              Alert.alert('Call', `Please call: ${number}`);
            }
          }
        }
      ]
    );
  };

  const renderEmergencyScenario = (scenario: any) => (
    <View key={scenario.id} style={styles.scenarioCard}>
      <View style={[styles.scenarioHeader, { backgroundColor: scenario.color }]}>
        <Text style={styles.scenarioTitle}>{scenario.title}</Text>
        <Text style={styles.warningSigns}>{scenario.warningSigns}</Text>
      </View>
      
      <View style={styles.scenarioContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
            Symptoms
          </Text>
          <View style={styles.symptomsList}>
            {scenario.symptoms.map((symptom: string, index: number) => (
              <Text key={index} style={[styles.symptomItem, { color: isDark ? '#ccc' : '#666' }]}>
                • {symptom}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
            Immediate Actions
          </Text>
          <View style={styles.actionsList}>
            {scenario.immediateActions.map((action: string, index: number) => (
              <View key={index} style={styles.actionItem}>
                <Text style={styles.actionNumber}>{index + 1}</Text>
                <Text style={[styles.actionText, { color: isDark ? '#fff' : '#333' }]}>
                  {action}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.emergencyButton, { backgroundColor: scenario.color }]}
          onPress={() => handleEmergencyCall(scenario.emergencyNumber)}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.emergencyButtonText}>
            Call {scenario.emergencyNumber}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
      {/* Emergency Header */}
      <View style={[styles.header, { backgroundColor: '#d32f2f' }]}>
        <Text style={styles.headerTitle}>🚨 Diabetes Emergency Guide</Text>
        <Text style={styles.headerSubtitle}>
          Quick access to emergency information and contacts
        </Text>
      </View>

      {/* Emergency Scenarios */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionHeader, { color: isDark ? '#fff' : '#333' }]}>
          Emergency Scenarios
        </Text>
        
        {EMERGENCY_SCENARIOS.map(renderEmergencyScenario)}

        {/* Emergency Contacts */}
        <View style={styles.contactsSection}>
          <Text style={[styles.sectionHeader, { color: isDark ? '#fff' : '#333' }]}>
            Emergency Contacts
          </Text>
          
          {EMERGENCY_CONTACTS.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.contactCard,
                { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }
              ]}
              onPress={() => handleEmergencyCall(contact.number)}
            >
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: isDark ? '#fff' : '#333' }]}>
                  {contact.name}
                </Text>
                <Text style={[styles.contactNumber, { color: isDark ? '#ccc' : '#666' }]}>
                  {contact.number}
                </Text>
              </View>
              <View style={[
                styles.contactType,
                { backgroundColor: contact.type === 'emergency' ? '#f44336' : '#007AFF' }
              ]}>
                <Text style={styles.contactTypeText}>
                  {contact.type.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionHeader, { color: isDark ? '#fff' : '#333' }]}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#f44336' }]}
              onPress={() => handleEmergencyCall('911')}
            >
              <Ionicons name="call" size={24} color="#fff" />
              <Text style={styles.quickActionText}>Call 911</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#ff9800' }]}
              onPress={() => Alert.alert('Glucose Check', 'Check your blood sugar immediately')}
            >
              <Ionicons name="pulse" size={24} color="#fff" />
              <Text style={styles.quickActionText}>Check Glucose</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#4caf50' }]}
              onPress={() => Alert.alert('Glucagon', 'If you have glucagon available, use it as directed')}
            >
              <Ionicons name="medical" size={24} color="#fff" />
              <Text style={styles.quickActionText}>Glucagon</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#2196f3' }]}
              onPress={() => Alert.alert('Doctor', 'Contact your doctor immediately')}
            >
              <Ionicons name="person" size={24} color="#fff" />
              <Text style={styles.quickActionText}>Call Doctor</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Important Notes */}
        <View style={[styles.notesSection, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
          <Text style={[styles.notesTitle, { color: isDark ? '#fff' : '#333' }]}>
            Important Notes
          </Text>
          <Text style={[styles.notesText, { color: isDark ? '#ccc' : '#666' }]}>
            • Always carry glucose tablets or fast-acting carbs
          </Text>
          <Text style={[styles.notesText, { color: isDark ? '#ccc' : '#666' }]}>
            • Wear medical ID indicating you have diabetes
          </Text>
          <Text style={[styles.notesText, { color: isDark ? '#ccc' : '#666' }]}>
            • Keep emergency contacts easily accessible
          </Text>
          <Text style={[styles.notesText, { color: isDark ? '#ccc' : '#666' }]}>
            • When in doubt, call emergency services
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  scenarioCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scenarioHeader: {
    padding: 16,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  warningSigns: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  scenarioContent: {
    padding: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  symptomsList: {
    gap: 4,
  },
  symptomItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsList: {
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contactsSection: {
    marginTop: 24,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 14,
  },
  contactType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contactTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickActionsSection: {
    marginTop: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  notesSection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});
