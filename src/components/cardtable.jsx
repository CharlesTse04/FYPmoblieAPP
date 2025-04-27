import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { getDatabase, ref, get, remove, update } from 'firebase/database';

const CardDataTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(''); // 预测结果
  const [file, setFile] = useState(null); // 上传文件

  // Define columns based on the card structure
  const columns = [
    { field: 'id', headerName: 'Card ID', width: 150 },
    {
      field: 'image',
      headerName: 'Image',
      width: 150,
      renderCell: (params) => (
          <img src={params.value} alt="Card" style={{ width: '40%', height: 'auto' }} />
      ),
  },
    { field: 'galleries', headerName: 'Galleries', width: 150 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'price', headerName: 'Price', width: 100, type: 'number' },
    { field: 'quantity', headerName: 'Quantity', width: 100, type: 'number' },
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'rarity', headerName: 'Rarity', width: 100 },
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
    const cardsRef = ref(db, '/cards/');

    const fetchData = async () => {
      setLoading(true);
      try {
        const snapshot = await get(cardsRef);
        const data = snapshot.val() || {};
        const formattedRows = [];

        for (const cardId in data) {
          const card = data[cardId];
          formattedRows.push({
            id: cardId,
            image: card.image,
            engName : card.engName,
            galleries: card.galleryId,
            name: card.name,
            price: card.price * (1 - card.discount / 100),
            quantity: card.quantity,
            type: card.type,
            rarity: card.rarity,
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
    if (window.confirm("Are you sure you want to delete this card?")) {
      const db = getDatabase();
      const cardRef = ref(db, `/cards/${id}`);
      try {
        await remove(cardRef);
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      } catch (error) {
        console.error("Error deleting card:", error);
      }
    }
  };

  const handleUpdate = async () => {
    const db = getDatabase();
    const cardRef = ref(db, `/cards/${currentRow.id}`);
    try {
      await update(cardRef, {
        price: Number(price),
        quantity: Number(quantity),
      });
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === currentRow.id ? { ...row, price: Number(price), quantity: Number(quantity) } : row
        )
      );
      setOpen(false);
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

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
      setSearchTerm(data.predicted_class); // 将预测结果设置为搜索词
    } catch (error) {
      setResult('Error: ' + error.message);
    }
  };

  const filteredRows = rows.filter(row => 
    (row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (row.engName && row.engName.toLowerCase().includes(searchTerm.toLowerCase()))
);

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <Paper sx={{ height: 'auto', width: '100%', padding: '20px' }}>
      <h1>Card List</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <TextField
          label="Search by Name"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '100%' }}
        />
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <TextField
          type="file"
          inputProps={{ accept: 'image/*' }}
          onChange={(e) => setFile(e.target.files[0])}
          sx={{ width: '20%' }}
        />
        <Button sx={{ width: '20%' }} variant="contained" onClick={handleUpload}>
          Search Image
        </Button>
        </div>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </div>
      ) : (
<DataGrid
  rows={filteredRows}
  columns={columns}
  initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
  pageSizeOptions={[5, 10, 20]} // 增加選項
  checkboxSelection
  sx={{ border: 0, marginTop: '20px' }}

/>
      )}
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>{result}</h3>
        </div>
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Card</DialogTitle>
        <DialogContent>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CardDataTable;