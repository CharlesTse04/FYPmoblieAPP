import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { Snackbar, Alert, FormControl ,InputLabel,Select,MenuItem } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { getDatabase, ref, get, update } from "firebase/database";

const EmployeeDataTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState('');
  const [manage, setManage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [buttonColor, setButtonColor] = useState(''); // 按鈕顏色狀態

  // Define columns for employees data
  const columns = [
    { field: 'empId', headerName: 'Employee ID', width: 250 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'password', headerName: 'Password', width: 150 },
    { field: 'salary', headerName: 'Salary', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'manage', headerName: 'Manage', width: 100 },
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
        </div>
      ),
    },
  ];

  const handleResetPassword = () => {
    setPassword("aa123");
    setSuccessMessage("Password reset successfully!");
    setButtonColor('success'); // 設置按鈕顏色為綠色
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setButtonColor('default'); // 重置按鈕顏色
  };

  useEffect(() => {
    const db = getDatabase();
    const employeesRef = ref(db, '/employees/');

    const fetchData = async () => {
      setLoading(true);
      try {
        const snapshot = await get(employeesRef);
        const data = snapshot.val() || {};
        const formattedRows = [];

        for (const empId in data) {
          const employee = data[empId];
          formattedRows.push({
            id: empId, // Adding the unique id property
            empId: employee.empId,
            email: employee.email,
            name: employee.name,
            phone: employee.phone,
            password: employee.password,
            salary: employee.salary,
            status: employee.status,
            manage: employee.manage,
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
    setEmail(row.email);
    setName(row.name);
    setPhone(row.phone);
    setSalary(row.salary);
    setStatus(row.status);
    setManage(row.manage);
    setOpen(true);
  };

  const handleUpdate = async () => {
    const db = getDatabase();
    const employeeRef = ref(db, `/employees/${currentRow.empId}`);
    try {
      await update(employeeRef, { email, name, phone, password, salary, status, manage });
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.empId === currentRow.empId ? { ...row, email, name, phone, password, salary, status, manage } : row
        )
      );
      setOpen(false);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <>
      <h1>Employee List</h1>
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
            getRowId={(row) => row.empId} // Specify empId as the unique id
            sx={{ border: 0 }}
          />
        )}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Update the details of the employee.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Phone"
              type="text"
              fullWidth
              variant="standard"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
<br />
<br />
        <div>
          <Button
            variant="contained"
            color={buttonColor} // 使用狀態來設置按鈕顏色
            onClick={handleResetPassword}
          >
            Reset Password
          </Button>
          <Snackbar
            open={!!successMessage}
            onClose={handleCloseSnackbar}
          >

            <Alert onClose={handleCloseSnackbar} severity="success">
              {successMessage}
            </Alert>
          </Snackbar>
        </div>

            {/* <TextField
              margin="dense"
              label="Salary"
              type="text"
              fullWidth
              variant="standard"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            /> */}

             <FormControl margin="normal" style={{ minWidth: 200 }}>
                        <InputLabel margin="dense" id="Salary-select" >Salary</InputLabel>
                        <Select value={salary} id="Salary-select" label="Salary"  onChange={(e) => setSalary(e.target.value)}>
                            <MenuItem value="IT">IT</MenuItem>
                            <MenuItem value="Sales">Sales</MenuItem>
                            <MenuItem value="Accounting">Accounting</MenuItem>
                        </Select>
                    </FormControl>

            {/* <TextField
              margin="dense"
              label="Status"
              type="text"
              fullWidth
              variant="standard"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            /> */}
<div>
            <FormControl margin="normal" style={{ minWidth: 200 }}>
                        <InputLabel margin="dense" id="Status-select" >Status</InputLabel>
                        <Select value={status} id="Status-select" label="Status" onChange={(e) => setStatus(e.target.value)}>
                            <MenuItem value="working">working</MenuItem>
                            <MenuItem value="resign">resign</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </Select>
                    </FormControl>
                    </div>
            {/* <TextField
              margin="dense"
              label="Manage"
              type="text"
              fullWidth
              variant="standard"
              value={manage}
              onChange={(e) => setManage(e.target.value)}
            /> */}

<FormControl margin="normal" style={{ minWidth: 200 }}>
                        <InputLabel margin="dense" id="Manage-select" >Manage</InputLabel>
                        <Select value={manage} id="Manage-select" label="Manage" onChange={(e) => setManage(e.target.value)}>
                            <MenuItem value="Yes">Yes</MenuItem>
                            <MenuItem value="No">No</MenuItem>
                        </Select>
                    </FormControl>

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

export default EmployeeDataTable;