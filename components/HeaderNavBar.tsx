import React from 'react';
import{StyleSheet,Dimensions, Text , TouchableOpacity,View} from 'react-native';

const windowWidth = Dimensions.get('window').width;

type CustomHeaderProps = {
    title:string;
    onBackPress?: () => void;
};

const HeaderNavBar: React.FC<CustomHeaderProps> = ({title, onBackPress}) =>{
    return (
        <View style={styles.container}>
            <Text style={styles.title}> notif</Text>
            <Text style={styles.title}> {title}</Text>
            <Text style={styles.title}> profile</Text>
        </View>
    )
}

export default HeaderNavBar;

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: '#6200ee',
        gap: windowWidth/3,
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