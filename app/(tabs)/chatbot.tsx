import React from 'react';
import { View, StyleSheet } from 'react-native';
import Chatbot from '@/components/chatbot';

export default function ChatbotPage() {
  return (
    <View style={styles.container}>
      <Chatbot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
});
