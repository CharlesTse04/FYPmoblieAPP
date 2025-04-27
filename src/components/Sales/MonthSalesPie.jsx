import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    const [year, setYear] = useState(Number(YearDate));
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

                    for (const orderId in orders) {
                        const order = orders[orderId];
                        const versionNum = order.VersionNum;

                        const versionSnapshot = await get(ref(db, `/order/${orderId}/${versionNum}`));
                        const versionData = versionSnapshot.val() || {};

                        if (versionData && versionData.date && versionData.price && versionData.status === 'complete') {
                            const orderDate = new Date(versionData.date);
                            if (orderDate.getFullYear() === year) {
                                const price = versionData.price;
                                const month = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

                                if (!monthlyTotals[month]) {
                                    monthlyTotals[month] = 0;
                                }
                                monthlyTotals[month] += price;
                            }
                        }
                    }

                    // Add unique id to each formattedData entry
                    const formattedData = Object.entries(monthlyTotals).map(([month, totalPrice]) => ({
                        id: month, // Use month as the unique ID
                        name: month,
                        price: totalPrice,
                    }));

                    setData(formattedData);
                    setRows(formattedData);
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

        return () => {
            setData([]);
            setColors([]);
        };
    }, [year]);

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
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="price"
                        nameKey="name"
                        label
                        fill="#8884d8"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
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