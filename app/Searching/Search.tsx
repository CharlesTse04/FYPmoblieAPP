import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions, Alert } from "react-native";
import { getDatabase, ref, onValue, update } from "firebase/database"; // Import update
import { cong } from '../src/cong';
import AddtoCard from '../product/AddtoCard';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2 - 10;

interface CombinedListProps {
  searchQuery: string;
}

function CombinedList() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [allCards, setAllCards] = useState<CardItem[]>([]);
  const route = useRoute();
  const searchQuery = route.params?.searchQuery || '';
  interface CardItem {
    galleryId?: string;
    cardId?: string;
    name: string;
    price: number;
    discount: number;
    quantity: number;
    imageUrl?: string;
    image?: string;
  }

  useEffect(() => {
    const db = getDatabase(cong);
  
    const handleData = (snapshot: DataSnapshot, isGallery: boolean) => {
      const data = snapshot.val();
      const rawCards = data ? Object.values(data) as CardItem[] : [];
      
      // 添加即时过滤
      const filteredCards = rawCards.filter(card => {
        if (card.quantity <= 0) return false;
        if (!searchQuery) return true;
  
        const lowerQuery = searchQuery.toLowerCase();
        if (isGallery) {
          return card.name.toLowerCase().includes(lowerQuery);
        }
        return (card.engName?.toLowerCase().includes(lowerQuery) || 
                card.name.toLowerCase().includes(lowerQuery));
      });
  
      setAllCards(prev => [
        ...prev.filter(item => 
          isGallery ? !item.galleryId : !item.cardId
        ),
        ...filteredCards
      ]);
    };
  
    const galleryRef = ref(db, 'galleries/');
    const galleryUnsubscribe = onValue(galleryRef, (snapshot) => {
      handleData(snapshot, true);
    });
  
    const cardRef = ref(db, 'cards/');
    const cardUnsubscribe = onValue(cardRef, (snapshot) => {
      handleData(snapshot, false);
    });
  
    return () => {
      galleryUnsubscribe();
      cardUnsubscribe();
    };
  }, [searchQuery]); // 添加searchQuery依赖

  const handleBuy = (itemId: string) => {
    setSelectedItems(prev => prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]);
  };

  const handleAddToCart = async () => {
    const db = getDatabase(cong);
    
    // Update quantities in Firebase
    for (const itemId of selectedItems) {
      const item = allCards.find(c => c.galleryId === itemId || c.cardId === itemId);
      if (item) {
        const path = item.galleryId ? `galleries/${item.galleryId}` : `cards/${item.cardId}`;
        const itemRef = ref(db, path);
        const newQuantity = item.quantity - 1;
        await update(itemRef, { quantity: newQuantity });
      }
    }

    // Add to cart and reset selected items
    await AddtoCard(selectedItems);
    setSelectedItems([]);
  };

  const confirmAddToCart = () => {
    const selectedProducts = selectedItems.map(itemId => {
      const product = allCards.find(c => c.galleryId === itemId || c.cardId === itemId);
      return product ? product.name : '未知商品';
    });

    Alert.alert(
        
      '已選擇商品',
      selectedProducts.join('\n'),
      [
        { text: '取消' },
        {
          text: '確認',
          onPress: handleAddToCart
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>商品列表</Text>
        
        <FlatList
            data={allCards}
            keyExtractor={item => item.galleryId ?? item.cardId ?? ''}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[styles.card, (item.galleryId && selectedItems.includes(item.galleryId)) || (item.cardId && selectedItems.includes(item.cardId)) ? styles.selectedCard : null]}
                    onPress={() => handleBuy(item.galleryId ?? item.cardId ?? '')}
                >
                    {item.discount > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{item.discount}% OFF</Text>
                        </View>
                    )}
                    <Image source={{ uri: item.imageUrl || item.image }} style={styles.cardImage} resizeMode="contain" />
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.price}>${(item.price - (item.discount / 100)).toFixed(2)}</Text>
                    </View>
                </TouchableOpacity>
            )} />

        {selectedItems.length > 0 && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                <Text style={styles.addButtonText}>加入購物車 ({selectedItems.length})</Text>
            </TouchableOpacity>
        )}
    </View>
);
}
  // Rest of the component remains the same
  // ... (render method and styles)


const styles = StyleSheet.create({
  // ... existing styles
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
  galleryId: {
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

export default CombinedList;