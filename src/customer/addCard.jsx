import React from 'react';
import { Box } from '@mui/material';
import ComplexGrid from './ComplexGrid';

// Sample product data
const products = [
    {
        name: "aaa",
        price: 13,
        image: "http://example.com/image1.jpg",
        id: "1",
        description: "Description for aaa"
    },
    {
        name: "bbb",
        price: 14,
        image: "http://example.com/image2.jpg",
        id: "2",
        description: "Description for bbb"
    }
];

const AddCard = () => {
    return (
        <Box flex={4} p={2}>
            {products.map((product) => (
                <Box key={product.id} mt={2}>
                    <ComplexGrid 
                        title={product.name}
                        description={product.description}
                        image={product.image}
                        id={product.id}
                        price={product.price}
                    />
                </Box>
            ))}
        </Box>
    );
};

export default AddCard;