import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LoginId from "../getData/loginId.jsx";
import SelectList from './SelectList.jsx';
import {
    Paper,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    TextField,
    CircularProgress,
} from '@mui/material';
import { getDatabase, ref, update, get } from "firebase/database";
import { decrypt } from '../jmjm.js';

const AddCar = ({ rows, invoiceSubtotal, handleDeleteFromCart, handleConfirmPurchase }) => {
    const [openDelete, setOpenDelete] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [openPurchase, setOpenPurchase] = useState(false);
    const [openPoints, setOpenPoints] = useState(false);
    const [openPayment, setOpenPayment] = useState(false);
    const [openConfirmPoints, setOpenConfirmPoints] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [openEdit, setOpenEdit] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editedQty, setEditedQty] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const [currUserId, setCurrUserId] = useState(null);
    const [useNames, setUseNames] = useState(null);
    const [usePoints, setUsePoints] = useState(false);
    const [inputNumber, setInputNumber] = useState(0); // State for points input
    const [adjustedSub, setAdjustedSub] = useState(0);
    const [activeStep, setActiveStep] = useState(0);

    // Function to go to the next step
    const resetStep = () => {
        setActiveStep(0);
    };
    const handleNextStep = () => {
        setActiveStep((prevStep) => Math.min(prevStep + 1, 2)); // Assuming 3 steps (0, 1, 2)
    };
    const ccyFormat = (num) => `${num.toFixed(2)}`;

    const handleClickOpenDelete = (index) => {
        setDeleteIndex(index);
        setOpenDelete(true);
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
        setDeleteIndex(null);
    };

    const handleClickOpenEdit = (index) => {
        setEditingItem(rows[index]);
        setEditedQty(rows[index].qty);
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        setEditingItem(null);
        setEditedQty(0);
    };

    const updateInventory = async (id, quantityChange) => {
        const db = getDatabase();
        const inventoryRef = ref(db, 'cards/' + id);
        try {
            const snapshot = await get(inventoryRef);
            if (snapshot.exists()) {
                const currentQuantity = snapshot.val().quantity || 0;
                const newQuantity = currentQuantity + quantityChange;
                await update(inventoryRef, { ...snapshot.val(), quantity: newQuantity });
            }
        } catch (error) {
            console.error("Error updating inventory:", error);
            setSnackbarMessage("Error updating inventory.");
            setSnackbarOpen(true);
        }
    };

    const handleConfirmEdit = async () => {
        setLoading(true);
        if (editingItem) {
            const db = getDatabase();
            const inventoryRef = ref(db, 'cards/' + editingItem.id);
            try {
                const snapshot = await get(inventoryRef);
                if (snapshot.exists()) {
                    const currentQuantity = snapshot.val().quantity || 0;
                    if (editedQty <= 0) {
                        setSnackbarMessage("Quantity must be greater than zero!");
                    } else if (editedQty > currentQuantity) {
                        setSnackbarMessage(`Cannot set quantity to ${editedQty}. Available quantity is ${currentQuantity}.`);
                    } else {
                        const quantityChange = editedQty - editingItem.qty;
                        await updateInventory(editingItem.id, quantityChange);
                        setSnackbarMessage("Item updated successfully!");
                        handleCloseEdit();
                    }
                }
                // Update local row quantity
                rows.forEach((row) => {
                    if (row.id === editingItem.id) {
                        row.qty = editedQty;
                    }
                });
            } catch (error) {
                console.error("Error confirming edit:", error);
                setSnackbarMessage("Error confirming edit.");
            }
        }
        setLoading(false);
        setSnackbarOpen(true);
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        const itemToDelete = rows[deleteIndex];
        handleDeleteFromCart(deleteIndex);
        await updateInventory(itemToDelete.id, itemToDelete.qty);
        setSnackbarMessage("Item deleted and quantity returned to inventory!");
        handleCloseDelete();
        setLoading(false);
        setSnackbarOpen(true);
    };

    const handleClickOpenPurchase = () => {
        setOpenPurchase(true);
    };

    const handleClosePurchase = () => {
        resetStep(); // Reset the active step when closing the purchase dialog
        setOpenPurchase(false);
    };

    const handleConfirmPurchaseClick = () => {
        setSnackbarMessage("Purchase confirmed!");
        setOpenPoints(true);
        setSnackbarOpen(true);
        handleClosePurchase();
        handleNextStep(); // Move to the next step after processing VIP points
    };

    const handleClosePoints = () => {
        setOpenPoints(false);
        setPhoneNumber('');
        setUserPoints(0);
        setInputNumber(0); // Reset input number
    };

  const handleUsePoints = async (isVIP) => {
    setLoading(true);
    const db = getDatabase();
    const usersRef = ref(db, 'user');
    try {
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            const userEntries = Object.entries(users);
            let foundUser = null;
            let foundId = null;

            // Search for user by phone number
            for (const [key, user] of userEntries) {
                
                if (decrypt(user.phoneNumber) == phoneNumber) {
                    foundUser = user;
                    foundId = key;
                    break;
                }
            }

            // Check if the user is VIP and has sufficient points
            if (isVIP && foundUser) {
                const userPoints = foundUser.Point || 0;
                const userName = foundUser.name || null;

                if (userPoints > 0) {
                    setCurrUserId(foundId);
                    setUsePoints(true);
                    setUserPoints(userPoints);
                    setUseNames(userName);
                    setOpenConfirmPoints(true); // Open confirm points dialog
                } else {
                    setSnackbarMessage("Insufficient points to use VIP benefits.");
                }
            } else if (!isVIP) {
                // Handling non-VIP users
                const adjustedSubtotal = invoiceSubtotal; // Adjusted subtotal
                setCurrUserId(null);
                setAdjustedSub(adjustedSubtotal);
                setUserPoints(0);
                setPhoneNumber('');
                setUsePoints(false);
                setSnackbarMessage("Points applied to your purchase!");
                setOpenPoints(false);
                setOpenPayment(true);
                handleNextStep(); // Move to the next step
            } else {
                setSnackbarMessage("Invalid VIP phone number.");
            }
        } else {
            setSnackbarMessage("No user data found.");
        }
    } catch (error) {
        console.error("Error retrieving users:", error);
        setSnackbarMessage("Error retrieving user data.");
    } finally {
        setSnackbarOpen(true);
        setLoading(false);
    }
};

