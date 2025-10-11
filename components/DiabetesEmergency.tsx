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

const scenarios = [
  {
    id: 'hypoglycemia',
    title: 'Low Blood Sugar (Hypoglycemia)',
    symptoms: ['Shaking', 'Sweating', 'Confusion', 'Dizziness', 'Weakness'],
    actions: [
      'Check blood sugar if possible',
      'Eat 15g fast-acting carbs (glucose tablets, juice)',
      'Wait 15 minutes and recheck',
      'Repeat if still below 70 mg/dL',
      'Eat a snack after blood sugar normalizes'
    ],
    warning: 'Blood sugar below 70 mg/dL',
    emergencyNum: '911',
    color: '#f44336'
  },
  {
    id: 'hyperglycemia',
    title: 'High Blood Sugar (Hyperglycemia)',
    symptoms: ['Excessive thirst', 'Frequent urination', 'Blurred vision', 'Fatigue', 'Headache'],
    actions: [
      'Check blood sugar',
      'Drink water to stay hydrated',
      'Take prescribed medication if due',
      'Check for ketones if blood sugar >250 mg/dL',
      'Contact doctor if symptoms worsen'
    ],
    warning: 'Blood sugar above 250 mg/dL',
    emergencyNum: '911',
    color: '#ff9800'
  },
  {
    id: 'dka',
    title: 'Diabetic Ketoacidosis (DKA)',
    symptoms: ['Nausea/vomiting', 'Abdominal pain', 'Rapid breathing', 'Fruity breath', 'Confusion'],
    actions: [
      'Check blood sugar and ketones',
      'Drink water if able to keep down',
      'Seek immediate medical attention',
      'Do NOT take insulin without medical supervision',
      'Call emergency services immediately'
    ],
    warning: 'Blood sugar >250 mg/dL with ketones',
    emergencyNum: '911',
    color: '#d32f2f'
  },
  {
    id: 'severe_hypoglycemia',
    title: 'Severe Low Blood Sugar',
    symptoms: ['Unconsciousness', 'Seizures', 'Unable to swallow', 'Severe confusion'],
    actions: [
      'Call emergency services immediately',
      'Do NOT try to give food or drink',
      'If trained, administer glucagon',
      'Position person on their side',
      'Stay with them until help arrives'
    ],
    warning: 'Person is unconscious or having seizures',
    emergencyNum: '911',
    color: '#b71c1c'
  }
];

const contacts = [
  { name: 'Emergency Services', number: '911', type: 'emergency' },
  { name: 'Poison Control', number: '1-800-222-1222', type: 'emergency' },
  { name: 'Diabetes Hotline', number: '1-800-DIABETES', type: 'support' },
  { name: 'Your Doctor', number: 'Call your doctor', type: 'medical' },
  { name: 'Emergency Contact', number: 'Your emergency contact', type: 'personal' }
];

