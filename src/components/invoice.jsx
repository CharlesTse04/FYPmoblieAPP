import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { getDatabase, ref, get, remove, update } from "firebase/database";
import OrderCard from './invoiceGaller.jsx';

const InvoiceDataTable = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [currentRow, setCurrentRow] = useState(null);
    const [employee, setEmployee] = useState('');
    const [date, setDate] = useState('');
    const [card, setCard] = useState({}); // Store card items
    const [viewDetails, setViewDetails] = useState(null);

    // Define columns for invoices data
    const columns = [
        { field: 'id', headerName: 'Invoice ID', width: 250 },
        { field: 'employee', headerName: 'Employee', width: 200 },
        { field: 'date', headerName: 'Create Date', width: 200 },
        { field: 'price', headerName: 'Total Price', width: 200 },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', height: '100%' }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(params.row)}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleViewDialogOpen(params.row)}
                    >
                        View
                    </Button>
              
                </div>
            ),
        },
    ];

    useEffect(() => {
        const db = getDatabase();
        const invoicesRef = ref(db, '/invoice/');

        const fetchData = async () => {
            setLoading(true);
            try {
                const snapshot = await get(invoicesRef);
                const data = snapshot.val() || {};
                const formattedRows = [];

                for (const invoiceId in data) {
                    const invoice = data[invoiceId];
                    formattedRows.push({
                        id: invoiceId,
                        employee: invoice.employee,
                        date: invoice.date,
                        card: invoice.card,
                        price: invoice.price, // Include price in the row data
                    });
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

    const handleEdit = (row) => {
        setCurrentRow(row);
        setEmployee(row.employee);
        setDate(row.date);
        setCard(row.card);
        setOpenEditDialog(true);
    };

    const handleViewDialogOpen = (row) => {
        setViewDetails(row);
        setOpenViewDialog(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this invoice?")) {
            const db = getDatabase();
            const invoiceRef = ref(db, `/invoice/${id}`);
            try {
                await remove(invoiceRef);
                setRows((prevRows) => prevRows.filter((row) => row.id !== id));
            } catch (error) {
                console.error("Error deleting invoice:", error);
            }
        }
    };

    const handleUpdate = async () => {
        const db = getDatabase();
        const invoiceRef = ref(db, `/invoice/${currentRow.id}`);
        try {
            await update(invoiceRef, { employee, date, card });
            setRows((prevRows) =>
                prevRows.map((row) =>
                    row.id === currentRow.id ? { ...row, employee, date, card } : row
                )
            );
            setOpenEditDialog(false);
        } catch (error) {
            console.error("Error updating invoice:", error);
        }
    };

    return (
        <Paper sx={{ height: 400, width: '100%' }}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </div>
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    sx={{ border: 0 }}
                />
            )}
            {/* Edit Invoice Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Edit Invoice</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Update the details of the invoice.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Employee"
                        fullWidth
                        variant="standard"
                        value={employee}
                        onChange={(e) => setEmployee(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Create Date"
                        fullWidth
                        variant="standard"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Card Items (JSON format)"
                        fullWidth
                        variant="standard"
                        value={JSON.stringify(card)} // Convert card object to string for display
                        onChange={(e) => setCard(JSON.parse(e.target.value || "{}"))} // Parse the input back to an object
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdate}>Update</Button>
                </DialogActions>
            </Dialog>

            {/* View Invoice Dialog */}
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} fullWidth>
                <DialogTitle>Order Details</DialogTitle>
                <DialogContent>
                    {viewDetails && (
                        <>
                            <div>
                                <p>Order ID: {viewDetails.id}</p>
                                <p>Total Price: {viewDetails.price}</p> {/* Display Total Price */}
                                <p>Date: {viewDetails.date}</p>
                                <p>Employee: {viewDetails.employee}</p>
                                <p>Status: {viewDetails.status}</p>
                            </div>
                            <OrderCard setCard={viewDetails.card} />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default InvoiceDataTable;