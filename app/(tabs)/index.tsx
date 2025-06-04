import { Text, View, StyleSheet } from 'react-native';
 import { Link } from 'expo-router'; 
 import Button from '@/components/button';
import HeaderNavBar from '@/components/HeaderNavBar';



export default function Index() {
  return (
    <View style={styles.container}>
      <HeaderNavBar title= "home" />
      <h1>Welcome to the Home Screen!</h1>
      <h2>Insert Text Here!</h2>
      <View style={styles.footerContainer}>
        <Button theme="primary" label="Option 1" />
        <Button theme="primary" label="Option 2" />
        <Button theme="primary" label="Option 3" />
      </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#abc',
    // alignItems: 'center',
    // justifyContent: 'center',
    fontFamily: 'arial',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
    gap: 15,
  },

});
