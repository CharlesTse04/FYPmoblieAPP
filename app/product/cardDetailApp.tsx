import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get, onValue } from 'firebase/database';
import LoginId from '../getData/loginId.jsx'; // Ensure this import is correct
import { View, Text, Image, Button, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
//import Yourlike from '../addToCart/yourlike.js';
//import AddToCart from '../addToCart/addToCart.js';
//import Unlike from '../addToCart/unlike.js';

interface Card {
    cardId: string;
    image: string;
    name: string;
    price: number;
    quantity: number;
  }
  
  interface Gallery {
    galleryId: string;
    imageUrl: string;
    name: string;
    price: number;
    quantity: number;
  }
  
  type ItemData = Card | Gallery;

const cardDetailApp = (/*{ cardId }*/) => {
    const [itemData, setItemData] = useState<ItemData | null>(null);
    //const [itemData, setItemData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCard, setIsCard] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [likedCards, setLikedCards] = useState(new Set());

    /*useEffect(() => {
        const db = getDatabase();
        const loginInfo = LoginId();
        const userId = loginInfo ? loginInfo.id : null;

        if (userId) {
            const UserRef = ref(db, `user/${userId}/withlist`);
            const unsubscribeUser = onValue(UserRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setLikedCards(new Set(Object.keys(data)));
                } else {
                    setLikedCards(new Set());
                }
            });

            return () => {
                unsubscribeUser(); // Cleanup listener
            };
        }
    }, []);

    useEffect(() => {
        const database = getDatabase();
        const cardRef = ref(database, `cards/${cardId}`);
        get(cardRef).then((snapshot) => {
            if (snapshot.exists()) {
                setItemData(snapshot.val());
                setIsCard(true);
            } else {
                const galleryRef = ref(database, `galleries/${cardId}`);
                get(galleryRef).then((gallerySnapshot) => {
                    if (gallerySnapshot.exists()) {
                        setItemData(gallerySnapshot.val());
                        setIsCard(false);
                    } else {
                        console.log('没有找到卡片或画廊数据');
                    }
                }).catch((error) => {
                    console.error('获取画廊数据失败:', error);
                });
            }
            setLoading(false);
        }).catch((error) => {
            console.error('获取卡片数据失败:', error);
            setLoading(false);
        });
    }, [cardId]);

    if (loading) {
        return <View>加载中...</View>;
    }

    if (!itemData) {
        return <View>加载中...</View>;
    }

    const handleIncrease = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const handleDecrease = () => {
        setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));
    };*/

    return (
        /*<View>
            <View>
                <View>
                    <View>
                        <Image src={isCard ? (itemData as Card).Image : (itemData as Gallery).imageUrl} alt={itemData.name}/>
                    </View>
                    <View>
                        <Text>{itemData.name}</Text>
                        <View>
                            <View>序列號:</View>
                            <View>{isCard ? (itemData as Card).cardId : (itemData as Gallery).galleryId}</View>
                        </View>
                        <View>
                            <View>庫存 :</View>
                            <View>{itemData.quantity}</View>
                        </View>
                        <View>
                            <View>價錢 :</View>
                            <View>${itemData.price}</View>
                        </View>
                        {/* Conditional Rendering for Out of Stock }
                        {itemData.quantity === 0 ? (
                            <View>没有货</View>
                        ) : (
                            <>
                                <View>
                                    <Button onClick={handleDecrease}>-</Button>
                                    <input type='text' value={quantity} readOnly />
                                    <Button onClick={handleIncrease}>+</Button>
                                </View>
                                <Button>
                                    <label>
                                        <Text><a href="#">購買</a></Text>
                                    </label>
                                </Button>
                                <Button>
                                    <label>
                                        <Text>
                                            <a href="#" onClick={() => {
                                                AddToCart(isCard ? (itemData as Card).cardId :(itemData as Gallery).galleryId, quantity);
                                                setQuantity(1);
                                            }}>添加到購物車</a>
                                        </Text>
                                    </label>
                                </Button>
                            </>
                        )}

                        <View>
                            <input id={isCard ? (itemData as Card).cardId : (itemData as Gallery).galleryId}
                                checked={likedCards.has(isCard ? (itemData as Card).cardId : (itemData as Gallery).galleryId)}
                                type="checkbox"
                                onClick={(e) => {
                                    if (e.currentTarget.checked) {
                                        Yourlike(isCard ? (itemData as Card).cardId : (itemData as Gallery).galleryId, itemData.name);
                                    } else {
                                        Unlike(isCard ? (itemData as Card).cardId : (itemData as Gallery).galleryId);
                                    }
                                }} />
                            <label  htmlFor={isCard ? (itemData as Card).cardId : (itemData as Gallery).galleryId}>
                                <svg fillRule="nonzero" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"></path>
                                </svg>
                                <Text>添加到收藏</Text>
                            </label>
                        </View>
                    </View>
                </View>
            </View>
        </View>*/
        <></>
    );
}

export default cardDetailApp;