import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Snackbar,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';
import { getDatabase, ref, update,get } from "firebase/database";
import LoginId from "../getData/loginId.jsx";

const AddCar = ({ rows, invoiceSubtotal, handleDeleteFromCart, handleConfirmPurchase }) => {
    const [openDelete, setOpenDelete] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [openPurchase, setOpenPurchase] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [editedQty, setEditedQty] = useState(0); // State to hold edited quantity

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleClickOpenPurchase = () => {
        setOpenPurchase(true);
    };

    const handleClosePurchase = () => {
        setOpenPurchase(false);
    };

    const handleConfirmPurchaseClick = async () => {
        setLoading(true);
        try {
            // Prepare invoice data
            const invoiceData = {
                employee: LoginId().id, // Replace with actual employee ID
                date: new Date().toISOString().split('T')[0], // Format to YYYY-MM-DD
                price: invoiceSubtotal,
                card: rows.reduce((acc, row) => {
                    acc[row.id] = row.qty; // Create a record of items
                    return acc;
                }, {}),
            };

            // Create a unique transaction ID based on the current date and time
            const transactionId = `invoice/${new Date().toISOString().replace(/[:.]/g, '-')}`;
            const galleriesId = '/galleries/';

            // Save invoice to Firebase
            const db = getDatabase();
            
            try {
              // Get a reference to the galleries path
              const galleriesRef = ref(db, galleriesId);
              const galleriesSnapshot = await get(galleriesRef);
              const galleriesData = galleriesSnapshot.val() || {};
            
              // Iterate over each gallery
              for (const galleryId in galleriesData) {
                const gallery = galleriesData[galleryId];
                // Check if the gallery has a positive quantity
                if (invoiceData.card[galleryId] !== undefined) {
                  // Update the quantity based on the invoice data
                  const additionalQuantity = invoiceData.card[galleryId] || 0; // Default to 0 if not found
                  gallery.quantity += additionalQuantity;
            
                  // Update the gallery in the database
                  await update(ref(db, `${galleriesId}${galleryId}`), { quantity: gallery.quantity });
                }
              }
            } catch (error) {
              console.error("Error updating galleries:", error);
            }

            await update(ref(db, transactionId), invoiceData);

            // Confirm the purchase
            setSnackbarMessage("Purchase confirmed and recorded!");
            handleConfirmPurchase(); // Call the parent function to handle the purchase
        } catch (error) {
            console.error("Error confirming purchase:", error);
            setSnackbarMessage("Error confirming purchase.");
        } finally {
            setLoading(false);
            setSnackbarOpen(true);
            handleClosePurchase();
        }
    };

    const handleClickOpenDelete = (index) => {
        setDeleteIndex(index);
        setOpenDelete(true);
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
        setDeleteIndex(null);
    };

    const handleConfirmDelete = () => {
        if (deleteIndex !== null) {
            handleDeleteFromCart(deleteIndex);
            setSnackbarMessage("Item deleted from cart!");
            handleCloseDelete();
            setSnackbarOpen(true);
        }
    };

    const handleClickOpenEdit = (index) => {
        setEditingIndex(index);
        setEditedQty(rows[index].qty);
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        setEditingIndex(null);
        setEditedQty(0);
    };

    const handleConfirmEdit = () => {
        if (editingIndex !== null) {
            // Update the quantity in the rows array
            const updatedRows = [...rows];
            updatedRows[editingIndex].qty = editedQty;

            // Optionally, you can handle updating the Firebase database here

            setSnackbarMessage("Item quantity updated!");
            setOpenEdit(false);
            setSnackbarOpen(true);
        }
    };

    return (
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table aria-label="spanning table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Qty.</TableCell>
                        <TableCell align="right">Sum</TableCell>
                        <TableCell align="left">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.desc}</TableCell>
                            <TableCell align="right">{row.qty}</TableCell>
                            <TableCell align="right">${(row.price * row.qty).toFixed(2)}</TableCell>
                            <TableCell align="left">
                                <Button variant="outlined" onClick={() => handleClickOpenEdit(index)}>
                                    Edit
                                </Button>
                                <Button variant="outlined" onClick={() => handleClickOpenDelete(index)} style={{ marginLeft: '10px' }}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell colSpan={2} align="right">Total Price</TableCell>
                        <TableCell align="right">${invoiceSubtotal.toFixed(2)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <Button
                variant="contained"
                color="primary"
                onClick={handleClickOpenPurchase}
                style={{ marginTop: '20px', marginBottom: '40px' }}
                disabled={loading}
            >
                Confirm Purchase
            </Button>

            {/* Confirm Purchase Dialog */}
            <Dialog open={openPurchase} onClose={handleClosePurchase}>
                <DialogTitle>Confirm Purchase</DialogTitle>
                <DialogContent>
                    Are you sure you want to confirm this purchase?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePurchase} color="primary">Cancel</Button>
                    <Button onClick={handleConfirmPurchaseClick} color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <Dialog open={openDelete} onClose={handleCloseDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this item?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete} color="primary">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Item Dialog */}
            <Dialog open={openEdit} onClose={handleCloseEdit}>
                <DialogTitle>Edit Item Quantity</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Quantity"
                        type="number"
                        fullWidth
                        value={editedQty}
                        onChange={(e) => setEditedQty(Number(e.target.value))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit} color="primary">Cancel</Button>
                    <Button onClick={handleConfirmEdit} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            {loading && <CircularProgress style={{ position: 'absolute', top: '50%', left: '50%' }} />}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </TableContainer>
    );
};

export default AddCar;