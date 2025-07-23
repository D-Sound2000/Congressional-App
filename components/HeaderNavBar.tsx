import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';

type CustomHeaderProps = {
  userName?: string;
};

const HeaderNavBar: React.FC<CustomHeaderProps> = ({ userName = "User" }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            {getGreeting()}, {userName} 👋
          </Text>
        </View>
        <Link href="/(tabs)/about" asChild>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" color="#ffffff" size={32} />
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default HeaderNavBar;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#1a1a1a',
  },
  container: {
    height: 80,
    backgroundColor: '#1a1a1a',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'System',
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#333333',
  },
});