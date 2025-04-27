import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { getDatabase, ref, get } from "firebase/database";

const CardDataTable = ({ setCard }) => {
  const [rows, setRows] = useState([]);
  const [grows, setGrows] = useState([]);
  const [loading, setLoading] = useState(true);

  // 定义表格列
  const columns = [
    { field: 'id', headerName: 'Card ID', width: 150 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'price', headerName: 'Price', width: 100, type: 'number' },
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'rarity', headerName: 'Rarity', width: 100 },
    { field: 'quantity', headerName: 'Buy Quantity', width: 100, type: 'number' },
  ];

  const columnsGal = [
    { field: 'id', headerName: 'Gallery ID', width: 150 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'price', headerName: 'Price', width: 100, type: 'number' },
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'quantity', headerName: 'Buy Quantity', width: 150 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const db = getDatabase();
      const cardsRef = ref(db, '/cards/');
      const galleriesRef = ref(db, '/galleries/');
      setLoading(true);
      try {
        const [cardsSnapshot, galleriesSnapshot] = await Promise.all([
          get(cardsRef),
          get(galleriesRef),
        ]);
        const cardsData = cardsSnapshot.val() || {};
        const galleriesData = galleriesSnapshot.val() || {};
        
        const formattedRows = [];
        const formattedGalleriesRows = [];

        // Process cards data
        Object.entries(setCard).forEach(([cardId, cardValue]) => {
          const card = cardsData[cardId];
          if (card) {
            formattedRows.push({
              id: cardId,
              name: card.name,
              price: card.price,
              quantity: cardValue,
              type: card.type,
              rarity: card.rarity,
            });
          }
        });

        // Process galleries data
        Object.entries(setCard).forEach(([galleryId, galleryValue]) => {
          const gallery = galleriesData[galleryId];
          if (gallery) {
          formattedGalleriesRows.push({
            id: galleryId,
            name: gallery.name,
            type: gallery.type,
            quantity: galleryValue,
            price: gallery.price,
          });
        }
        });

        setRows(formattedRows);
        setGrows(formattedGalleriesRows);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    if (setCard) {
      fetchData();
    }
  }, [setCard]); // 依赖 setCard 以便在其变化时重新获取数据

  return (
    <>
      <Paper sx={{ height: 'auto', width: '100%', marginBottom: 2 }}>
        <p>Card List</p>
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
      </Paper>

      <Paper sx={{ height: 'auto', width: '100%' }}>
        <p>Gallery List</p>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </div>
        ) : (
          <DataGrid
            rows={grows}
            columns={columnsGal}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            sx={{ border: 0 }}
          />
        )}
      </Paper>
    </>
  );
};

export default CardDataTable;