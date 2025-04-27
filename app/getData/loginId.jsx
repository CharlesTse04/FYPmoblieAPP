// getLoginId.jsx、
/*import AsyncStorage from '@react-native-async-storage/async-storage';
const getLoginId = async () => {
    /*const userData = localStorage.getItem('Login');
    if (userData) {
        return JSON.parse(userData); // Parse the JSON and return the object
    }
    return null; // Return null if no user data is found
    try {
        const userData = await AsyncStorage.getItem('Login');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting login ID:', error);
        return null;
    }
};

export default getLoginId;*/
// hooks/useLoginId.ts
/*import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useLoginId = () => {
  const [loginId, setLoginId] = useState(null);

  useEffect(() => {
    const loadLoginId = async () => {
      try {
        const data = await AsyncStorage.getItem('Login');
        if (data) setLoginId(JSON.parse(data));
      } catch (error) {
        console.error('Error loading login ID:', error);
      }
    };
    loadLoginId();
  }, []);

  return loginId;
};

export default useLoginId;*/

import AsyncStorage from '@react-native-async-storage/async-storage';

const getLoginId = async () => {
    try {
        const userData = await AsyncStorage.getItem('Login');
        if (userData) {
            return JSON.parse(userData); // 解析 JSON 并返回对象
        }
        return null; // 如果没有找到用户数据，则返回 null
    } catch (error) {
        console.error('Error retrieving data', error);
        return null; // 处理错误并返回 null
    }
};

export default getLoginId;