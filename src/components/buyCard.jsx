import React, { useEffect, useState } from 'react';
import {
    Paper, Button, Snackbar, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, TableCell, TableRow, CircularProgress, Radio, RadioGroup,
    FormControlLabel, FormControl, FormLabel
} from '@mui/material';
import { getDatabase, ref, get, update } from "firebase/database";
import { TableVirtuoso } from 'react-virtuoso';
import AddCar from './addCar.jsx';

const CardDataTable = () => {
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
    const [searchType, setSearchType] = useState('cards');
    const [result, setResult] = useState(''); // 预测结果
    const [file, setFile] = useState(null); // 上传文件
    // Define currentRow state
    const [currentRow, setCurrentRow] = useState(null);


    const handleUpload = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:5010/api/add', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setResult('Predicted Class: ' + data.predicted_class);
            setSearchQuery(data.predicted_class); // 将预测结果设置为搜索词
        } catch (error) {
            setResult('Error: ' + error.message);
        }
    };

    const columns = searchType === 'galleries' ? [
        { label: 'Gallery ID', dataKey: 'galleryId', width: "40%" },
        { label: 'Price', dataKey: 'price', width: "20%" },
        { label: 'Quantity', dataKey: 'quantity', width: "40%" },
        {
            label: 'Actions',
            dataKey: 'actions',
            width: "10%",
            renderCell: (row) => (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenDialog(row)}
                    style={{ width: '150px', opacity: row.quantity > 0 ? 1 : 0.5 }}
                    disabled={row.quantity <= 0 || isItemInCart(row)} // Disable if out of stock or already in cart
                >
                    Add to Cart
                </Button>
            ),
        },
    ] : [
        { label: 'Card ID', dataKey: 'id', width: "20%" },
        { label: 'Galleries', dataKey: 'galleries', width: "10%" },
        { label: 'Name', dataKey: 'name', width: "20%" },
        { label: 'Price', dataKey: 'price', width: "10%" },
        { label: 'Quantity', dataKey: 'quantity', width: "10%" },
        { label: 'Type', dataKey: 'type', width: "20%" },
        { label: 'Rarity', dataKey: 'rarity', width: "10%" },
        {
            label: 'Actions',
            dataKey: 'actions',
            width: "10%",
            renderCell: (row) => (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenDialog(row)}
                    style={{ width: '150px', opacity: row.quantity > 0 ? 1 : 0.5 }}
                    disabled={row.quantity <= 0 || isItemInCart(row)} // Disable if out of stock or already in cart
                >
                    Add to Cart
                </Button>
            ),
        },
    ];

    useEffect(() => {
        const db = getDatabase();
        const galleriesRef = ref(db, '/galleries/');
        const cardsRef = ref(db, '/cards/');

        const fetchData = async () => {
            setLoading(true);
            try {
                const [galleriesSnapshot, cardsSnapshot] = await Promise.all([
                    get(galleriesRef),
                    get(cardsRef),
                ]);
                const galleriesData = galleriesSnapshot.val() || {};
                const cardsData = cardsSnapshot.val() || {};

                const formattedRows = [];

                if (searchType === 'galleries') {
                    for (const galleryId in galleriesData) {
                        const gallery = galleriesData[galleryId];
                        formattedRows.push({
                            galleryId: gallery.galleryId,
                            price: Number(gallery.price) * (1 - gallery.discount / 100),
                            quantity: Number(gallery.quantity),
                        });
                    }
                } else if (searchType === 'cards') {
                    for (const cardId in cardsData) {
                        const card = cardsData[cardId];
                        formattedRows.push({
                            id: cardId,
                            galleries: card.galleryId,
                            engName: card.engName,
                            name: card.name,
                            price: Number(card.price) * (1 - card.discount / 100),
                            quantity: Number(card.quantity),
                            type: card.type,
                            rarity: card.rarity,
                        });
                    }
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
    }, [searchType]);

    const isItemInCart = (item) => {
        return cartItems.some(cartItem => cartItem.id === (item.galleryId || item.id));
    };

    const handleOpenDialog = (item) => {
        if (item.quantity > 0) {
            setSelectedItem(item);
            setQuantity(1);
            setOpenDialog(true);
            setCurrentRow(item); // Save currentRow for later use
        } else {
            setSnackbarMessage(`No available quantity for ${item.galleryId || item.name}.`);
            setSnackbarOpen(true);
        }
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

    const handleAddToCart = async () => {
        if (selectedItem) {
            const newQuantity = selectedItem.quantity - quantity;

            if (newQuantity >= 0) {
                const newItem = {
                    id: selectedItem.galleryId || selectedItem.id,
                    desc: selectedItem.galleryId ? `Gallery ID: ${selectedItem.galleryId}` : selectedItem.name,
                    qty: quantity,
                    unit: 'pcs',
                    price: selectedItem.price,
                };

                // Update cart items in state
                setCartItems([...cartItems, newItem]);
                setSnackbarMessage(`Added ${quantity} of ${newItem.desc} to cart!`);
                setSnackbarOpen(true);
                setOpenDialog(false);
                setSelectedItem(null);

                // Access the database
                const db = getDatabase();
                const itemRef = ref(db, `/${searchType === 'galleries' ? 'galleries' : 'cards'}/${selectedItem.galleryId || selectedItem.id}`);

                try {
                    // Update the item's quantity in the database
                    await update(itemRef, {
                        ...selectedItem,
                        quantity: newQuantity,
                    });
                    setRows((prevRows) =>
                        prevRows.map((row) =>
                            row.id === currentRow.id ? { ...row, quantity: newQuantity } : row
                        )
                    );
                } catch (error) {
                    console.error("Error updating item quantity:", error);
                    setSnackbarMessage("Failed to update item quantity. Please try again.");
                    setSnackbarOpen(true);
                }
            } else {
                setSnackbarMessage(`Not enough quantity available for ${selectedItem.galleryId || selectedItem.name}.`);
                setSnackbarOpen(true);
            }
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

    const rowContent = (index, row) => (
        <React.Fragment>
            {columns.map((column) => (
                <TableCell key={column.dataKey} align={'left'} style={{ width: column.width }}>
                    {column.dataKey === 'actions' ? column.renderCell(row) : row[column.dataKey]}
                </TableCell>
            ))}
        </React.Fragment>
    );

    const handleSearch = () => {
        const results = rows.filter(row => {
            const matchesQuery = searchType === 'galleries'
            ? row.galleryId?.toLowerCase().includes(searchQuery.toLowerCase())
            : (
                row.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                row.engName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchesQuery;
        });
        setFilteredRows(results);
        setIsSearchPerformed(true);
    };

    return (
        <>
            <h1>Buy List</h1>
            <Paper style={{ height: 920, width: '100%', padding: '16px' }}>

                <TextField
                    label="Search"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ marginBottom: '16px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <TextField
                            type="file"
                            inputProps={{ accept: 'image/*' }}
                            onChange={(e) => setFile(e.target.files[0])}
                            sx={{ width: '50%' }}
                        />
                        <Button sx={{ width: '30%' }} variant="contained" onClick={handleUpload}>
                            Search Image
                        </Button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FormControl component="fieldset">
                            <RadioGroup row value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                                <FormControlLabel value="cards" control={<Radio />} label="Cards" />
                                <FormControlLabel value="galleries" control={<Radio />} label="Galleries" />
                            </RadioGroup>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSearch}
                            style={{ marginBottom: '16px' }}
                        >
                            Search
                        </Button>
                    </div>
                </div>
                <h2 style={{ textAlign: 'left' }}>{searchType} list</h2>
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
                                    {columns.map((column) => (
                                        <TableCell key={column.dataKey} style={{ width: column.width }} variant="head">
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )}
                            itemContent={rowContent}
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
                                <div>{selectedItem.galleryId ? `Gallery ID: ${selectedItem.galleryId}` : `Name: ${selectedItem.name}`}</div>
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

export default CardDataTable;