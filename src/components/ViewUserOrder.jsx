import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { getDatabase, ref, get, set, update } from "firebase/database";


const OrderTable = ({userId}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [cards, setCards] = useState({});
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [viewDetailsVersion, setViewDetailsVersion] = useState(null);
  const [viewUserVersion, setViewUserVersion] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  // Columns definition for DataGrid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'orderId', headerName: 'Order ID', width: 130 },
    { field: 'price', headerName: 'Price', width: 100, type: 'number' },
    { field: 'vision', headerName: 'VersionNum', width: 100 },
    { field: 'card', headerName: 'Card', width: 150 },
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'employee', headerName: 'Employee', width: 150 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'user', headerName: 'User', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <div>
          <Button variant="contained" color="primary" onClick={() => handleView(params.row)} style={{ marginRight: 8 }}>
            View
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleEdit(params.row)}
            disabled={params.row.status === 'complete'}
            style={{ backgroundColor: params.row.status === 'complete' ? '#e0e0e0' : undefined }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (userId) {
      fetchOrders(); // Fetch orders whenever userId changes
    }
  }, [userId]); // Dependency array includes userId


  const fetchOrders = async () => {
    const db = getDatabase();
    const ordersRef = ref(db, '/order/');
    setLoading(true);
    try {
      const snapshot = await get(ordersRef);
      const data = snapshot.val() || {};
      const formattedRows = [];
  
      for (const orderId in data) {
        const order = data[orderId];
        const versionNum = order.VersionNum;
  
        const versionRef = ref(db, `/order/${orderId}/${versionNum}/`);
        const versionSnapshot = await get(versionRef);
  
        if (versionSnapshot.exists()) {
          const version = versionSnapshot.val();
          const cardSnapshot = await get(ref(db, `/order/${orderId}/${versionNum}/card/`));
          const cardDetails = cardSnapshot.val() || {};
  
          const cardNames = Object.entries(cardDetails)
            .map(([cardId, cardValue]) => `${cardId} (${cardValue})`)
            .join(', ');
  
          formattedRows.push({
            id: orderId,
            orderId: orderId,
            price: version.price || 0,
            vision: versionNum || 'N/A',
            card: cardNames,
            date: version.date || 'N/A',
            employee: version.employee || 'N/A',
            status: version.status || 'N/A',
            user: order.user || 'N/A',
            cardDetails: cardDetails,
          });
        } else {
          console.warn(`Version number ${versionNum} does not exist for order ID ${orderId}`);
        }
      }
  
      // Filter to prioritize a specific user
      const prioritizedRows = formattedRows.filter(row => row.user === userId);
      setRows(prioritizedRows);
      if (prioritizedRows.length === 0) {
        setError("No data available for the selected user.");
      } else {
        setError(null);
      }
  
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    const db = getDatabase();
    const cardsRef = ref(db, '/cards/');
    try {
      const snapshot = await get(cardsRef);
      if (snapshot.exists()) {
        setCards(snapshot.val());
      }
    } catch (error) {
      console.error("Error fetching cards from Firebase:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const handleView = async (row) => {
    setSelectedVersion(row.vision); // Set the initial selected version
    await fetchVersionDetails(row.orderId, row.vision); // Fetch details for the current version
    setOpenViewDialog(true);
  };

  const fetchVersionDetails = async (orderId, version) => {
    const db = getDatabase();
    const versionNumRef = ref(db, `/order/${orderId}/VersionNum/`);
    const versionRef = ref(db, `/order/${orderId}/${version}/`);
    const usersRef = ref(db, `/order/${orderId}/`);
    try {
      const versionSnapshot = await get(versionRef);
      const versionNumSnapshot = await get(versionNumRef);
      const versionUserSnapshot = await get(usersRef)
      if (versionSnapshot.exists()) {
        const versionDetails = versionSnapshot.val();
        setViewDetails({
          ...versionDetails,
          orderId: orderId,
        });

        if (versionSnapshot.exists()) {
          const versionuser = versionUserSnapshot.val();
          setViewUserVersion(versionuser);
        } else {
          setError("Version user not found.");
        }

        // Set the version number correctly
        if (versionNumSnapshot.exists()) {
          const versionNum = versionNumSnapshot.val();
          setViewDetailsVersion(versionNum);
        } else {
          setError("Version number not found.");
        }
      } else {
        setError("Version details not found.");
      }
    } catch (error) {
      console.error("Error fetching version details:", error);
      setError("Failed to fetch version details.");
    }
  };

  const handleVersionChange = async (e) => {
    const selectedVersion = e.target.value;
    setSelectedVersion(selectedVersion);
    // Fetch the details for the newly selected version
    await fetchVersionDetails(viewDetails.orderId, selectedVersion);
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    const db = getDatabase();
    const { orderId, vision, cardDetails } = editRow;

    let totalPrice = 0;
    for (const cardId in cardDetails) {
      const cardValue = cardDetails[cardId];
      if (cards[cardId]) {
        totalPrice += cards[cardId].price * cardValue - (viewUserVersion.usePoint / 10);
      }
    }

    const newVersion = parseInt(vision) + 1;
    const orderRef = ref(db, `/order/${orderId}/`);
    await update(orderRef, {
      VersionNum: newVersion,
    });

    const versionRef = ref(db, `/order/${orderId}/${newVersion}/`);
    await set(versionRef, {
      ...editRow,
      date: new Date().toISOString(),
      price: totalPrice,
      card: cardDetails,
    });

    setOpenDialog(false);
    setEditRow(null);
    setSuccess("Order updated successfully!");
    fetchOrders();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditRow(null);
  };

  const handleViewDialogClose = () => {
    setOpenViewDialog(false);
    setViewDetails(null);
    setSelectedVersion(""); // Reset selected version
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('card_')) {
      const cardKey = name.split('_')[1];
      setEditRow(prev => ({
        ...prev,
        cardDetails: {
          ...prev.cardDetails,
          [cardKey]: value.replace(/\D/g, '')
        }
      }));
    } else {
      setEditRow(prev => ({ ...prev, [name]: value }));
    }
  };

  // Filtered rows based on search query
  const filteredRows = rows.filter(row =>
    row.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <Paper sx={{ height: 'auto', width: '100%' }}>
      <h1>Customer Order</h1>
      <TextField
        margin="normal"
        label="Search"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </div>
      ) : (
        <DataGrid
          rows={filteredRows} // Use filtered rows for the DataGrid
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          sx={{ border: 0 }}
        />
      )}
      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Edit Order Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Edit Order</DialogTitle>
        <DialogContent>
          {editRow && (
            <>
              {Object.entries(editRow.cardDetails).map(([cardId, cardValue]) => (
                <TextField
                  key={cardId}
                  margin="dense"
                  name={`card_${cardId}`}
                  label={cardId}
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={cardValue || ''}
                  onChange={handleChange}
                />
              ))}
              <TextField
                margin="dense"
                name="employee"
                label="Employee"
                type="text"
                fullWidth
                variant="outlined"
                value={editRow.employee}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="status"
                label="Status"
                type="text"
                fullWidth
                variant="outlined"
                value={editRow.status}
                onChange={handleChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Order Details Dialog */}
      <Dialog open={openViewDialog} onClose={handleViewDialogClose}>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {viewDetails && (
            <>
              <TextField
                margin="dense"
                label="Order ID"
                type="text"
                fullWidth
                variant="outlined"
                value={viewDetails.orderId}
                InputProps={{
                  readOnly: true,
                }}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Version Number</InputLabel>
                <Select
                  value={selectedVersion}
                  onChange={handleVersionChange}
                >
                  {Array.from({ length: viewDetailsVersion }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                label="Price"
                type="text"
                fullWidth
                variant="outlined"
                value={viewDetails.price}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                margin="dense"
                label="Date"
                type="text"
                fullWidth
                variant="outlined"
                value={viewDetails.date}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                margin="dense"
                label="Employee"
                type="text"
                fullWidth
                variant="outlined"
                value={viewDetails.employee}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                margin="dense"
                label="Status"
                type="text"
                fullWidth
                variant="outlined"
                value={viewDetails.status}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                margin="dense"
                label="User"
                type="text"
                fullWidth
                variant="outlined"
                value={viewUserVersion.user}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                margin="dense"
                label="Cards"
                type="text"
                fullWidth
                variant="outlined"
                value={viewDetails.card}
                InputProps={{
                  readOnly: true,
                }}
              />
       
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OrderTable;