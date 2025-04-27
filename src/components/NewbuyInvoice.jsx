import React, { useEffect, useState } from 'react';
import {
    Paper, Button, Snackbar, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, TableCell, TableRow, CircularProgress
} from '@mui/material';
import { getDatabase, ref, get } from "firebase/database";
import { TableVirtuoso } from 'react-virtuoso';
import AddCar from './addInvoce.jsx';

const GalleryDataTable = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [cartItems, setCartItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isSearchPerformed, setIsSearchPerformed] = useState(false);

    useEffect(() => {
        const db = getDatabase();
        const galleriesRef = ref(db, '/galleries/');

        const fetchData = async () => {
            setLoading(true);
            try {
                const galleriesSnapshot = await get(galleriesRef);
                const galleriesData = galleriesSnapshot.val() || {};

                const formattedRows = [];
                for (const galleryId in galleriesData) {
                    const gallery = galleriesData[galleryId];
                    formattedRows.push({
                        galleryId: gallery.galleryId,
                        price: Number(gallery.price) * (1 - gallery.discount / 100),
                        quantity: Number(gallery.quantity),
                    });
                }
                setRows(formattedRows);
            } catch (error) {
                console.error("Error fetching data from Firebase:", error);
                setSnackbarMessage("Error fetching data. Please try again later.");
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const handleOpenDialog = (item) => {
            setSelectedItem(item);
            setQuantity(1);
            setOpenDialog(true);

    };

    const handleConfirmPurchase = () => {
        if (cartItems.length > 0) {
            setSnackbarMessage("Purchase confirmed! Thank you.");
            setSnackbarOpen(true);
            setCartItems([]);
        } else {
            setSnackbarMessage("No items in the cart to purchase.");
            setSnackbarOpen(true);
        }
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            const newItem = {
                id: selectedItem.galleryId,
                desc: `Gallery ID: ${selectedItem.galleryId}`,
                qty: quantity,
                unit: 'pcs',
                price: selectedItem.price,
            };

            setCartItems([...cartItems, newItem]);
            setSnackbarMessage(`Added ${quantity} of ${newItem.desc} to cart!`);
            setSnackbarOpen(true);
            setOpenDialog(false);
            setSelectedItem(null);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedItem(null);
    };

    const handleDeleteFromCart = (index) => {
        const updatedCartItems = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCartItems);
    };

    const handleSearch = () => {
        const results = rows.filter(row =>
            row.galleryId?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredRows(results);
        setIsSearchPerformed(true);
    };

    return (
        <>
            <h1>Gallery List</h1>
            <Paper style={{ height: 680, width: '100%', padding: '16px' }}>
                <TextField
                    label="Search"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ marginBottom: '16px' }}
                />
                <div style={{ textAlign: 'right', marginBottom: '5px' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        style={{ marginBottom: '16px' }}
                    >
                        Search
                    </Button>
                </div>
                <h2 style={{ textAlign: 'left' }}>Gallery list</h2>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    isSearchPerformed && (filteredRows.length > 0 || searchQuery) ? (
                        <TableVirtuoso
                            data={filteredRows}
                            fixedHeaderContent={() => (
                                <TableRow>
                                    <TableCell style={{ width: "40%" }} variant="head">Gallery ID</TableCell>
                                    <TableCell style={{ width: "20%" }} variant="head">Price</TableCell>
                                    <TableCell style={{ width: "40%" }} variant="head">Quantity</TableCell>
                                    <TableCell style={{ width: "10%" }} variant="head">Actions</TableCell>
                                </TableRow>
                            )}
                            itemContent={(index, row) => (
                                <React.Fragment>
                                <TableCell align={'left'} style={{ width: "40%" }}>{row.galleryId}</TableCell>
                                <TableCell align={'left'} style={{ width: "20%" }}>${row.price.toFixed(2)}</TableCell>
                                <TableCell align={'left'} style={{ width: "40%" }}>{row.quantity}</TableCell>
                                <TableCell align={'left'} style={{ width: "10%" }}>
                                  <Button
                                    variant="outlined"
                                    color={row.quantity < 10 ? "error" : "primary"} // Change color to red if quantity > 10
                                    onClick={() => handleOpenDialog(row)}
                                    style={{
                                      width: '150px',
    
                                    }}
                                  >
                                    {row.quantity < 10 ? "Out of Stock" : "Add to Cart"} {/* Change button text based on quantity */}
                                  </Button>
                                </TableCell>
                              </React.Fragment>
                            )}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', margin: '20px' }}>
                            No data found. Please perform a search.
                        </div>
                    )
                )}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                    message={snackbarMessage}
                />
                <Dialog open={openDialog} onClose={handleDialogClose}>
                    <DialogTitle>Add to Cart</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                            fullWidth
                        />
                        {selectedItem && (
                            <div style={{ marginTop: '16px' }}>
                                <div>Gallery ID: {selectedItem.galleryId}</div>
                                <div>Price: ${(selectedItem.price * quantity).toFixed(2)}</div>
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose}>Cancel</Button>
                        <Button onClick={handleAddToCart}>Add</Button>
                    </DialogActions>
                </Dialog>

                <AddCar
                    rows={cartItems}
                    invoiceSubtotal={cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)}
                    handleDeleteFromCart={handleDeleteFromCart}
                    handleConfirmPurchase={handleConfirmPurchase}
                />
            </Paper>
        </>
    );
};

export default GalleryDataTable;