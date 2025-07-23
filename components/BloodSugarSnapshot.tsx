import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Props for the blood sugar snapshot
interface BloodSugarSnapshotProps {
  glucose: number;
  time: string;
  context: string;
  data: { value: number; color: string }[]; // 7-day data
}

/**
 * BloodSugarSnapshot
 * Displays the latest glucose reading and a simple 7-day trend as text.
 */
const BloodSugarSnapshot: React.FC<BloodSugarSnapshotProps> = ({
  glucose,
  time,
  context,
  data,
}) => {
  return (
    <View style={styles.card}>
      {/* Glucose reading and context */}
      <Text style={styles.glucose}>{glucose} mg/dL</Text>
      <Text style={styles.context}>{context} at {time}</Text>
      {/* Simple 7-day trend as text */}
      <Text style={styles.trend}>
        7-day trend: [{data.map(d => d.value).join(', ')}]
      </Text>
    </View>
  );
};

export default BloodSugarSnapshot;

// Styles for the card
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#b2dfdb', // Soft green
    borderRadius: 18,
    padding: 20,
    marginVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  glucose: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  context: {
    fontSize: 16,
    color: '#388e3c',
    marginBottom: 8,
  },
  trend: {
    marginTop: 8,
    fontSize: 15,
    color: '#333',
  },
}); 