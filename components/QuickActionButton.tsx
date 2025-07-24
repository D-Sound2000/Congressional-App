import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
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
    <Ionicons name={icon as any} size={22} color={textColor} style={styles.icon} />
    <Text style={[styles.label, { color: textColor }]}>{label}</Text>
  </Pressable>
);

export default QuickActionButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 44,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
}); 