
import { Stack } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity,Alert, Image, StyleSheet, Dimensions } from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { cong } from '../src/cong';
import AddtoCard from "./AddtoCard";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2 - 10;

const ProductList = () => {
  const [selectedSection, setSelectedSection] = useState<'cards' | 'galleries'>('cards');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [products, setProducts] = useState<Array<any>>([]);

  useEffect(() => {
    const db = getDatabase(cong);
    const path = selectedSection === 'cards' ? 'cards/' : 'galleries/';
    const productsRef = ref(db, path);

    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList = Object.values(data)
          .filter((product: any) => product.discount > 0) // 只顯示有折扣的商品
          .map((product: any) => ({
            ...product,
            idKey: selectedSection === 'cards' ? product.cardId : product.galleryId
          }));
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    });

    return () => unsubscribe();
  }, [selectedSection]);

  const handleSelect = (idKey: string) => {
    setSelectedItems(prev => 
      prev.includes(idKey) 
        ? prev.filter(i => i !== idKey) 
        : [...prev, idKey]
    );
  };

  const handleAddToCart = () => {
    const selectedProducts = selectedItems.map(idKey => {
      const product = products.find(c => c.idKey === idKey);
      return product ? product.idKey : '未知商品';
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


  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.card,
        selectedItems.includes(item.idKey) && styles.selectedCard
      ]}
      onPress={() => handleSelect(item.idKey)}
    >
         {item.discount > 0 && ( // 顯示折扣標籤
           <View style={styles.discountBadge}>
             <Text style={styles.discountText}>{item.discount}% OFF</Text>
           </View>
         )}
      <Image 
        source={{ uri: item.image || item.imageUrl }} 
        style={styles.cardImage}
        resizeMode="contain"
      />
      <View style={styles.cardInfo}>
        <Text style={styles.idText}>{item.idKey}</Text>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${(item.price - (Number(item.discount) / 100)).toFixed(2)}</Text>
          <Text style={styles.quantity}>剩餘: {item.quantity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
     
    <View style={styles.container}>
      <Text style={styles.title}>特價專區</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedSection === 'cards' && styles.activeTab]}
          onPress={() => setSelectedSection('cards')}
        >

          <Text style={styles.tabText}>單卡專區</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedSection === 'galleries' && styles.activeTab]}
          onPress={() => setSelectedSection('galleries')}
        >
          <Text style={styles.tabText}>盒子專區</Text>
        </TouchableOpacity>
      </View>

      {/* <Text style={styles.selectedText}>已選擇: {selectedItems.join(', ') || '無'}</Text> */}
      
      <FlatList
        data={products}
        keyExtractor={item => item.idKey}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
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
};

const styles = StyleSheet.create({
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
      idKey: {
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
  // ...保留原有樣式...
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#333',
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
  idText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
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
});

export default ProductList;