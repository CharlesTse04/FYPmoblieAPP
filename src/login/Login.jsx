import React, { useState } from "react";
import { Box, Button, TextField, Typography, Snackbar, CircularProgress } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { getDatabase, ref, onValue } from "firebase/database";
import cong from '../assets/index'; // Ensure this imports your Firebase config correctly
import { useNavigate } from 'react-router-dom'; 

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Login() {
    const [loginId, setLoginId] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);
    const [fetchedImageUrl, setFetchedImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true); // Start loading

        const database = getDatabase(cong);
        const userRef = ref(database, `employees/${loginId}`);

        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            setLoading(false); // Stop loading
            if (userData && userData.password === loginPass) {
                console.log("Login successful!");
                    // Save user data as an object
                    const userDataToStore = {
                        id: loginId,
                        name: userData.name, // Correctly accessing name from userData
                        email: userData.email, // Correctly accessing email from userData 
                        manage: userData.manage,       
                    };
                    localStorage.setItem('Login', JSON.stringify(userDataToStore));
                navigate('/mypage'); 
                setFetchedImageUrl(userData.imageUrl || null);
                setLoggedIn(true);
            } else {
                console.log("Login failed: Invalid credentials.");
                setErrorMessage("Invalid credentials, please try again.");
                setOpen(true);
            }
        }, {
            onlyOnce: true
        }, (error) => {
            setLoading(false); // Stop loading on error
            setErrorMessage("Failed to connect to the server.");
            setOpen(true);
        });
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                backgroundColor: "#f5f5f5",
            }}
        >
            <Typography variant="h4" sx={{ marginBottom: 2 }}>
                Login
            </Typography>
            <form onSubmit={handleSubmit} style={{ width: "300px" }}>
                <TextField
                    label="User ID"
                    variant="outlined"
                    margin="normal"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    fullWidth
                    required
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    margin="normal"
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    fullWidth
                    required
                />
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Login"}
                </Button>
            </form>
            {loggedIn && <Typography variant="h6" sx={{ marginTop: 2 }}>Welcome, {loginId}!</Typography>}
            {fetchedImageUrl &&
             <img src={fetchedImageUrl}
             alt="User"
             style={{ marginTop: 10, width: '100%', maxWidth: '300px' }} />}
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error">
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Login;