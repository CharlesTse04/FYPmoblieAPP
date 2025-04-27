import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getDatabase, ref, set, remove, get } from 'firebase/database';
import Login from '../getData/loginId';
import { cong } from '../src/cong';




interface Order {
    date: string;
    employee: string;
    method: string;
    price: number;
    status: string;
    card: { [key: string]: number };
}

interface UpdatedCard {
    quantity: number;
    [key: string]: any;
}

const AddOrder = async (
    cartItems: [string, number][],
    price: number,
    method: string,
    usePoint: number
): Promise<void> => {
    const db = getDatabase(cong);
    const userId = (await Login()).id; // Ensure this is awaited
    const orderRef = ref(db, 'order');

    try {
        console.log("User ID:", userId);

        // Fetch current orders
        const ordersSnapshot = await get(orderRef);
        const currentOrders: Record<string, any> = ordersSnapshot.exists() ? ordersSnapshot.val() : {};

        // Generate a valid transaction ID
        const transactionId = `TRANSACTION_${new Date().toISOString().replace(/:/g, '_').replace(/\./g, '_')}`;

        // Create a new order object
        const newOrder: Order = {
            date: new Date().toISOString(),
            employee: '',
            method,
            price,
            status: '未發貨',
            card: {},
        };

        // Process each item in the cart
        for (const item of cartItems) {
            try {
                const galleriesSnapshot = await get(ref(db, 'galleries'));
                const cardsSnapshot = await get(ref(db, 'cards'));

                let updatedCard: UpdatedCard | undefined;
                let card: string | null = null;
                const [itemId, itemQuantity] = item;

                if (galleriesSnapshot.val() && galleriesSnapshot.val()[itemId]) {
                    updatedCard = galleriesSnapshot.val()[itemId];
                    card = 'galleries';
                } else if (cardsSnapshot.val() && cardsSnapshot.val()[itemId]) {
                    updatedCard = cardsSnapshot.val()[itemId];
                    card = 'cards';
                }

                // Adjust the quantity
                if (updatedCard && updatedCard.quantity > 0) {
                    const [itemId, itemQuantity] = item;
                    updatedCard.quantity -= itemQuantity; // Reduce the quantity by the quantity in the cart
                    newOrder.card[itemId] = itemQuantity;
                    // Save the updated card back to the database
                    await set(ref(db, `${card}/${itemId}`), updatedCard);
                    console.log(`Updated ${card} ${itemId}: Quantity is now ${updatedCard.quantity}`);
                } else {
                    console.log(`Item with ID ${itemId} not found or out of stock.`);
                }

                // Remove the item from the user's shopping list
                await remove(ref(db, `user/${userId}/Shopping/${itemId}`));
                console.log("Item removed:", itemId);
            } catch (error) {
                console.error(`Error processing item ${item[0]}:`, error);
            }
        }

        // Prepare the updated orders object
        const updatedOrders: Record<string, any> = {
            ...currentOrders,
            [transactionId]: {
                "1": newOrder,
                VersionNum: 1,
                user: userId,
                usePoint,
            },
        };

        await set(orderRef, updatedOrders);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error adding order:", error.message);
        } else {
            console.error("Error adding order:", error);
        }
        Alert.alert("Error", error instanceof Error ? error.message : "An unknown error occurred");
    }
};



export default AddOrder;