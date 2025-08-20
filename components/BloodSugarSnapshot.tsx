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
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  glucose: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  context: {
    fontSize: 14,
    color: '#388e3c',
    marginBottom: 6,
  },
  trend: {
    marginTop: 6,
    fontSize: 13,
    color: '#333',
  },
}); 