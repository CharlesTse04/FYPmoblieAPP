import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer, Cell } from 'recharts';
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
    const [rows, setRows] = useState([]);

    const columns = [
        { field: 'name', headerName: 'Year', width: 350 },
        { field: 'price', headerName: 'Total Price', width: 250 },
    ];


    useEffect(() => {
        const fetchData = async () => {
            const db = getDatabase();
            const ordersRef = ref(db, '/order/');
            try {
                const snapshot = await get(ordersRef);
                if (snapshot.exists()) {
                    const orders = snapshot.val();
                    const yearlyTotals = {};

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

                        const orderDate = new Date(versionData.date); // Assuming versionData.date exists

                        // Check if orderDate is within the specified range
                        if (orderDate >= start && orderDate <= end && versionData.status === 'complete') {
                            const price = versionData.price || 0; // Ensure price exists
                            const year = orderDate.getFullYear();

                            // Accumulate price by year
                            if (!yearlyTotals[year]) {
                                yearlyTotals[year] = 0;
                            }
                            yearlyTotals[year] += price;
                        }
                    }

                    // Format the result for PieChart
                    const formattedData = Object.entries(yearlyTotals).map(([year, totalPrice]) => ({id: year, name: year, price: totalPrice }));
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
            <h1>Sales Report</h1>
            <h2>{startDate} to {endDate}</h2>
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
                    <Line type="monotone" dataKey="price" stroke="#ff7300" strokeWidth={2} />
                </BarChart>
            </ResponsiveContainer>
            <h1>Year Sales Data</h1>
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