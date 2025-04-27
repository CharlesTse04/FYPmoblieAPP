import React, { useState } from "react";
import { Box, Button, TextField, Typography, Snackbar, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { getDatabase, ref, set } from "firebase/database";
import cong from '../assets/index'; // 确保正确导入 Firebase 配置
import { encrypt } from '../jmjm.js';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Register() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Address fields
    const [address, setAddress] = useState({
        area: 'null', // Initialize to string 'null'
        flat: '',
        house: '',
        room: ''
    });

    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [Point, setPoint] = useState(0);

    // Sanitize email for user ID
    const userID = `${phoneNumber}-${email.replace(/[\.\#\$\[\]]/g, '-')}`;

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage("Please enter a valid email address.");
            setOpen(true);
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            setOpen(true);
            return;
        }

        // Check if area is 'null' and set flat, house, room to empty strings if so
        const areaToSave = address.area === 'null' ? null : address.area;
        const flatToSave = areaToSave === null ? '' : address.flat;
        const houseToSave = areaToSave === null ? '' : address.house;
        const roomToSave = areaToSave === null ? '' : address.room;

        const db = getDatabase(cong);
        const userRef = ref(db, `user/${userID}`); // Use sanitized userID
        const name = `${lastName} ${firstName}`; // Combine firstName and lastName

        try {
            // Save user data to Firebase Realtime Database
            await set(userRef, {
                Point,
                lastName,
                firstName,
                email: encrypt(email),
                name,
                password: encrypt(password), // Consider using Firebase Auth for actual applications
                phoneNumber: encrypt(phoneNumber),
                address: { 
                    area: areaToSave, 
                    flat: flatToSave, 
                    house: houseToSave, 
                    room: roomToSave 
                } // Save the address object
            });

            console.log("Registration successful!");
            setSuccessMessage("Registration successful! You can now log in.");
            // Reset form fields
            setEmail('');
            setFirstName('');
            setLastName('');
            setPassword('');
            setConfirmPassword('');
            setPhoneNumber('');
            setAddress({ area: 'null', flat: '', house: '', room: '' }); // Reset address fields
        } catch (error) {
            console.error("Error saving user:", error);
            setErrorMessage("Error registering user. Please try again.");
            setOpen(true);
        }
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    return (
        <Box flex={4} p={2}>
            <Typography variant="h4" sx={{ marginBottom: 2 }}>
                Register
            </Typography>
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <TextField
                    label="Email"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                />
                <TextField
                    label="First Name"
                    variant="outlined"
                    margin="normal"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    fullWidth
                    required
                />
                <TextField
                    label="Last Name"
                    variant="outlined"
                    margin="normal"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    fullWidth
                    required
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    margin="normal"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                />
                <TextField
                    label="Confirm Password"
                    variant="outlined"
                    margin="normal"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    required
                />
                <TextField
                    label="Phone Number"
                    variant="outlined"
                    margin="normal"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    fullWidth
                    required
                />

                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel>Area</InputLabel>
                    <Select
                        label="Area"
                        value={address.area}
                        onChange={(e) => setAddress({ ...address, area: e.target.value })}
                        required
                    >
                        <MenuItem value="null">
                            <em>Select an area</em> {/* Placeholder */}
                        </MenuItem>
                        <MenuItem value="Central and Western">Central and Western</MenuItem>
                        <MenuItem value="Eastern">Eastern</MenuItem>
                        <MenuItem value="Southern">Southern</MenuItem>
                        <MenuItem value="Wan Chai">Wan Chai</MenuItem>
                        <MenuItem value="Kowloon City">Kowloon City</MenuItem>
                        <MenuItem value="Kwun Tong">Kwun Tong</MenuItem>
                        <MenuItem value="Sham Shui Po">Sham Shui Po</MenuItem>
                        <MenuItem value="Wong Tai Sin">Wong Tai Sin</MenuItem>
                        <MenuItem value="Yau Tsim Mong">Yau Tsim Mong</MenuItem>
                        <MenuItem value="Islands">Islands</MenuItem>
                        <MenuItem value="Kwai Tsing">Kwai Tsing</MenuItem>
                        <MenuItem value="North">North</MenuItem>
                        <MenuItem value="Sai Kung">Sai Kung</MenuItem>
                        <MenuItem value="Sha Tin">Sha Tin</MenuItem>
                        <MenuItem value="Tai Po">Tai Po</MenuItem>
                        <MenuItem value="Tsuen Wan">Tsuen Wan</MenuItem>
                        <MenuItem value="Tuen Mun">Tuen Mun</MenuItem>
                        <MenuItem value="Yuen Long">Yuen Long</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="Flat"
                    variant="outlined"
                    margin="normal"
                    value={address.flat}
                    onChange={(e) => setAddress({ ...address, flat: e.target.value })}
                    fullWidth
                />
                <TextField
                    label="House"
                    variant="outlined"
                    margin="normal"
                    value={address.house}
                    onChange={(e) => setAddress({ ...address, house: e.target.value })}
                    fullWidth
                />
                <TextField
                    label="Room"
                    variant="outlined"
                    margin="normal"
                    value={address.room}
                    onChange={(e) => setAddress({ ...address, room: e.target.value })}
                    fullWidth
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Register
                </Button>
            </form>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error">
                    {errorMessage}
                </Alert>
            </Snackbar>
            {successMessage && (
                <Snackbar open={true} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="success">
                        {successMessage}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
}

export default Register;