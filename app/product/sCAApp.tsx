
import { Stack } from "expo-router";
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Dimensions,
  Alert  // 新增Alert组件
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { cong } from '../src/cong';
import AddtoCard from './AddtoCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2 - 10;

const CardList = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [cards, setCards] = useState<Array<{ 
    id: string; 
    name: string; 
    price: number; 
    image: string; 
    cardId: string; 
    quantity: number 
  }>>([]);
  const [filteredCards, setFilteredCards] = useState<Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    cardId: string;
    quantity: number;
    discount: number;
  }>>([]);

  useEffect(() => {
    const db = getDatabase(cong);
    const cardsRef = ref(db, 'cards/');

    const unsubscribe = onValue(cardsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const cardsList = Object.values(data) as Array<{
          id: string;
          name: string;
          price: number;
          image: string;
          cardId: string;
          quantity: number;
          discount: number;
        }>;
        setCards(cardsList);
        setFilteredCards(cardsList.filter(card => card.quantity > 0));
      } else {
        setCards([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleBuy = (item: { cardId: string }): void => {
    setSelectedItems(prev => 
      prev.includes(item.cardId)
        ? prev.filter(i => i !== item.cardId)
        : [...prev, item.cardId]
    );
  };

  // 新增加入购物车处理函数
  const handleAddToCart = () => {
    const selectedProducts = selectedItems.map(cardId => {
      const product = cards.find(c => c.cardId === cardId);
      return product ? product.cardId : '未知商品';
    });

    Alert.alert(
      '已選擇商品',
      selectedProducts.join('\n'),
      [
        { 
          text: '確認', 
          onPress: async () => {
            await AddtoCard(selectedItems); // Call addToCart here
            setSelectedItems([]); // Clear selection
          }
        },
        { text: '取消' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>單卡專區</Text>
      {/* <Text style={styles.selectedText}>
        已選擇: {selectedItems.length} 件商品
      </Text> */}

      <FlatList
        data={filteredCards}
        keyExtractor={item => item.cardId}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.card,
              selectedItems.includes(item.cardId) && styles.selectedCard
            ]}
            onPress={() => handleBuy(item)}
          >
          {item.discount > 0 && ( // 顯示折扣標籤
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{item.discount}% OFF</Text>
                    </View>
         )}
            <Image 
              source={{ uri: item.image }} 
              style={styles.cardImage}
              resizeMode="contain"
            />
            <View style={styles.cardInfo}>
              <Text style={styles.cardId}>{item.cardId}</Text>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${(item.price-(item.discount/100)).toFixed(2)}</Text>
                <Text style={styles.quantity}>剩餘: {item.quantity}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* 新增底部按钮 */}
      {selectedItems.length > 0 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addButtonText}>
            加入購物車 ({selectedItems.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ...保持原有样式不变...
  container: {

    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  listContent: {
    paddingBottom: 190,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007bff',
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardInfo: {
    paddingHorizontal: 5,
  },
  cardId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    color: '#e91e63',
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 12,
    color: '#666',
  },
  selectedText: {
    marginVertical: 10,
    fontSize: 16,
    color: '#666',
  },
  // 新增按钮样式
  addButton: {
    position: 'absolute',
    top: 700,        // 垂直置中
    left: 20,
    right: 20,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24, // Adjusted for better visibility
    fontWeight: '600',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e91e63',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CardList;