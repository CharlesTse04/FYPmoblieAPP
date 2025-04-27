import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { getDatabase, ref, get } from "firebase/database";
import { cong } from '../src/cong'; // 確保 Firebase 配置正確
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Shopping from '../ShoppingCard/ShoppingList';


//import LoginScreen from "../getData/LoginScreen";


const explore = () => {
    return (
        <View>
            <Text>
                your ShoppingCart
            </Text>
            <Shopping />
  
        </View>
    ); // Replace with your actual component implementation
}

export default explore;
