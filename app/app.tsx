import { View, Text } from 'react-native'

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>This is the main app entry point. Authentication is now handled in the root layout.</Text>
    </View>
  )
}