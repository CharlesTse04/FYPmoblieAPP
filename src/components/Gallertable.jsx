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

const GalleryDataTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // Define columns for galleries data
  const columns = [
    { field: 'id', headerName: 'Gallery ID', width: 250 },
    { field: 'price', headerName: 'Price', width: 200, type: 'number' },
    { field: 'quantity', headerName: 'Quantity', width: 300, type: 'number' },
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
          color="error"
          onClick={() => handleDelete(params.row.id)}
        >
          Delete
        </Button>
      </div>
      ),
    },
  ];

  useEffect(() => {
    const db = getDatabase();
    const galleriesRef = ref(db, '/galleries/');

    const fetchData = async () => {
      setLoading(true);
      try {
        const snapshot = await get(galleriesRef);
        const data = snapshot.val() || {};
        const formattedRows = [];

        for (const galleryId in data) {
          const gallery = data[galleryId];
          formattedRows.push({
            id: galleryId,
            price:  Number(gallery.price)  * (1-gallery.discount/100),
            quantity: gallery.quantity,
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
    setPrice(row.price);
    setQuantity(row.quantity);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this gallery?")) {
      const db = getDatabase();
      const galleryRef = ref(db, `/galleries/${id}`);
      try {
        await remove(galleryRef);
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      } catch (error) {
        console.error("Error deleting gallery:", error);
      }
    }
  };

  const handleUpdate = async () => {
    const db = getDatabase();
    const galleryRef = ref(db, `/galleries/${currentRow.id}`);
    try {
      await update(galleryRef, { price, quantity });
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === currentRow.id ? { ...row, price, quantity } : row
        )
      );
      setOpen(false);
    } catch (error) {
      console.error("Error updating gallery:", error);
    }
  };

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <>
       <h1>Gallery List</h1>
    <Paper sx={{ height: 'auto', width: '100%' }}>
   
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </div>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          sx={{ border: 0 }}
        />
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Gallery</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update the details of the gallery.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            variant="standard"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            variant="standard"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />·
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogActions>
      </Dialog>
    </Paper>
    </>
  );
};

export default GalleryDataTable;