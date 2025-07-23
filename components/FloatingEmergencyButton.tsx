import React from 'react';
import { StyleSheet, Pressable, View, Text } from 'react-native';

// Props for the floating button
interface FloatingEmergencyButtonProps {
  onPress?: () => void;
}

/**
 * FloatingEmergencyButton
 * A red circular button with a white emoji, anchored bottom right.
 */
const FloatingEmergencyButton: React.FC<FloatingEmergencyButtonProps> = ({ onPress }) => (
  <Pressable style={styles.button} onPress={onPress}>
    <Text style={styles.icon}>🚨</Text>
  </Pressable>
);

export default FloatingEmergencyButton;

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  icon: {
    fontSize: 32,
    color: '#fff',
  },
}); 