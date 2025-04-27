import React, { useState } from "react";
import { Box, Button, TextField, Typography, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { getDatabase, ref, set } from "firebase/database";
import cong from '../assets/index'; // Ensure the correct import of Firebase configuration
import LoginId from "../getData/loginId";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';


const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Competition() {
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const formatTime = (time) => {
        return time.format('HH:mm');
    };
    const [endDate, setEndDate] = useState('');
    const [competitionDate, setCompetitionDate] = useState('');
    const [participants, setParticipants] = useState('');
    const [prize1, setPrize1] = useState('');
    const [prize2, setPrize2] = useState('');
    const [prize3, setPrize3] = useState('');
    const [price, setPrice] = useState('');
    const [participationPrize, setParticipationPrize] = useState('');
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Today's date

    // Sanitize competition ID
    const competitionId = `COMPETITION_${new Date().toISOString().replace(/[:.]/g, '-')}`;

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        const db = getDatabase(cong);
        const competitionRef = ref(db, `competitions/${competitionId}`); // Use sanitized competition ID
        let competitionTime = `${formatTime(startTime)} - ${formatTime(endTime)}`;


        alert(competitionTime);
        try {
            // Save competition data to Firebase Realtime Database
            await set(competitionRef, {
                startDate,
                endDate,
                competitionDate,
                participants,
                price,
                competitionTime,
                contestant: null,
                employee: LoginId().id,
                prizes: {
                    first: prize1,
                    second: prize2,
                    third: prize3,
                    participation: participationPrize,
                },
            });

            console.log("Competition registration successful!");
            setSuccessMessage("Competition registration successful!");
            // Reset form fields
            setStartDate('');
            setEndDate('');
            setCompetitionDate('');
            setParticipants('');
            setStartTime(null);
            setEndTime(null);
            setPrize1('');
            setPrize2('');
            setPrize3('');
            setPrice('');
            setParticipationPrize('');
        } catch (error) {
            console.error("Error saving competition:", error);
            setErrorMessage("Error registering competition. Please try again.");
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
                Register New Competition
            </Typography>
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>

                <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '-10px', fontWeight: 'bold' }}>Start Date</p>
                    <TextField
                        type="date"
                        variant="outlined"
                        margin="normal"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        fullWidth
                        required
                    />
                </div>
                <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '-10px', fontWeight: 'bold' }}>End Date</p>
                    <TextField
                        type="date"
                        variant="outlined"
                        margin="normal"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        fullWidth
                        required
                    />
                </div>
                <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '-10px', fontWeight: 'bold' }}>Competition Date</p>
                    <TextField

                        type="date"
                        variant="outlined"
                        margin="normal"
                        value={competitionDate}
                        onChange={(e) => setCompetitionDate(e.target.value)}
                        fullWidth
                        required
                    />
                </div>


                <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '-10px', fontWeight: 'bold' }}>Number of Participants</p>
                    <TextField
                        type="number" // Use lowercase 'number' for type
                        label="Number of Participants"
                        variant="outlined"
                        margin="normal"
                        value={participants}
                        onChange={(e) => setParticipants(Math.max(0, e.target.value))} // Set minimum to 0
                        fullWidth
                        required
                        inputProps={{
                            min: 0, // Set minimum value to 0
                        }}
                    />
                </div>
                <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '-10px', fontWeight: 'bold' }}>Price</p>
                    <TextField
                        type="number" // Use lowercase 'number' for type
                        label="price"
                        variant="outlined"
                        margin="normal"
                        value={price}
                        onChange={(e) => setPrice(Math.max(0, e.target.value))} // Set minimum to 0
                        fullWidth
                        required
                        inputProps={{
                            min: 0, // Set minimum value to 0
                        }}
                    />
                </div>
                <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Time</p>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box>
                            <TimePicker
                                label="start time"
                                value={startTime}
                                onChange={(newValue) => {
                                    setStartTime(newValue);
                                    console.log('开始时间:', newValue ? newValue.format('HH:mm') : '未选择');
                                }}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <TimePicker
                                label="end time"
                                value={endTime}
                                onChange={(newValue) => {
                                    setEndTime(newValue);
                                    console.log('结束时间:', newValue ? newValue.format('HH:mm') : '未选择');
                                }}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>
                    </LocalizationProvider>
                </div>
                <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '-10px', fontWeight: 'bold' }}>1st Prize</p>
                    <TextField
                        label="1st Prize"
                        variant="outlined"
                        margin="normal"
                        value={prize1}
                        onChange={(e) => setPrize1(e.target.value)}
                        fullWidth
                        required
                    />
                </div>
                <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '-10px', fontWeight: 'bold' }}>2nd Prize</p>
                    <TextField
                        label="2nd Prize"
                        variant="outlined"
                        margin="normal"
                        value={prize2}
                        onChange={(e) => setPrize2(e.target.value)}
                        fullWidth
                        required
                    />
                </div>
                <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '-10px', fontWeight: 'bold' }}>3rd Prize</p>
                    <TextField
                        label="3rd Prize"
                        variant="outlined"
                        margin="normal"
                        value={prize3}
                        onChange={(e) => setPrize3(e.target.value)}
                        fullWidth
                        required
                    />
                </div>
                <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '-10px', fontWeight: 'bold' }}>Participation Prize</p>
                    <TextField
                        label="Participation Prize"
                        variant="outlined"
                        margin="normal"
                        value={participationPrize}
                        onChange={(e) => setParticipationPrize(e.target.value)}
                        fullWidth
                        required
                    />
                </div>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Register Competition
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

export default Competition;