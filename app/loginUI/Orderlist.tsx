// orderList.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { getDatabase, ref, update, get } from 'firebase/database';
import { cong } from '../src/cong';
import { useNavigation } from '@react-navigation/native';

export type Order = {
  id: string;
  status: string;
  user: string;
  date: string;
  price: number;
  card?: {
    [key: string]: number;
  };
};

interface OrderListProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: string) => void;
  onRefresh?: () => Promise<void>;
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  onStatusChange,
  onRefresh,
}) => {

  const [refreshing, setRefreshing] = useState(false);
  const [selectionLog, setSelectionLog] = useState<Order[]>([]);
  const navigation = useNavigation();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    try {
      setRefreshing(true);
      await onRefresh();
    } catch (error) {
      Alert.alert('刷新失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      Alert.alert(
        '确认取消',
        '确定要取消此订单吗？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确定',
            onPress: async () => {
              const db = getDatabase(cong);
              const versionNumRef = ref(db, `order/${orderId}/VersionNum`);
              const snapshot = await get(versionNumRef);

              if (!snapshot.exists()) {
                Alert.alert('错误', '找不到订单版本号');
                return;
              }

              const versionNum = snapshot.val();
              const orderDetailRef = ref(db, `order/${orderId}/${versionNum}`);

              await update(orderDetailRef, {
                status: '已取消',
              });

              onStatusChange(orderId, '已取消');
              Alert.alert('成功', '订单已取消');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('取消操作失败:', error);
      Alert.alert('错误', '取消失败，请稍后重试');
    }
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <Text>订单号: {item.id}</Text>
      <Text>日期: {item.date}</Text>
      <Text>金额: ¥{item.price.toLocaleString()}</Text>

      <View style={styles.statusRow}>
        <Text>状态: {item.status}</Text>
        {item.status !== '已取消' && item.status !== 'complete' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancel(item.id)}>
            <Text style={styles.buttonText}>取消订单</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
  style={styles.detailButton}
  onPress={() => {
      const isCollapsing = selectedOrderId === item.id;
      const newState = isCollapsing ? null : item.id;
      setSelectedOrderId(newState);

      // Update selectionLog
      setSelectionLog(prevLog => {
        const updatedLog = [...prevLog, item];

        return updatedLog;
      });
      console.log(item);

    navigation.navigate('loginUI/Orderdetail', {
      item: item // Pass the selected item directly
    });
  }}>
  <Text style={styles.buttonText}>
    查看详情
  </Text>
</TouchableOpacity>

    </View>
  );

  return (
    <FlatList
      data={orders}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      refreshControl={
        onRefresh && (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        )
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>暂无订单记录</Text>
      }
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  orderItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cardDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  cardItem: {
    color: '#666',
    marginLeft: 8,
    lineHeight: 20,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 16,
  },
});

export default OrderList;