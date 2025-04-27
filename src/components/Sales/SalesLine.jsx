import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import { getDatabase, ref, get } from 'firebase/database';

// Function to generate random colors
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const ReportPieChart = ({ startDate, endDate }) => {
    const [data, setData] = useState([]);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rows, setRows] = useState([]); // 用於 DataGrid 的行數據

    const columns = [
        { field: 'id', headerName: 'Card ID', width: 150 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'qty', headerName: 'Quantity', width: 150 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            const db = getDatabase();
            const ordersRef = ref(db, '/order/');
            const cardsRef = ref(db, '/cards/');

            try {
                // Fetch orders and cards data
                const ordersSnapshot = await get(ordersRef);
                const cardsSnapshot = await get(cardsRef);

                if (ordersSnapshot.exists() && cardsSnapshot.exists()) {
                    const orders = ordersSnapshot.val();
                    const cards = cardsSnapshot.val();
                    const cardSums = {};

                    // Convert startDate and endDate to Date objects
                    const start = new Date(startDate);
                    const end = new Date(endDate);

                    // Iterate through all orders
                    for (const orderId in orders) {
                        const order = orders[orderId];
                        const versionNum = order.VersionNum;

                        // Get the corresponding version data
                        const versionSnapshot = await get(ref(db, `/order/${orderId}/${versionNum}`));
                        const versionData = versionSnapshot.val() || {};
                        const orderDate = new Date(versionData.date);

                        // Check if orderDate is within the specified range
                        if (orderDate >= start && orderDate <= end && versionData.status === 'complete') {
                            const cardSnapshot = await get(ref(db, `/order/${orderId}/${versionNum}/card/`));
                            const orderCards = cardSnapshot.val() || {};

                            // Check if orderCards exist
                            if (orderCards) {
                                for (const key in orderCards) {
                                    const cardData = cards[key];
                                    if (cardData) {
                                        cardSums[cardData.cardId] = (cardSums[cardData.cardId] || 0) + orderCards[key];
                                    }
                                }
                            }
                        }
                    }

                    const formattedData = Object.entries(cardSums)
                        .map(([cardId, qty]) => {
                            const cardDetails = cards[cardId];
                            if (cardDetails && qty > 0) {
                                return {
                                    id: cardId,
                                    name: cardDetails.name,
                                    qty,
                                };
                            }
                            return null;
                        })
                        .filter(item => item !== null);

                    setData(formattedData);
                    setRows(formattedData); // 設置 DataGrid 的行數據


                    const generatedColors = formattedData.map(() => getRandomColor());
                    setColors(generatedColors);
                } else {
                    console.log("No data available");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            setData([]);
            setColors([]);
        };
    }, [startDate, endDate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }



    return (
        <>
            <h1>Card Sales Report</h1>
            <h2>{startDate} to {endDate}</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis
                        dataKey="id"

                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="qty" fill="#8884d8">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <h1>Card List</h1>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    sx={{ border: 0 }}
                />
            </div>
        </>
    );
};

export default ReportPieChart;