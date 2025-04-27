import { Box } from "@mui/material";
import React, { useState } from "react";
import CardData from "./CardData";

const products = [
    { id: 1, name: "商品 1", price: 100, image: "https://via.placeholder.com/140" },
    { id: 2, name: "商品 2", price: 150, image: "https://via.placeholder.com/140" },
    { id: 3, name: "商品 3", price: 200, image: "https://via.placeholder.com/140" },
    // Ensure unique IDs for products
];

const BuyCard = ({ loginId }) => { // Accept loginId as a prop
    const [cart, setCart] = useState([]);

    const handlePurchase = (product) => {
        setCart([...cart, product]);
        alert(`${product.name} 已加入購物車！`);
    };

    return (
        <Box flex={5} display="flex" flexDirection="row" justifyContent="flex-start" flexWrap="wrap">
            {products.map((product) => (
                <Box key={product.id} m={1}>
                    <CardData 
                        product={product} 
                        onPurchase={handlePurchase} 
                    />
                </Box>
            ))}
            {cart.length > 0 && (
                <div>購物車中有 {cart.length} 件商品</div>
            )}
            {loginId && ( // Check if loginId exists before rendering
                <div>使用者 ID: {loginId}</div>
            )}
        </Box>
    );
};

export default BuyCard;