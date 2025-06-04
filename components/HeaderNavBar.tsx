import React from 'react';
import{StyleSheet, Text , TouchableOpacity,View} from 'react-native';

type CustomHeaderProps = {
    title:string;
    onBackPress?: () => void;
};

const HeaderNavBar: React.FC<CustomHeaderProps> = ({title, onBackPress}) =>{
    return (
        <View style={styles.container}>
            {onBackPress && (
                <TouchableOpacity onPress={onBackPress}>
                    <Text style={styles.backButton}>back</Text>
                </TouchableOpacity>
            )}
            <Text style={styles.title}> {title}</Text>
        </View>
    )
}

export default HeaderNavBar;

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: '#6200ee',
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