// app/(tabs)/index.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Animated,
  PanResponder,
  ScrollView,
} from 'react-native';
import Button from '@/components/Button';
import { Link } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerLayout } from 'react-native-gesture-handler';
import UProduct from '../product/uProduct';
import SCA from '../product/sCAApp';
import SA from '../product/sAApp';
import POP from '../product/pOPApp';
import CSA from '../product/cardSaleApp';
import { Input } from '@rneui/base';
import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/IconSymbol';

type NavItem = {
  id: string;
  title: string;
  page: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');


export default function HomeScreen() {
  const drawer = useRef<DrawerLayout>(null);
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState('home');

  // 导航数据
  const NAV_ITEMS: NavItem[] = [
    { id: '1', title: '主頁', page: 'home' },
    { id: '2', title: '未開封商品', page: 'UP' },
    { id: '3', title: '單卡專區', page: 'SCA' },
    { id: '4', title: '特價專區', page: 'SA' },
    { id: '5', title: '預定商品', page: 'POP' },
    { id: '6', title: '卡牌回收', page: 'cardSale' },
  ];

  const handleNavPress = (page: string) => {
    setCurrentPage(page);
    drawer.current?.closeDrawer();
  };

  const navigationView = () => (
    <View style={styles.navigationContainer}>
      <FlatList
        data={NAV_ITEMS}
        keyExtractor={(item) => item.id}
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );

  const images = [
    require('../img/SV8a.webp'),
    require('../img/unnamed.jpg'),
    require('../img/V4n2Zb.webp'),
    require('../img/SV8a_2.webp')
  ];

  const extendedImages = [
    images[images.length - 1],
    ...images,
    images[0]
  ];

  const [currentIndex, setCurrentIndex] = useState(1);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleMomentumScrollEnd = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);

    if (newIndex === 0) {
      // 滚动到扩展数组的倒数第二项（原数组最后一项）
      flatListRef.current?.scrollToIndex({
        index: extendedImages.length - 2,
        animated: false,
      });
      setCurrentIndex(extendedImages.length - 2);
    } else if (newIndex === extendedImages.length - 1) {
      // 滚动到扩展数组的第二项（原数组第一项）
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
      setCurrentIndex(1);
    } else {
      setCurrentIndex(newIndex);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex % (images.length)) + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      {/*<Link href="/screens/DetailsScreen" asChild>
        <Button label="前往详情页" />
      </Link>
      
      <Link href="/screens/ImageSearch" asChild>
        <Button label="图片搜索" />
      </Link>*/}
      <DrawerLayout
        ref={drawer}
        drawerWidth={Dimensions.get('window').width * 0.5}
        drawerPosition="right"
        renderNavigationView={navigationView}
        edgeWidth={Dimensions.get('window').width * 0.5}
        drawerType="front"
        overlayColor="rgba(0,0,0,0.2)"
        drawerLockMode="unlocked"
        //drawerLockMode={drawerLockMode}
        useNativeAnimations={true}
        statusBarBackgroundColor="transparent"
        style={{ backgroundColor: 'transparent' }}
      >
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            {/* 图片搜索按钮 */}
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Searching/imageSeach')}>
              <IconSymbol name="camera.fill" size={24} color="#666" />
            </TouchableOpacity>

            {/* 搜索输入框 */}
            <TextInput
              style={styles.searchInput}
              placeholder="搜尋"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* 搜索图标按钮 */}
            <TouchableOpacity style={styles.iconButton} onPress={() => {
              console.log(searchQuery);
              navigation.navigate('Searching/Search', {
                searchQuery: searchQuery // 显式声明更安全
              });
            }}>
              <Ionicons name="search" size={24} color="#666" />
            </TouchableOpacity>

            {/* 打开抽屉 */}
            <TouchableOpacity style={styles.iconButton} onPress={() => drawer.current?.openDrawer()}>
              <IconSymbol name="threebars.fill" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.contentcontainer}>
          {/* 根据当前页面显示内容 */}
          {currentPage === 'home' && (
            <View>
              {/*<Text style={styles.text}>主頁</Text>*/}


              <ScrollView
                //contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Animated.FlatList
                  ref={flatListRef}
                  data={extendedImages}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                  )}
                  renderItem={({ item }) => (
                    <Image
                      source={item}
                      style={styles.carouselImage}
                      resizeMode="contain"
                    />
                  )}
                  keyExtractor={(_, index) => index.toString()}
                  onMomentumScrollEnd={handleMomentumScrollEnd}
                  initialScrollIndex={1}
                  getItemLayout={(data, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                  })}
                />

                {/* 添加指示器 */}
                <View style={styles.indicatorContainer}>
                  {images.map((_, index) => {
                    const inputRange = [
                      (index) * SCREEN_WIDTH,
                      (index + 1) * SCREEN_WIDTH,
                    ];

                    const opacity = scrollX.interpolate({
                      inputRange,
                      outputRange: [0.3, 1],
                      extrapolate: 'clamp',
                    });

                    return (
                      <Animated.View
                        key={index}
                        style={[styles.indicator, { opacity }]}
                      />
                    );
                  })}
                </View>

                <Image source={require('../img/pokemoncard.png')} style={styles.threebigiamge} />
                <Image source={require('../img/cardList.png')} style={styles.threebigiamge} />
                <Image source={require('../img/pokemoncomptition.png')} style={styles.threebigiamge} />

                <Button
                  title="打開抽屜"
                  onPress={() => drawer.current?.openDrawer()}
                />
              </ScrollView>
            </View>
          )}

          {currentPage === 'UP' &&
            <View>
              <UProduct />
            </View>
          }
          {currentPage === 'SCA' && <SCA />}
          {currentPage === 'SA' && <SA />}
          {currentPage === 'POP' && <POP />}
          {currentPage === 'cardSale' && <CSA />}
        </View>
      </DrawerLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  // 主要内容样式
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 10, // 与搜索栏的间距
  },
  navigationContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContainer: {
    paddingVertical: 20,
  },
  navItem: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    width: '100%',
  },
  activeItem: {
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },


  // 搜索框样式
  header: {
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    margin: 10,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 30,
    color: '#333',
  },
  iconButton: {
    padding: 8,
  },


  // 轮播图样式
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 200,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 4,
  },


  // 三张大图片样式
  threebigiamge: {
    width: '100%',
    height: 200,
  }
});