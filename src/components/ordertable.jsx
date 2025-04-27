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
import LoginId from "../getData/loginId.jsx";
import OrderCard from "./OrdercardList.jsx";


const OrderTable = () => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [userVer, setUserVer] = useState(null);
  const [openVersionDialog, setOpenVersionDialog] = useState(false);
  const [galleries, setGalleries] = useState({});
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'orderId', headerName: 'Order ID', width: 130 },
    { field: 'price', headerName: 'Price', width: 100, type: 'number' },
    { field: 'vision', headerName: 'VersionNum', width: 100 },
    { field: 'card', headerName: 'Card', width: 150 },
    { field: 'date', headerName: 'Date', width: 210 },
    { field: 'employee', headerName: 'Employee', width: 150 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'user', headerName: 'User', width: 230 },
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
    fetchOrders();
    fetchCards();
    fetchGalleries();
  }, []);

  const handleSearch = () => {
    const newFilteredRows = rows.filter((row) => {
      const rowDate = new Date(row.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      const isWithinDateRange = (!startDate || rowDate >= start) && (!endDate || rowDate <= end);

      return (
        (row.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.status.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedStatus ? row.status === selectedStatus : true) &&
        isWithinDateRange
      );
    });

    setFilteredRows(newFilteredRows);
  };

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

      setRows(formattedRows);
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

  const fetchGalleries = async () => {
    const db = getDatabase();
    const galleriesRef = ref(db, '/galleries/');
    try {
      const snapshot = await get(galleriesRef);
      if (snapshot.exists()) {
        setGalleries(snapshot.val());
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
    setSelectedVersion(row.vision);
    await fetchVersionDetails(row.orderId, row.vision);
    setOpenViewDialog(true);
  };
  const handleHistoryClick = () => {
    setOpenVersionDialog(true); // 打开版本选择对话框
  };
  const fetchVersionDetails = async (orderId, version) => {
    const db = getDatabase();
    const versionNumRef = ref(db, `/order/${orderId}/VersionNum/`);
    const versionRef = ref(db, `/order/${orderId}/${version}/`);
    const usersRef = ref(db, `/order/${orderId}/`);

    try {
      const versionSnapshot = await get(versionRef);
      const versionNumSnapshot = await get(versionNumRef);
      const versionUserSnapshot = await get(usersRef);

      if (versionSnapshot.exists()) {
        const versionDetails = versionSnapshot.val();
        setViewDetails({
          ...versionDetails,
          orderId: orderId,
        });

        const versionuser = versionUserSnapshot.val();
        setViewUserVersion(versionuser);
        if (versionuser) {
          const userRef = ref(db, `/user/${versionuser.user}/`);
          const userSnapshot = await get(userRef);
          setUserVer(userSnapshot.val());
        } else {
          setError("Version user not found.");
        }

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

  const handleEdit = (row) => {
    setEditRow(row);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    const db = getDatabase();
    const { orderId, vision, cardDetails } = editRow;
    let totalPrice = 0;
    
    // 確保 cardDetails 是一個物件
    const cardDetailsSet = cardDetails || {};

    // 遍歷 cards 物件
    for (const cardId in cards) {
      const card = cards[cardId];
      if (cardDetailsSet[card.cardId] !== undefined) {
            const value = cardDetailsSet[card.cardId] || 0; // 獲取對應的 value，若不存在則為 0
  
            totalPrice += card.price * value - ((card.discount / 100) * value);
            // const cardRef = ref(db, `/cards/${card.cardId}/`);
            // if (rows.card[card.cardId] < value) {
            //   await update(cardRef, {
            //     quantity: card.quantity + value,
            //   });
            // }else{rows.quantity > value}{
            //   await update(cardRef, {
            //     quantity: card.quantity - value,
            //   });
            // }
          }
    }
    
    // 遍歷 galleries 物件
    for (const galleryId in galleries) {
      const gallery = galleries[galleryId];
      if (cardDetailsSet[gallery.galleryId] !== undefined) {

        const value = cardDetailsSet[gallery.galleryId] || 0; // 獲取對應的 value，若不存在則為 0
        totalPrice += gallery.price * value - ((gallery.discount / 100) * value);
      }
    }
    
    // 顯示最終總價格
    alert(totalPrice);



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
      employee: LoginId().id,
    });

    setOpenDialog(false);
    setEditRow(null);
    setSuccess("Order updated successfully!");

    await fetchOrders();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditRow(null);
  };

  const handleViewDialogClose = () => {
    setOpenViewDialog(false);
    setViewDetails(null);
    setSelectedVersion("");
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
      };
    }

  const handleConfirmVersion = async () => {
    // 在这里处理确认逻辑
    await fetchVersionDetails(viewDetails.orderId, selectedVersion);
    console.log(`Selected Version: ${selectedVersion}`);
    setOpenVersionDialog(false); // 关闭对话框
  };

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <Paper sx={{ height: 'auto', width: '100%' }}>
      <h1>Order History</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <TextField
          margin="normal"
          label="Search Order ID"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Start Date (MM-DD-YYYY)"
          type="date"
          variant="outlined"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <p>to</p>
        <TextField
          margin="normal"
          label="End Date (MM-DD-YYYY)"
          type="date"
          variant="outlined"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl margin="normal" style={{ flexGrow: 1 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="complete">Complete</MenuItem>
            <MenuItem value="on truck">On Truck</MenuItem>
            <MenuItem value="in production">In Production</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </div>
      ) : (
        <DataGrid
          rows={filteredRows}
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
               <FormControl variant="outlined" fullWidth margin="dense">
      <InputLabel id="status-label">Status</InputLabel>
      <Select
        labelId="status-label"
        name="status"
        label="Status"

        onChange={handleChange}
      >
        <MenuItem value="complete">Complete</MenuItem>
        <MenuItem value="in-progress">In Progress</MenuItem>
        <MenuItem value="not-started">Not Started</MenuItem>
      </Select>
    </FormControl>
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
      <Dialog open={openViewDialog} onClose={handleViewDialogClose} fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {viewDetails && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ color: userVer ? 'black' : 'gray' }}>
                <p>User First Name: {userVer ? userVer.firstName : 'N/A'}</p>
                <p>User Last Name: {userVer ? userVer.lastName : 'N/A'}</p>
                  <p>User Name: {userVer ? userVer.name : 'N/A'}</p>
                  <p>Email: {userVer ? userVer.email : 'N/A'}</p>
                  <p>Phone Number: {userVer ? userVer.phoneNumber : 'N/A'}</p>
                  <p>User Point: {userVer ? userVer.Point : 'N/A'}</p>
                </div>

                <div>
                  <p>Order ID: {viewDetails.orderId}</p>
                  <p>Price: {viewDetails.price}</p>
                  <p>Date: {viewDetails.date}</p>
                  <p>Employee: {viewDetails.employee}</p>
                  <p>Status: {viewDetails.status}</p>
                </div>

                <div style={{ color: viewUserVersion ? 'black' : 'gray' }}>
                  <p>User ID: {viewUserVersion ? viewUserVersion.user : 'N/A'}</p>
                  <p>Point: {viewUserVersion ? viewUserVersion.usePoint : 'N/A'}</p>
                </div>

                <OrderCard setCard={viewDetails.card} />
              </div>
              {/* {Object.entries(viewDetails.card).map(([cardId, cardValue]) => (
                <TextField
                  key={cardId}
                  margin="dense"
                  name={`card_${cardId}`}
                  label={cardId}
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={cardValue || ''}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              ))} */}

              <Button variant="contained" color="primary" onClick={handleHistoryClick} style={{ marginTop: 16 }}>
                History
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewDialogClose} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* 版本选择对话框 */}
      <Dialog open={openVersionDialog} onClose={() => setOpenVersionDialog(false)} fullWidth>
        <DialogTitle>Select Version</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Version Number</InputLabel>
            <Select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
            >
              {Array.from({ length: viewDetailsVersion }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmVersion} color="primary">
            Confirm
          </Button>
          <Button onClick={() => setOpenVersionDialog(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OrderTable;