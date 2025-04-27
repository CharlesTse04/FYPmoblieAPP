import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from "@mui/material";

import { getDatabase, ref, set, get } from "firebase/database";
import cong from '../assets/index'; // 确保正确导入 Firebase 配置


const NewEmployee = () => {
  const initialFormData = {
    empId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    status: '',
    manage: '',
    salary: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const checkEmpIdExists = async (empId) => {
    const db = getDatabase(cong);
    const employeeRef = ref(db, `employees/${empId}`);
    const snapshot = await get(employeeRef);
    return snapshot.exists();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 检查 empId 是否已存在
    const empIdExists = await checkEmpIdExists(formData.empId);
    if (empIdExists) {
      setErrorMessage("Employee ID already exists. Please use a different ID.");
      setOpenSnackbar(true);
      setLoading(false);
      return;
    }

    const db = getDatabase(cong);
    const employeeRef = ref(db, `employees/${formData.empId}`);

    try {
      await set(employeeRef, { ...formData, empId: formData.empId });
      setErrorMessage("Employee added successfully!");
      setOpenSnackbar(true);

      // 重置表单数据
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error adding employee:', error);
      setErrorMessage("Error adding employee: " + error.message);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box flex={4} p={2}>
      <Typography variant="h5" component="div" gutterBottom>
        Add Employee
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          name="empId"
          label="Employee ID"
          value={formData.empId}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          name="phone"
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            id="status-select"
            value={formData.status}
            label="Status"
            onChange={handleChange}
            name="status"
            required
          >
            <MenuItem value="working">Working</MenuItem>
            <MenuItem value="on_leave">On Leave</MenuItem>
            <MenuItem value="terminated">Terminated</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="manage-select-label">Manage</InputLabel>
          <Select
            labelId="manage-select-label"
            id="manage-select"
            value={formData.manage}
            label="Manage"
            onChange={handleChange}
            name="manage"
            required
          >
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          name="salary"
          label="Salary"
          value={formData.salary}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="contained" color="primary" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </form>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={errorMessage.includes("Error") ? "error" : "success"}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewEmployee;