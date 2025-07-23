import React from 'react';
import { Pressable, Text, StyleSheet, View, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Props for the quick action button
interface QuickActionButtonProps {
  icon: string;
  label: string;
  backgroundColor: string;
  textColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * QuickActionButton
 * A rounded button with an icon and label, pastel background.
 */
const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  backgroundColor,
  textColor = '#333',
  onPress,
  style,
}) => (
  <Pressable style={[styles.button, { backgroundColor }, style]} onPress={onPress}>
    <Ionicons name={icon} size={22} color={textColor} style={styles.icon} />
    <Text style={[styles.label, { color: textColor }]}>{label}</Text>
  </Pressable>
);

export default QuickActionButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginHorizontal: 4,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 