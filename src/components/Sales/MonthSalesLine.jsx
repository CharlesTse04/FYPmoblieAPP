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

const ReportPieChart = ({ YearDate }) => {
    const [year, setYear] = useState(Number(YearDate)); // Initialize with YearDate
    const [data, setData] = useState([]);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rows, setRows] = useState([]);

    const columns = [
        { field: 'name', headerName: 'Month', width: 250 },
        { field: 'price', headerName: 'Total Price', width: 150 },
    ];

    useEffect(() => {
        // Update year whenever YearDate changes
        setYear(Number(YearDate));
    }, [YearDate]);

    useEffect(() => {
        const fetchData = async () => {
            const db = getDatabase();
            const ordersRef = ref(db, '/order/');
            try {
                const snapshot = await get(ordersRef);
                if (snapshot.exists()) {
                    const orders = snapshot.val();
                    const monthlyTotals = {};

                    // Iterate through all orders
                    for (const orderId in orders) {
                        const order = orders[orderId];
                        const versionNum = order.VersionNum;

                        // Get the corresponding version data
                        const versionSnapshot = await get(ref(db, `/order/${orderId}/${versionNum}`));
                        const versionData = versionSnapshot.val() || {};

                        // Check if versionData contains the necessary fields
                        if (versionData && versionData.date && versionData.price && versionData.status === 'complete') {
                            const orderDate = new Date(versionData.date);

                            // Check if orderDate is within the specified year
                            if (orderDate.getFullYear() === year && versionData.status === 'complete') {
                                const price = versionData.price;
                                const month = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

                                // Accumulate price by month
                                if (!monthlyTotals[month]) {
                                    monthlyTotals[month] = 0;
                                }
                                monthlyTotals[month] += price;
                            }
                        }
                    }

                    // Format the result for BarChart
                    const formattedData = Object.entries(monthlyTotals).map(([month, totalPrice]) => ({
                        id: month,
                        name: month,
                        price: totalPrice,
                    }));
                    setData(formattedData);
                    setRows(formattedData);


                    // Generate colors
                    const generatedColors = formattedData.map(() => getRandomColor());
                    setColors(generatedColors);
                } else {
                    setError("No data available");
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
    }, [year]); // Use year as a dependency

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            <h1>Month Sales Report for {year}</h1>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="price" fill="#8884d8">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <h1>Monthly Sales Data</h1>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    sx={{ border: 0 }}
                    getRowId={(row) => row.id} // Specify how to get the row ID
                />
            </div>
        </>
    );
};

export default ReportPieChart;