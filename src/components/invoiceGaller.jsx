import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { getDatabase, ref, get } from "firebase/database";

const CardDataTable = ({ setCard }) => {
  const [grows, setGrows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define columns for galleries data
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
      const galleriesRef = ref(db, '/galleries/');
      setLoading(true);
      try {
        const galleriesSnapshot = await get(galleriesRef);
        const galleriesData = galleriesSnapshot.val() || {};
        
        const formattedGalleriesRows = [];

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
  }, [setCard]); // Dependency on setCard to refetch data on change

  return (
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
  );
};

export default CardDataTable;