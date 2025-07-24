import { Text, View, StyleSheet } from 'react-native';
import HeaderNavBar from '@/components/HeaderNavBar';



export default function AboutScreen() {
  return (
    <View style={styles.container}>
       <HeaderNavBar/>
      <Text style={styles.text}>About screen</Text>
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
    color: '#fff',
  },
});