const handleConfirmUsePoints = async () => {
    setLoading(true);

    // If not using points, proceed to payment directly
    if (!usePoints) {
        const adjustedSubtotal = invoiceSubtotal; // Adjusted subtotal
        setAdjustedSub(adjustedSubtotal);
        setSnackbarMessage("No points used for this purchase.");
        setOpenConfirmPoints(false);
        setOpenPoints(false);
        setOpenPayment(true); // Proceed to payment
        setLoading(false);
        return;
    }

    // Check if the user has enough points
    if (userPoints < inputNumber) {
        setSnackbarMessage("Insufficient points available.");
        setLoading(false);
        return;
    }

    const updatedPoints = userPoints - inputNumber; // Deduct points
    const adjustedSubtotal = invoiceSubtotal - (inputNumber / 10); // Adjusted subtotal
    setAdjustedSub(adjustedSubtotal);

    try {
        setSnackbarMessage(`VIP points applied! ${inputNumber} points deducted for phone number: ${phoneNumber}`);
        setOpenConfirmPoints(false);
        setOpenPoints(false);
        setOpenPayment(true); // Proceed to the next page
        setPhoneNumber('');
        setUserPoints(updatedPoints); // Update local state
    } catch (error) {
        console.error("Error updating user points:", error);
        setSnackbarMessage("Error updating user points.");
    } finally {
        setSnackbarOpen(true);
        setLoading(false);
    }
};

const handleClosePayment = () => {
    setOpenPayment(false);
    resetStep();
};

