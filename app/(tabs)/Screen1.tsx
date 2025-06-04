import { Text, View, StyleSheet } from 'react-native';
import HeaderNavBar from '@/components/HeaderNavBar';
export default function AboutScreen() {
  return (
    <View style={styles.container}>
       <HeaderNavBar title= "Screen1" />
      <Text style={styles.text}>Screen 1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#abc',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  text: {
    color: '#gff',
  },
});
