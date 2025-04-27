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
import { Typography, List, ListItem } from '@mui/material';
import { getDatabase, ref, get, remove, update,child } from "firebase/database";
import cong from '../assets/index'; // Adjust the import path as necessary
const CompetitionDataTable = () => {
  const [rows, setRows] = useState([]);
  const [userRows, setUserRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);

  const [currentRow, setCurrentRow] = useState(null);
  const [competitionDate, setCompetitionDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [participants, setParticipants] = useState('');
  const [startDate, setStartDate] = useState('');
  const [prizes, setPrizes] = useState({ first: '', second: '', third: '' });
  const [price, setPrice] = useState('');
  const [openAdd, setOpenAdd] = useState(false);

  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newFraction, setNewFraction] = useState('');
  // const [user, setUser] = useState('');

  const userColumns = [
    { field: 'id', headerName: 'User ID', width: 250 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 200 },
    { field: 'state', headerName: 'State', width: 200 },
  ];

  const userConColumns = [
    { field: 'id', headerName: 'User ID', width: 250 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 200 },
    { field: 'state', headerName: 'State', width: 200 },
    {
      field: 'setting',
      headerName: 'Setting',
      width: 200,
      renderCell: (params) => {
  
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', height: '100%' }}>
             <Button
              variant="outlined"
              color="primary"
              onClick={() => handleFraction(params.row)}
            >
              fraction
            </Button> 
          </div>
      );}
    },
  ];

  // Define columns for competitions data
  const columns = [
    { field: 'id', headerName: 'Competition ID', width: 250 },
    { field: 'competitionDate', headerName: 'Competition Date', width: 200 },
    { field: 'endDate', headerName: 'End Date', width: 200 },
    { field: 'participantsCount', headerName: 'Participants Number', width: 200 },
    { field: 'startDate', headerName: 'Start Date', width: 200 },
    { field: 'competitionTime', headerName: 'Competition Time', width: 200 },
    { field: 'price', headerName: 'Price', width: 200 },
    {
      field: 'setting',
      headerName: 'Setting',
      width: 300,
      renderCell: (params) => {
        const contestantCount = params.row.contestant ? Object.keys(params.row.contestant).length : 0;
        const participants = params.row.participants || 0; // Ensure participants is defined
  
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', height: '100%' }}>
             <Button
              variant="outlined"
              color="primary"
              onClick={() => handleAdd(params.row)}
              disabled={contestantCount >= participants} // Disable if contestantCount >= participants
            >
              Control
            </Button> 
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleSeat(params.row)}
            >
              Seat
            </Button>
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
        );
      },
    },
  ];
  

  const handleSeat = async (row) => {
    const db = getDatabase();
    const competitionRef = ref(db, `/competitions/${row.id}/contestant`);
    const numbers = [];

    // 生成數字序列
    for (let i = 1; i <= Math.ceil(row.contestantCount / 2); i++) {
        numbers.push(i, i); // 添加 i 兩次
    }

    // 隨機打亂數字
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]]; // 交換
    }

    // 取前 row.contestantCount 個數字
    const selectedNumbers = numbers.slice(0, row.contestantCount);
    alert(selectedNumbers); // 顯示選擇的數字

    try {
        // 獲取所有參賽者的資料
        const snapshot = await get(child(competitionRef, '/'));
        if (snapshot.exists()) {
            const contestants = snapshot.val();
            const updates = {};

            Object.keys(contestants).forEach((key, index) => {
                if (index < selectedNumbers.length) {
                    updates[`${key}/seat`] = selectedNumbers[index]; // 準備更新
                }
            });

            // 批量更新參賽者座位
            await update(ref(db, `/competitions/${row.id}/contestant`), updates);
        } else {
            console.log("No data available");
        }
    } catch (error) {
        console.error("Error fetching contestants:", error);
    }

    setCurrentRow(row); // 更新當前行
};

  const handleAdd = (row) => {
    setCurrentRow(row);
    setOpenAdd(true);
    fetchUsers(row);
  };

  // const handleAddUser = async () => {
  //   const db = getDatabase();
  //   const competitionRef = ref(db, `/competitions/${currentRow.id}`);
    
  //   try {
  //     // Fetch the existing contestant data
  //     const snapshot = await get(competitionRef);
  //     const existingData = snapshot.exists() ? snapshot.val().contestant : {};
  
  //     // Define the new contestant data for bbb
  //     const newContestant = {
  //       [user]: { // New contestant key
  //         state: 'join', // Set the state to 'join'
  //         image: null // Set the image to null or provide an actual image URL
  //       }
  //     };
  
  //     // Merge existing data with the new contestant
  //     const updatedContestants = {
  //       ...existingData, // Spread existing contestants (e.g., aa)
  //       ...newContestant // Add the new contestant (bbb)
  //     };
  
  //     // Update the competition with the merged contestant data
  //     await update(competitionRef, { contestant: updatedContestants });
  //     setUser('');
  //     setOpenAdd(false);
  //   } catch (error) {
  //     console.error("Error updating competition:", error);
  //   }
  // };

  useEffect(() => {
    const db = getDatabase();
    const competitionsRef = ref(db, '/competitions/');

    const fetchData = async () => {
      setLoading(true);
      try {
        const snapshot = await get(competitionsRef);
        const data = snapshot.val() || {};
        const formattedRows = [];

        for (const competitionId in data) {
          const competition = data[competitionId];

          const contestantCount = competition.contestant ? Object.keys(competition.contestant).length : 0;
          formattedRows.push({
            id: competitionId,
            contestant: competition.contestant,
            price:competition.price,
            employee: competition.employee,
            competitionDate: competition.competitionDate,
            competitionTime: competition.competitionTime,
            endDate: competition.endDate,
            participantsCount: contestantCount +'/'+ competition.participants,
            contestantCount: contestantCount,
            participants: competition.participants,
            startDate: competition.startDate,
            prizes: competition.prizes, // Add prizes to the row data
            participation: competition.participation // Add participation to the row data
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

  const fetchUsers = async ( row ) => {
    const db = getDatabase();
    const usersRef = ref(db, '/user/');
    setLoading(true); // Start loading state
    try {
      const snapshot = await get(usersRef);
      const data = snapshot.val() || {};
      const formattedRows = [];
  
      // Loop through each user
      for (const userId in data) {
        const user = data[userId];
        // Check if user is not already in contestant
        if (row.contestant[userId] !== undefined) {
          // Add user to the formatted rows
          formattedRows.push({
            id: userId, // Ensure each row has a unique `id`
            email: user.email, // Assuming user object has email property
            phone: user.phoneNumber, // Assuming user object has phone property
            state: row.contestant[userId].state, // Assuming user object has state property
            fraction: row.contestant[userId].fraction || 0, // Assuming user object has state property
            price: user.price, // Include price if needed
          });
        }
      }
  
      setUserRows(formattedRows); // Update the user rows
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    } finally {
      setLoading(false); // End loading state
    }
  };

  const handleEdit = async (row) => {
    setCurrentRow(row);
    setCompetitionDate(row.competitionDate);
    setEndDate(row.endDate);
    setPrice(row.price);
    setParticipants(row.participants);
    setStartDate(row.startDate);
    setPrizes(row.prizes);
    setOpenEdit(true);
    fetchUsers( row );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this competition?")) {
      const db = getDatabase();
      const competitionRef = ref(db, `/competitions/${id}`);
      try {
        await remove(competitionRef);
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      } catch (error) {
        console.error("Error deleting competition:", error);
      }
    }
  };

  const handleUpdate = async () => {
    const db = getDatabase();
    const competitionRef = ref(db, `/competitions/${currentRow.id}`);
    try {
      await update(competitionRef, { competitionDate, endDate, participants, startDate });
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === currentRow.id ? { ...row, competitionDate, endDate, participants, startDate } : row
        )
      );
      setOpenEdit(false);
    } catch (error) {
      console.error("Error updating competition:", error);
    }
  };

  const paginationModel = { page: 0, pageSize: 5 };


  const handleFraction = async (user) => {

    const db = getDatabase();
    const fractionRef = ref(db, `competitions/${currentRow.id}/contestant/${user.id}/fraction`);
    
    const snapshot = await get(fractionRef);
    if (snapshot.exists()) {
      setCurrentUser(user);
      setNewFraction(snapshot.val());
      setOpen(true);
    } else {
      setCurrentUser(user);
      setNewFraction(0);
      setOpen(true);
    }
  };

  const handleUpdateFraction = async () => {
    const db = getDatabase(cong);
    const fractionRef = ref(db, `competitions/${currentRow.id}/contestant/${currentUser.id}`);
  
    try {
      await update(fractionRef, {
        fraction: newFraction, // Wrap the new fraction in an object
      });
      alert('Fraction updated successfully!');
      setOpen(false);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update fraction. Please try again.');
    }
  };


  return (
    <>
      <h1>Competition List</h1>
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
        {/* Edit Dialog */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <DialogTitle>Edit Competition</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Update the details of the competition.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Competition Date"
              type="date"
              fullWidth
              variant="standard"
              value={competitionDate}
              onChange={(e) => setCompetitionDate(e.target.value)}
            />
            <TextField
              margin="dense"
              label="End Date"
              type="date"
              fullWidth
              variant="standard"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Participants"
              type="text"
              fullWidth
              variant="standard"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
                <TextField
              margin="dense"
              label="Price"
              type="Number"
              fullWidth
              variant="standard"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Start Date"
              type="date"
              fullWidth
              variant="standard"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
        <div>
      <Typography variant="h4" gutterBottom>
        Prizes
      </Typography>
      <List>
        {prizes.first && (
          <ListItem>
            <Typography>First Prize: {prizes.first}</Typography>
          </ListItem>
        )}
        {prizes.second && (
          <ListItem>
            <Typography>Second Prize: {prizes.second}</Typography>
          </ListItem>
        )}
        {prizes.third && (
          <ListItem>
            <Typography>Third Prize: {prizes.third}</Typography>
          </ListItem>
        )}
      </List>
    </div>
          <h2>Contestants</h2>
          <h3>Users</h3>
          <DataGrid
            rows={userRows}
            columns={userColumns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            sx={{ border: 0 }}
          />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogActions>
        </Dialog>


        <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
          <DialogTitle>Add Contestion</DialogTitle>
          <DialogContent>
            <DialogContentText>
            Control the user.
            </DialogContentText>
            <h2>Control User</h2>
          <h3>Users</h3>
          <DataGrid
            rows={userRows}
            columns={userConColumns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            sx={{ border: 0 }}
          />
          
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>



        <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Update Fraction</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Fraction Score"
            type="number"
            fullWidth
            variant="outlined"
            value={newFraction}
            onChange={(e) => setNewFraction(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateFraction} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      </Paper>
    </>
  );
};

export default CompetitionDataTable;