import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button'; // Import Button for the View button
import { getDatabase, ref, get } from "firebase/database";
import ViewUserOrder from "./ViewUserOrder";
import { decrypt } from '../jmjm.js';

const UserDataTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Define columns with a View button
  const columns = [
    { field: 'id', headerName: 'User ID', width: 150 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'password', headerName: 'Password', width: 150 },
    { field: 'phoneNumber', headerName: 'Phone Number', width: 150 },
    { field: 'points', headerName: 'Points', width: 100, type: 'number' },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'view',
      headerName: 'View',
      width: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          onClick={() => handleViewClick(params.row.id)} // Pass User ID to the handler
        >
          View
        </Button> 
      ),
    },
  ];

  const handleViewClick = (id) => {
    setUserId(id); // Set the selected user ID
  };

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, '/user/');

    const fetchData = async () => {
      setLoading(true);
      try {
        const snapshot = await get(usersRef);
        const data = snapshot.val() || {};
        const formattedRows = [];

        for (const userId in data) {
          const user = data[userId];
          formattedRows.push({
            id: userId,  // Use the userId as the unique ID
            name: user.name,
            password: decrypt(user.password),
            phoneNumber: decrypt(user.phoneNumber),
            points: user.Point, // Adjust for case sensitivity if necessary
            email: decrypt(user.email),
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

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <>
    <h1>Customer list</h1>
    <Paper sx={{ height: 400, width: '100%' }}>
   
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
         <ViewUserOrder userId={userId} />

    </Paper>
    </>
  );
};

export default UserDataTable;