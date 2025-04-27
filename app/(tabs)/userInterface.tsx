import React, { useEffect, useState } from "react";
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
//import LoginScreen from "../getData/LoginScreen";
import LoginId from "../getData/loginId";
import LoginUI from "../loginUI/login";
import LoginInterfaceUI from "../loginUI/longinInterface"; // 修正拼写



const userInterface = () => {
  const [loginId, setLoginId] = useState<any>(null);

  // 获取登录信息的函数
  const fetchLoginId = async () => {
    const id = await LoginId();
    setLoginId(id);
  };

  useEffect(() => {
    fetchLoginId(); // 初次加载时获取登录信息
  }, []);

  // 监听 loginId 的变化，如果需要可以在这里添加逻辑
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLoginId(); // 定期获取登录信息
    }, 2000); // 每5秒检查一次

    return () => clearInterval(interval); // 清理定时器
  }, []);

  return (
    <View style={styles.container}>
      {loginId?.id ? (
        <LoginInterfaceUI />
      ) : (
        <LoginUI />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: '#f5f5f5',
  }
});

export default userInterface;