const handlePaymentMethod = async (method) => {
    const db = getDatabase();
    const transactionId = `TRANSACTION_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const pointsEarned = invoiceSubtotal / 10; // Points earned from purchase
    const updatedPoints = userPoints + pointsEarned; // Update user points

    const paymentData = {
        1: {
            method,
            date: new Date().toISOString(),
            employee: LoginId().id,
            card: rows.reduce((acc, row) => {
                acc[row.id] = row.qty;
                return acc;
            }, {}),
            price: adjustedSub,
            status: "complete",
        },
        usePoint: inputNumber,
        VersionNum: 1,
        user: currUserId,
    };

    try {
        await update(ref(db, `order/${transactionId}`), paymentData);
        if(currUserId !== null){
        await update(ref(db, `user/${currUserId}`), { Point: updatedPoints });
        }
        setSnackbarMessage(`Payment method selected: ${method}`);
        setInputNumber(0);
        setSnackbarOpen(true);
        handleClosePayment();
        handleConfirmPurchase();
        resetStep(); // Reset the active step when closing the purchase dialog
    } catch (error) {
        console.error("Error updating payment data:", error);
        setSnackbarMessage("Error updating payment data.");
        setSnackbarOpen(true);
    }
};

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table aria-label="spanning table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Qty.</TableCell>
                        <TableCell align="right">Unit</TableCell>
                        <TableCell align="right">Sum</TableCell>
                        <TableCell align="left">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.desc}</TableCell>
                            <TableCell align="right">{row.qty}</TableCell>
                            <TableCell align="right">pcs</TableCell>
                            <TableCell align="right">{ccyFormat(row.price * row.qty)}</TableCell>
                            <TableCell align="left">
                                <Button variant="outlined" onClick={() => handleClickOpenEdit(index)} disabled={loading}>
                                    Edit
                                </Button>
                                <Button variant="outlined" onClick={() => handleClickOpenDelete(index)} style={{ marginLeft: '10px' }} disabled={loading}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell colSpan={4} align="right">Subtotal</TableCell>
                        <TableCell align="right">{ccyFormat(rows.reduce((sum, item) => sum + item.price * item.qty, 0))}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            {/* Dialogs for Edit, Delete, Purchase, Points, and Payment */}
            <Dialog open={openEdit} onClose={handleCloseEdit}>
                <DialogTitle>Edit Item</DialogTitle>
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
                    <Button onClick={handleConfirmEdit} color="primary" disabled={loading}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDelete} onClose={handleCloseDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this item?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete} color="primary">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="primary" disabled={loading}>Confirm</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openPurchase} onClose={handleClosePurchase}>

                <DialogTitle>Confirm Purchase</DialogTitle>
                <SelectList activeStep={activeStep} onNext={handleNextStep} />
                <DialogContent>
                    Are you sure you want to confirm this purchase?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePurchase} color="primary">Cancel</Button>
                    <Button onClick={handleConfirmPurchaseClick} color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openPoints} onClose={handleClosePoints}>

                <DialogTitle>Use Points?</DialogTitle>
                <SelectList activeStep={activeStep} onNext={handleNextStep} />
                <DialogContent>
                    Do you want to use your points for this purchase?
                    <TextField
                        margin="dense"
                        label="Phone Number (required for VIP)"
                        type="number"
                        fullWidth
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleUsePoints(false)} color="primary">No VIP</Button>
                    <Button onClick={() => handleUsePoints(true)} color="primary">VIP</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openConfirmPoints} onClose={() => setOpenConfirmPoints(false)}>

                <DialogTitle>Confirm Use of Points</DialogTitle>
                <SelectList activeStep={activeStep} onNext={handleNextStep} />
                <DialogContent>
                    <div>
                        <div>Available Points: {userPoints}</div>
                    </div>
                    <div>
                        <div>User Name: {useNames}</div>
                    </div>

                    <TextField
                        margin="dense"
                        label="How many points to use"
                        type="number"
                        fullWidth
                        value={inputNumber}
                        onChange={(e) => setInputNumber(Number(e.target.value))}
                    />
                    Are you sure you want to use {inputNumber} points for this purchase?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setUsePoints(false);
                        setOpenConfirmPoints(false);
                        handleConfirmUsePoints(false);
                    }} color="primary">No Use Points</Button>
                    <Button onClick={() => {
                        setUsePoints(true); // Set to not use points
                        handleConfirmUsePoints(true); // Directly call the confirm use points function
                    }} color="primary">Yes</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openPayment} onClose={handleClosePayment}>

                <DialogTitle>Select Payment Method</DialogTitle>
                <SelectList activeStep={activeStep} onNext={handleNextStep} />
                <DialogContent>
                    <div>
                        <div>Available Points: {userPoints}</div>
                    </div>
                    <div>
                        <div>User Name: {useNames}</div>
                    </div>
                    <div>
                        <div>total: ${adjustedSub}</div>
                    </div>
                    <Button onClick={() => handlePaymentMethod('Alipay')} color="primary">Alipay</Button>
                    <Button onClick={() => handlePaymentMethod('Bank Card')} color="primary">Bank Card</Button>
                    <Button onClick={() => handlePaymentMethod('Cash')} color="primary">Cash</Button>
                    <Button onClick={() => handlePaymentMethod('Credit Card')} color="primary">Credit Card</Button>

                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClosePayment} color="primary">Cancel</Button>
                </DialogActions>
            </Dialog>

            <Button variant="contained" color="primary" onClick={handleClickOpenPurchase} style={{ marginTop: '20px', marginBottom: '40px' }} disabled={loading}>
                Confirm Purchase
            </Button>

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