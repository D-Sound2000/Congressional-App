import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

// Props for the reminder card
interface ReminderCardProps {
  icon: string;
  text: string;
  time?: string;
  onPress?: () => void;
  dark?: boolean;
}

/**
 * ReminderCard
 * Displays a minimal card-like entry for reminders.
 */
const ReminderCard: React.FC<ReminderCardProps> = ({ icon, text, time, onPress, dark = false }) => (
  <Pressable 
    style={[styles.card, dark && styles.cardDark]} 
    onPress={onPress}
  >
    <Text style={[styles.icon, dark && styles.iconDark]}>{icon}</Text>
    <View style={styles.textContainer}>
      <Text style={[styles.text, dark && styles.textDark]}>{text}</Text>
      {time && <Text style={[styles.time, dark && styles.timeDark]}>{time}</Text>}
    </View>
  </Pressable>
);

export default ReminderCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  cardDark: {
    backgroundColor: '#32405a',
  },
  icon: {
    fontSize: 22,
    marginRight: 12,
    color: '#222',
  },
  iconDark: {
    color: '#fff',
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  textDark: {
    color: '#fff',
  },
  time: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  timeDark: {
    color: '#e0e6ed',
  },
}); 