import { View, Text } from 'react-native'

// Main app entry point - authentication is handled in the root layout
// This is mostly just a placeholder now
export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>This is the main app entry point. Authentication is now handled in the root layout.</Text>
    </View>
  )
}