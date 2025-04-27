import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { getDatabase, ref, get, update, onValue, DataSnapshot, off } from 'firebase/database';
import { cong } from '../src/cong';
import Login from '../getData/loginId';
import { useNavigation } from '@react-navigation/native';

type CartItem = {
  key: string;
  name: string;
  quantity: number;
  price?: number;
  image?: string;
  selected: boolean; // 新增选中状态
  type: 'card' | 'gallery'; // 商品分类
};



const ShoppingCartScreen = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
    const navigation = useNavigation();

  // 合并选中状态的帮助函数
  const mergeSelectedState = (prevItems: CartItem[], newItems: CartItem[]) => {
    const prevMap = new Map(prevItems.map(item => [item.key, item]));
    return newItems.map(newItem => ({
      ...newItem,
      selected: prevMap.get(newItem.key)?.selected || false,
    }));
  };

  useEffect(() => {
    let shoppingRef: ReturnType<typeof ref>; // 明确类型声明
    let unsubscribe: () => void;
  
    const setupRealtimeUpdates = async () => {
      try {
        const loginInfo = await Login();
        const userId = loginInfo?.id;
        if (!userId) {
          setLoading(false);
          return;
        }
  
        const db = getDatabase(cong);
        shoppingRef = ref(db, `user/${userId}/Shopping`); // 使用正确路径格式
    // ...其他useEffect代码保持不变，只修改数据处理部分...
    const handleShoppingUpdate = async (snapshot: DataSnapshot) => {
      try {
        const shoppingData = snapshot.val() || {};
        
        const itemPromises = Object.entries(shoppingData).map(
          async ([itemId, quantity]) => {
            // ...数据获取逻辑保持不变...
               // 同时查询两个数据源
                            const [gallerySnap, cardSnap] = await Promise.all([
                              get(ref(db, `galleries/${itemId}`)),
                              get(ref(db, `cards/${itemId}`))
                            ]);
              
                            // 处理商品数据逻辑
                            const galleryData = gallerySnap.val();
                            const cardData = cardSnap.val();
              
            return {
              key: itemId,
              name: galleryData?.name || cardData?.name || '未知商品',
              image: galleryData?.imageUrl || cardData?.image,
              quantity: quantity as number,
              price: calculatePrice( 
                galleryData?.price || cardData?.price,
                galleryData?.discount || cardData?.discount),
              selected: false, // 初始化选中状态
            };
          }
        );

        const processedItems = await Promise.all(itemPromises);
        setItems(prev => mergeSelectedState(prev, processedItems));
      } catch (error) {
        console.error('数据处理失败:', error);
      } finally {
        setLoading(false);
      }
    };
    // ...其余useEffect代码不变...
       // 设置实时监听
            unsubscribe = onValue(shoppingRef, handleShoppingUpdate, {
              onlyOnce: false // 确保持续监听
            });
      
            // 初始数据获取
            get(shoppingRef).then(handleShoppingUpdate);
          } catch (error) {
            console.error('监听设置失败:', error);
            setLoading(false);
          }
        };
      
        setupRealtimeUpdates();
      
        // 清理函数
        return () => {
          if (unsubscribe) unsubscribe();
          if (shoppingRef) off(shoppingRef);
        };
  }, []);

  // 切换单个商品选中状态
  const toggleItemSelection = (itemKey: string) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.key === itemKey ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    const allSelected = items.every(item => item.selected);
    setItems(prevItems => 
      prevItems.map(item => ({ ...item, selected: !allSelected }))
    );
  };


  const handleDeleteSelected = async () => {
    try {
      const loginInfo = await Login();
      const userId = loginInfo?.id;
      if (!userId || selectedCount === 0) return;
  
      const db = getDatabase(cong);
      const updates: { [key: string]: null } = {};
  
      // 构建更新对象
      items.forEach(item => {
        if (item.selected) {
          updates[`user/${userId}/Shopping/${item.key}`] = null;
        }
      });
  
      // 执行批量删除
      await update(ref(db), updates);
      
      // 更新本地状态
      setItems(prev => prev.filter(item => !item.selected));
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除商品失败，请重试');
    }
  };
  
  const handleCheckout = async ()=> {
    try {
      const selectedItems = items.filter(item => item.selected);
      
      // 检查是否选择了商品
      if (selectedItems.length === 0) {
        alert('请先选择要购买的商品');
        return;
      }

      // 获取实时数据库实例
      const db = getDatabase();
      
      // 并行检查所有商品库存
      const stockPromises = selectedItems.map(async (item) => {
        // 同时检查两个路径
        const [cardSnap, gallerySnap] = await Promise.all([
          get(ref(db, `cards/${item.key}`)),
          get(ref(db, `galleries/${item.key}`))
        ]);
      
        // 确定商品存在的路径
        const existingPaths = [
          { path: 'cards', data: cardSnap.val() },
          { path: 'galleries', data: gallerySnap.val() }
        ].filter(({ data }) => data !== null);
      
        // 错误处理
        if (existingPaths.length === 0) {
          throw new Error(`商品 ${item.key} 不存在`);
        }
        if (existingPaths.length > 1) {
          throw new Error(`商品 ${item.key} 在多个分类中存在`);
        }
      
        // 获取商品数据
        const [validPath] = existingPaths;
        const productData = validPath.data;
      
        // 库存检查
        if (productData.quantity <= 0) {
          throw new Error(`商品 ${item.key} 已售罄`);
        }
        if (item.quantity > productData.quantity) {
          throw new Error(`商品 ${item.key} 库存不足 (剩余 ${productData.quantity} 件)`);
        }
      
        // 返回验证通过的分类信息（可选）
        return {
          category: validPath.path,
          productId: item.key
        };
      });

      // 等待所有检查完成
      await Promise.all(stockPromises);

      // 所有检查通过后跳转
      navigation.navigate('PopPayment/paymentApp', {
        selectedItems: selectedItems});

      console.log('已选商品:', selectedItems);
    } catch (error) {
      // 错误处理
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unknown error occurred');
      }
      console.error('库存检查失败:', error);
      
      // 自动刷新商品数据
      if (error instanceof Error && error.message.includes('库存')) {
        refreshInventoryData();
      }
    }
  };


  const handleQuantityChange = async (itemKey: string, newQuantity: number) => {
    if (newQuantity < 1) return; // 数量不能小于1

    try {
      setUpdatingId(itemKey);
      const loginInfo = await Login();
      const userId = loginInfo?.id;
      
      if (!userId) return;

      const db = getDatabase(cong);
      const updates = {
        [`user/${userId}/Shopping/${itemKey}`]: newQuantity
      };

      // 同时更新本地状态和Firebase
      setItems(prev => 
        prev.map(item => 
          item.key === itemKey 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );

      await update(ref(db), updates);
    } catch (error) {
      console.error('更新失败:', error);
      // 回滚本地状态
      setItems(prev => 
        prev.map(item => 
          item.key === itemKey 
            ? { ...item, quantity: items.find(i => i.key === itemKey)?.quantity || 1 } 
            : item
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // 获取实时价格函数
const getLatestPrice = async (productId: string) => {
  const db = getDatabase();
  const priceRef = ref(db, `prices/${productId}`);
  const snapshot = await get(priceRef);
  return snapshot.val() || 0;
};

// 库存数据刷新函数
const refreshInventoryData = () => {
  // 实现你的数据刷新逻辑
  console.log('正在刷新库存数据...');
};
  
  // 渲染每个商品项
  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        onPress={() => toggleItemSelection(item.key)}
        style={[
          styles.checkbox,
          { backgroundColor: item.selected ? '#007AFF' : 'transparent' }
        ]}
      >
        {item.selected && (
          <Text style={{ color: 'white', fontSize: 16 }}>✓</Text>
        )}
      </TouchableOpacity>
  
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
          resizeMode="contain"
        />
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.key, item.quantity - 1)}
            disabled={updatingId === item.key}
          >
            <Text style={{ fontSize: 18 }}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>
            {updatingId === item.key ? (
              <ActivityIndicator size="small" color="#000" />
            ) : item.quantity}
          </Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.key, item.quantity + 1)}
            disabled={updatingId === item.key}
          >
            <Text style={{ fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        </View>
        
        {item.price && (
          <Text style={styles.priceText}>
            ¥{(item.price * item.quantity).toFixed(2)}
          </Text>
        )}
      </View>
    </View>
  );

  const selectedCount = items.filter(item => item.selected).length;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>购物车为空</Text>}
        ListHeaderComponent={
          <TouchableOpacity 
            onPress={toggleSelectAll}
            style={styles.selectAllButton}
          >
            <Text style={styles.selectAllButton}>
              {items.length > 0 && items.every(item => item.selected) 
                ? '取消全选' 
                : '全选'}
            </Text>
          </TouchableOpacity>
        }
      />
      
     

      <View style={styles.actionBar}>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton, 
          selectedCount === 0 && styles.disabledButton]}
        onPress={handleDeleteSelected}
        disabled={selectedCount === 0}
      >
        <Text style={styles.actionButtonText}>删除({selectedCount})</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
   style={[styles.actionButton, selectedCount === 0 && styles.disabledButton]}
   onPress={handleCheckout}
   disabled={selectedCount === 0}
>
        <Text style={styles.actionButtonText}>
          已选择 {selectedCount} 件商品
        </Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {

    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    padding: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
    color: '#666',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#C0C0C0',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  selectedButton: {
    backgroundColor: '#4CD964',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
});

export default ShoppingCartScreen;

function calculatePrice(price: number | undefined, discount: number | undefined): number {
    if (!price) return 0; // 如果价格未定义，返回0
    if (discount && discount > 0 && discount <= 100) {
      return price * (1 - discount / 100); // 应用折扣
    }
    return price; // 如果没有折扣，返回原价
  }