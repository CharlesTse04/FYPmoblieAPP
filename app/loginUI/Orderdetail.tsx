
import { useRoute } from '@react-navigation/native';

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const OrderDetail = () => {
  // 日期格式化
  const route = useRoute();
  const item = route.params?.item || [];
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };



  // 支付方式映射
  const paymentMethodMap: { [key: string]: string } = {
    alipay: '支付宝',
    wechat: '微信支付',
    creditcard: '信用卡'
  };

  // 状态样式映射
  const statusStyle = (status: string) => {
    switch (status) {
      case '未發貨':
        return styles.statusPending;
      case '已發貨':
        return styles.statusShipped;
      case '已取消':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* 订单基本信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>订单信息</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>订单编号：</Text>
            <Text style={styles.infoValue}>{item.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>下单时间：</Text>
            <Text style={styles.infoValue}>{formatDate(item.date)}</Text>
          </View>
        </View>

        {/* 商品信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>商品明细</Text>
          {Object.entries(item.card).map(([productId, quantity]) => (
            <View key={productId} style={styles.productItem}> d
              <Text style={styles.productId}>{productId}</Text>
              <Text style={styles.productQuantity}>x {quantity}</Text>
            </View>
          ))}
        </View>

        {/* 支付信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>支付信息</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>支付方式：</Text>
            <Text style={styles.infoValue}>
              {paymentMethodMap[item.method] || item.method}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>支付金额：</Text>
            <Text style={styles.amount}>¥{item.price.toFixed(2)}</Text>
          </View>
        </View>

        {/* 订单状态 */}
        <View style={[styles.statusTag, statusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>

        {/* 负责员工（如果有） */}
        {item.employee && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>处理信息</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>处理人员：</Text>
              <Text style={styles.infoValue}>{item.employee}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#666',
    width: '30%',
  },
  infoValue: {
    color: '#333',
    width: '70%',
    textAlign: 'right',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
  },
  productId: {
    color: '#444',
  },
  productQuantity: {
    color: '#007AFF',
    fontWeight: '500',
  },
  amount: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusTag: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusPending: {
    backgroundColor: '#FF9800',
  },
  statusShipped: {
    backgroundColor: '#4CAF50',
  },
  statusCancelled: {
    backgroundColor: '#F44336',
  },
  statusDefault: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default OrderDetail;