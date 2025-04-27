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
        { field: 'id', headerName: 'gallery ID', width: 250 },
        { field: 'name', headerName: 'Name', width: 250 },
        { field: 'qty', headerName: 'Quantity', width: 150 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            const db = getDatabase();
            const ordersRef = ref(db, '/order/');
            const galleriesRef = ref(db, '/galleries/'); // Use galleries instead of cards

            try {
                // Fetch orders and galleries data
                const ordersSnapshot = await get(ordersRef);
                const galleriesSnapshot = await get(galleriesRef);

                if (ordersSnapshot.exists() && galleriesSnapshot.exists()) {
                    const orders = ordersSnapshot.val();
                    const galleries = galleriesSnapshot.val();
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

                        // Get order date and convert it to Date object
                        const orderDate = new Date(versionData.date); // Ensure versionData.date exists

                        // Check if orderDate is within the specified range
                        if (orderDate >= start && orderDate <= end && versionData.status === 'complete') {
                            // Get the corresponding card data for this order
                            const cardSnapshot = await get(ref(db, `/order/${orderId}/${versionNum}/card/`));
                            const orderCards = cardSnapshot.val() || {};

                            // Check if orderCards exist
                            if (orderCards) {
                                // Iterate through each card in the order
                                for (const key in orderCards) {
                                    // Check if the gallery ID exists in the galleries data
                                    const galleryData = galleries[key];
                                    if (galleryData) {
                                        // Accumulate quantities based on gallery ID
                                        cardSums[galleryData.galleryId] = (cardSums[galleryData.galleryId] || 0) + orderCards[key]; // Use gallery ID for sums
                                    }
                                }
                            }
                        }
                    }

                    // Format the result for PieChart, including gallery ID and name
                    const formattedData = Object.entries(cardSums)
                        .map(([galleryId, qty]) => {
                            const galleryDetails = galleries[galleryId]; // Get the details for the gallery
                            if (galleryDetails && qty > 0) { // Only include if galleryDetails exist and qty is greater than 0
                                return {
                                    id: galleryId, // Include gallery ID
                                    name: galleryDetails.name, // Use gallery name
                                    qty,
                                };
                            }
                            return null; // Return null for invalid entries
                        })
                        .filter(item => item !== null); // Filter out null entries

                    setData(formattedData);
                    setRows(formattedData);


                    // Generate colors
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

        // Cleanup function
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
            <h1>Gallery Sales Report</h1>
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
            <h1>Gallery List</h1>
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