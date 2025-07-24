import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

// Props for the recipe card
interface RecipeCardProps {
  image: any;
  title: string;
  time: string;
  carbs: string;
  badge: { label: string; color: string };
  onPress?: () => void;
  dark?: boolean;
}

/**
 * RecipeCard
 * Displays a meal image, title, prep time, carbs, and a colored badge.
 */
const RecipeCard: React.FC<RecipeCardProps> = ({
  image,
  title,
  time,
  carbs,
  badge,
  onPress,
  dark = false,
}) => (
  <Pressable 
    style={[styles.card, dark && styles.cardDark]} 
    onPress={onPress}
  >
    <Image 
      source={image} 
      style={styles.image}
      resizeMode="cover"
    />
    <Text style={[styles.title, dark && styles.titleDark]}>
      {title}
    </Text>
    <View style={styles.infoRow}>
      <Text style={[styles.info, dark && styles.infoDark]}>⏱ {time}</Text>
      <Text style={[styles.info, dark && styles.infoDark]}>• {carbs}</Text>
    </View>
    <View 
      style={[styles.badge, { backgroundColor: badge.color }]}
    > 
      <Text style={styles.badgeText}>{badge.label}</Text>
    </View>
  </Pressable>
);

export default RecipeCard;

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginRight: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  cardDark: {
    backgroundColor: '#32405a',
  },
  image: {
    width: 120,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
    textAlign: 'center',
  },
  titleDark: {
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  info: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 2,
  },
  infoDark: {
    color: '#e0e6ed',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 