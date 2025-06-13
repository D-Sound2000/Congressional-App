import React from 'react';
import{StyleSheet,Dimensions, Text ,View, SafeAreaView,TouchableOpacity} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Link} from 'expo-router';

const windowWidth = Dimensions.get('window').width;

type CustomHeaderProps = {
    title:string;
    onBackPress?: () => void;
};



const HeaderNavBar: React.FC<CustomHeaderProps> = ({title, onBackPress}) =>{
    return (
        <SafeAreaView>
            <View style={styles.container}>
                <Link href="/">
                    <Ionicons name={'person-circle-outline'} color={'white'} size={48} />
                </Link>

                     <Text style={styles.title}> {title}</Text>
               
               <Link href="/">
                    <Ionicons name={'log-out-outline'} color={'white'} size={48} />
               </Link>

            </View>
        </SafeAreaView>
    )
}

export default HeaderNavBar;

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: '#6200ee',
        justifyContent:'space-between',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButton: {
        color: '#fff',
        fontSize: 24,
        marginRight: 12,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    

});