export default function DiabetesEmergency({ isDark = false }: DiabetesEmergencyProps) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const makeCall = (num: string) => {
    Alert.alert(
      'Emergency Call',
      `Calling ${num}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            if (num === '911') {
              Linking.openURL('tel:911');
            } else if (num.startsWith('1-800')) {
              Linking.openURL(`tel:${num.replace(/-/g, '')}`);
            } else {
              Alert.alert('Call', `Please call: ${num}`);
            }
          }
        }
      ]
    );
  };

  const ScenarioCard = ({ scenario }: any) => (
    <View key={scenario.id} style={styles.card}>
      <View style={[styles.cardHeader, { backgroundColor: scenario.color }]}>
        <Text style={styles.cardTitle}>{scenario.title}</Text>
        <Text style={styles.warning}>{scenario.warning}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.subtitle, { color: isDark ? '#fff' : '#333' }]}>
            Symptoms
          </Text>
          <View style={{ marginTop: 8 }}>
            {scenario.symptoms.map((s: string, i: number) => (
              <Text key={i} style={[styles.item, { color: isDark ? '#ccc' : '#666' }]}>
                • {s}
              </Text>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.subtitle, { color: isDark ? '#fff' : '#333' }]}>
            Immediate Actions
          </Text>
          <View style={{ marginTop: 8 }}>
            {scenario.actions.map((action: string, idx: number) => (
              <View key={idx} style={styles.actionRow}>
                <Text style={styles.num}>{idx + 1}</Text>
                <Text style={[styles.actionTxt, { color: isDark ? '#fff' : '#333' }]}>
                  {action}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.callBtn, { backgroundColor: scenario.color }]}
          onPress={() => makeCall(scenario.emergencyNum)}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.callBtnText}>
            Call {scenario.emergencyNum}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
      <View style={styles.topBar}>
        <Text style={styles.mainTitle}>🚨 Diabetes Emergency Guide</Text>
        <Text style={styles.desc}>
          Quick access to emergency information and contacts
        </Text>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: isDark ? '#fff' : '#333' }]}>
          Emergency Scenarios
        </Text>
        
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}

        <View style={styles.contactArea}>
          <Text style={[styles.header, { color: isDark ? '#fff' : '#333' }]}>
            Emergency Contacts
          </Text>
          
          {contacts.map((c, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.contactItem,
                { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }
              ]}
              onPress={() => makeCall(c.number)}
            >
              <View style={styles.contactLeft}>
                <Text style={[styles.contactTitle, { color: isDark ? '#fff' : '#333' }]}>
                  {c.name}
                </Text>
                <Text style={[styles.contactNum, { color: isDark ? '#ccc' : '#666' }]}>
                  {c.number}
                </Text>
              </View>
              <View style={[
                styles.badge,
                { backgroundColor: c.type === 'emergency' ? '#f44336' : '#007AFF' }
              ]}>
                <Text style={styles.badgeText}>
                  {c.type.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickSection}>
          <Text style={[styles.header, { color: isDark ? '#fff' : '#333' }]}>
            Quick Actions
          </Text>
          
          <View style={styles.btnGrid}>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: '#f44336' }]}
              onPress={() => makeCall('911')}
            >
              <Ionicons name="call" size={24} color="#fff" />
              <Text style={styles.quickTxt}>Call 911</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: '#ff9800' }]}
              onPress={() => Alert.alert('Glucose Check', 'Check your blood sugar immediately')}
            >
              <Ionicons name="pulse" size={24} color="#fff" />
              <Text style={styles.quickTxt}>Check Glucose</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: '#4caf50' }]}
              onPress={() => Alert.alert('Glucagon', 'If you have glucagon available, use it as directed')}
            >
              <Ionicons name="medical" size={24} color="#fff" />
              <Text style={styles.quickTxt}>Glucagon</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: '#2196f3' }]}
              onPress={() => Alert.alert('Doctor', 'Contact your doctor immediately')}
            >
              <Ionicons name="person" size={24} color="#fff" />
              <Text style={styles.quickTxt}>Call Doctor</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.notes, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
          <Text style={[styles.notesTitle, { color: isDark ? '#fff' : '#333' }]}>
            Important Notes
          </Text>
          <Text style={[styles.noteItem, { color: isDark ? '#ccc' : '#666' }]}>
            • Always carry glucose tablets or fast-acting carbs
          </Text>
          <Text style={[styles.noteItem, { color: isDark ? '#ccc' : '#666' }]}>
            • Wear medical ID indicating you have diabetes
          </Text>
          <Text style={[styles.noteItem, { color: isDark ? '#ccc' : '#666' }]}>
            • Keep emergency contacts easily accessible
          </Text>
          <Text style={[styles.noteItem, { color: isDark ? '#ccc' : '#666' }]}>
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
  topBar: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#d32f2f',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  warning: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  cardBody: {
    padding: 16,
    backgroundColor: '#fff',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  item: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  num: {
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
  actionTxt: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  callBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contactArea: {
    marginTop: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  contactLeft: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactNum: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickSection: {
    marginTop: 24,
  },
  btnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickBtn: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  notes: {
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
  noteItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});
