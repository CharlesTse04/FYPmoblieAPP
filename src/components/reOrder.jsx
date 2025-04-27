import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { Snackbar, Alert, FormControl ,InputLabel,Select,MenuItem } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { getDatabase, ref, get, update, set } from "firebase/database";

const Reorder = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);


    const columns = [
        { field: 'id', headerName: 'Id', width: 250 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'type', headerName: 'Type', width: 150 },
        { field: 'quantity', headerName: 'Quantity', width: 150 },
    ];
    useEffect(() => {
        setLoading(true);
        const db = getDatabase();
        const galleriesRef = ref(db, '/galleries/');

        const fetchData = async () => {
            try {
                const snapshot = await get(galleriesRef);
                const data = snapshot.val() || {};
                const formattedRows = [];

                for (const empId in data) {
                    const employee = data[empId];
                    if (employee.quantity < 10) {
                    formattedRows.push({
                        id: empId, // Adding the unique id property
                        name: employee.name,
                        price: employee.price,
                        type: employee.type,
                        quantity: employee.quantity,
                    });
                }
                }

                setRows(formattedRows);
            } catch (error) {
                console.error("Error fetching data from Firebase:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    return (
        <Paper style={{ height: 400, width: '100%' }}>
            <DataGrid rows={rows} columns={columns} loading={loading} />
        </Paper>
    );
}

export default Reorder;