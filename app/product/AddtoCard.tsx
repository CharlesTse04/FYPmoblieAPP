import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'; // 添加 Alert
import { getDatabase, ref, set, get } from 'firebase/database';
import { cong } from '../src/cong';
import Login from '../getData/loginId';

const addToCart = async (selectedItems: string[]) => {
  try {
    const loginResult = await Login();
    const userId = loginResult.id;
    
    if (!userId) {
      Alert.alert('錯誤', '你沒有登入，請先登入帳號'); // 顯示彈窗提示
      return; // 直接返回不執行後續操作
    }

    const db = getDatabase(cong);

    for (const productId of selectedItems) {
      const cartRef = ref(db, `user/${userId}/Shopping/${productId}`);
      const snapshot = await get(cartRef);

      if (snapshot.exists()) {
        const currentQuantity = snapshot.val();
        await set(cartRef, currentQuantity + 1);
      } else {
        await set(cartRef, 1);
      }
    }

    Alert.alert('成功', '商品已加入購物車'); // 可選的成功提示
  } catch (error) {

    Alert.alert('錯誤', '操作失敗，請檢查網路連線'); // 通用錯誤提示
  }
};

export default addToCart;