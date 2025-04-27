import React from 'react';
import { useState, useEffect } from 'react';
//import { cong, auth, db } from '../../src/index.js';
import { getDatabase, ref, onValue } from "firebase/database";
import { View, Text, Image, TouchableOpacity, TextInput, Button, ScrollView, StyleSheet } from 'react-native';

/*import Box from '@mui/joy/Box';
import Checkbox, { checkboxClasses } from '@mui/joy/Checkbox';
import Sheet from '@mui/joy/Sheet';
import Slider from '@mui/joy/Slider';*/


const CardSaleApp = () => {

    /*useEffect(() => {
        const db = getDatabase(cong);
        const cardsRef = ref(db, 'cards/'); // 确保指向正确的数据库路径

        const unsubscribe = onValue(cardsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const cardsList = Object.values(data);
                setCards(cardsList);
                const quantities = {};
                cardsList.forEach(card => {
                    quantities[card.galleryId] = 1; // Set default quantity to 1 for each card
                });
                setCardQuantities(quantities);
                setFilteredCards(cardsList.filter(card => card.quantity > 0));
            } else {
                setCards([]); // 如果没有数据，清空卡片列表
                setCardQuantities({});
            }
        });

        return () => unsubscribe(); // 清理订阅
    }, []);

    const updateQuantity = (galleryId, newQuantity) => {
        newQuantity = Math.max(1, newQuantity);

        const card = cards.find(card => card.galleryId === galleryId); // 找到對應的卡片

        if (card) {
            newQuantity = Math.min(card.quantity, newQuantity); // 確保新數量不超過庫存量
        }

        setCardQuantities(prevQuantities => ({
            ...prevQuantities,
            [galleryId]: newQuantity
        }));

        const reduceButton = document.querySelector(`.btnReduce[data-galleryId="${galleryId}"]`);
        const addButton = document.querySelector(`.btnAdd[data-galleryId="${galleryId}"]`);

        if (newQuantity === 1) {
            reduceButton?.classList.add('disabled');
        } else {
            reduceButton?.classList.remove('disabled');
        }

        if (newQuantity === card.quantity) {
            addButton?.classList.add('disabled');
        } else {
            addButton?.classList.remove('disabled');
        }
    };

    const handleFilterChange = (option) => {
        setFilterOptions(prevOptions => ({ ...prevOptions, [option]: !prevOptions[option] }));
    };*/

    return (
        <>
            <View>
                <View>
                    <View>
                        <Text>卡牌回收</Text>
                        <Text>所有卡牌回收的價錢僅供參考</Text>
                    </View>
                </View>
            </View>
            {/*<View>
                <View>
                    <View>
                        {filteredCards.map((card) => (
                            <View key={card.galleryId}>
                                <a href="#">
                                    <Image src={card.image} alt="Image 1" />
                                    <Text>{card.name} ({card.galleryId})</Text>
                                    <View>
                                        <View>預計回收 ${(card.price * 0.2).toFixed(2)}</View>
                                    </View>
                                    <View>
                                        {/*<div className="cardPrice">庫存: {card.quantity}</div>}
                                    </View>
                                    <View>
                                        {card.quantity > 0 ? (
                                            <View>
                                                <Button
                                                    data-galleryId={card.galleryId}
                                                    onClick={() => updateQuantity(
                                                        card.galleryId, cardQuantities[card.galleryId] - 1
                                                    )}
                                                >-</Button>

                                                <input
                                                    type='text'
                                                    value={cardQuantities[card.galleryId]}
                                                    onChange={(e) => updateQuantity(
                                                        card.galleryId, parseInt(e.target.value)
                                                    )}
                                                />

                                                <Button
                                                    data-galleryId={card.galleryId}
                                                    onClick={() => updateQuantity(
                                                        card.galleryId, cardQuantities[card.galleryId] + 1
                                                    )}
                                                >+</Button>
                                            </View>
                                        ) : (
                                            <View>sold out</div>
                                        )}
                                    </View>
                                </a>
                                {/*<div className="like-button2">
                            <label className="like">
                                <span className="like-text">添加到購物車</span>
                            </label>
                        </div>}
                                {/*<div className="like-button">
                            <input className="on" id={card.galleryId} type="checkbox" />
                            <label className="like" htmlFor={card.galleryId}>
                                <svg className="like-icon" fill-rule="nonzero" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z">
                                    </path>
                                </svg>
                                <span className="like-text">添加到收藏</span>
                            </label>
                        </div>}
                                /*<View>
                                    <label>
                                        <Text>
                                            <a href='\FYP_HTML\selling.html'>
                                                立即回收
                                            </a>
                                        </Text>
                                    </label>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>*/}
        </>
    );
    
}

const styles = StyleSheet.create({
    
})

export default CardSaleApp;