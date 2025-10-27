import { View, Text } from 'react-native'
import React from 'react';

// Main app entry point - authentication is handled in the root layout
// This is mostly just a placeholder now since tabs handle the main navigation
export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>This is the main app entry point. Authentication is now handled in the root layout.</Text>
      <Text style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
        Navigation is handled through the tab bar below.
      </Text>
    </View>
  )
}

