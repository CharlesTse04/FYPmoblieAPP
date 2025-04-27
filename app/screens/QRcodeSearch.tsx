import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function QRcodeSearch() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>二维码搜索</Text>
      <Text style={styles.instructions}>请扫描二维码以查找信息。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});