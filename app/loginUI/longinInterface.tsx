import { View, Text, StyleSheet, Alert, Button, TouchableOpacity, FlatList, useWindowDimensions } from "react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { DrawerLayout } from 'react-native-gesture-handler';
import { getDatabase, ref, onValue, get, off } from "firebase/database";
import { cong } from "../src/cong";
import LoginId from "../getData/loginId";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginUpdate from "./loginUpdate";
import OrderList from './Orderlist';
import Competition from './Competition';
import { encrypt ,decrypt } from '../crypto/jmjm';

type NavItem = {
  id: string;
  title: string;
  page: string;
};

type Order = {
  id: string;
  status: string;
  user: string;
  date: string;
  price: number;
};

const NAV_ITEMS: NavItem[] = [
  { id: '1', title: '用户信息', page: 'info' },
  { id: '2', title: '更新资料', page: 'update' },
  { id: '3', title: '订单管理', page: 'orders' },
  { id: '4', title: '比賽資料', page: 'competition' },
];

const LoginInterface = () => {
  const [loging, setLoging] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const email =decrypt(loging?.email);
  const id =decrypt(loging?.id);
  useEffect(() => {
    const fetchLogin = async () => {
      const loginData = await LoginId();
      setLoging(loginData);
    };
    fetchLogin();
  }, []);
  const [currentPage, setCurrentPage] = useState('info');
  const drawer = useRef<DrawerLayout>(null);
  const { width } = useWindowDimensions();

  // 获取订单数据（保持原有逻辑）
  const fetchOrders = useCallback((userId: string) => {
    // ... 保持原有fetchOrders实现
    const db = getDatabase(cong);
    const orderRef = ref(db, 'order/');

    onValue(orderRef, (snapshot) => {
      if (!snapshot.exists()) {
        setOrders([]);
        return;
      }

      const orderData = snapshot.val();
      const ordersArray = Object.keys(orderData).map(async key => {
        const versionNum = orderData[key].VersionNum;
        const orderDetailRef = ref(db, `order/${key}/${versionNum}`);

        const detailSnapshot = await get(orderDetailRef);
        const orderDetails = detailSnapshot.val();
        return orderData[key].user === userId ? {
          id: key,
          ...orderDetails
        } : null;
      });

      Promise.all(ordersArray).then(results => {
        setOrders(results.filter(Boolean) as Order[]);
      });
    });
    return () => {
      off(orderRef);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const userId = loging?.id;
      if (userId) {
        fetchOrders(userId);
      }
    };
    fetchData();
  }, [loging, fetchOrders]);

  // 导航处理
  const handleNavPress = useCallback((page: string) => {
    setCurrentPage(page);
    drawer.current?.closeDrawer();
  }, []);

  // 抽屉导航视图
  const renderNavigation = () => (
    <View style={styles.drawerContainer}>
      <FlatList
        data={NAV_ITEMS}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.navItem,
              currentPage === item.page && styles.activeItem
            ]}
            onPress={() => handleNavPress(item.page)}
          >
            <Text style={styles.navText}>{item.title}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );

  // 根据当前页面渲染内容
  const renderContent = () => {
    switch (currentPage) {
      case 'update':
        return <LoginUpdate />;
      case 'orders':
        return (
          <View style={styles.ordersContainer}>
            {orders.length > 0 ? (
                <OrderList
                orders={orders}
                onStatusChange={(orderId, newStatus) => {
                  console.log(`Order ${orderId} status changed to ${newStatus}`);
                }}
              />
            ) : (
              <Text style={styles.emptyText}>暂无订单记录</Text>
            )}
          </View>
        );
      case 'competition':
        return (
          <Competition />
        );
      case 'info':
      default:
        const handleLogout = async () => {
          try {
            await AsyncStorage.removeItem('Login'); // Clear user token or any stored session data
            <Text style={styles.title}>{loging ? loging.id : "未登录用户"}</Text>
          } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("登出失败", "请稍后重试");
          }
        };
        return (
          <View style={styles.userInfo}>
            <Text style={styles.title}>{(email) || "未登录用户"}</Text>
            <Text style={styles.infoText}>用户ID: {(id) || "N/A"}</Text>
            <Text style={styles.infoText}>
              姓名: {[loging?.firstName, loging?.lastName].filter(Boolean).join(' ') || "未设置"}
            </Text>
            <Button title="登出" onPress={handleLogout} />
          </View>
        );
    }
  };

  return (
    <DrawerLayout
      ref={drawer}
      drawerWidth={width * 0.7}
      drawerPosition="right"
      renderNavigationView={renderNavigation}
    >
      <View style={styles.mainContainer}>
        {/* 汉堡菜单按钮 */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => drawer.current?.openDrawer()}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        {renderContent()}
      </View>
    </DrawerLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 50,
  },
  navItem: {
    paddingVertical: 18,
    paddingHorizontal: 25,
  },
  activeItem: {
    backgroundColor: '#e8f4ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  navText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 15,
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 24,
    color: '#333',
  },
  userInfo: {
    marginTop: 60,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1a1a1a',
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginVertical: 8,
  },
  ordersContainer: {
    marginTop: 20,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  },
});

export default LoginInterface;