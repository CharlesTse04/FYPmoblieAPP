import React, { useState } from 'react';
import { Button, Container, Typography, TextField } from '@mui/material';

function WishListApp() {
    const [result, setResult] = useState('');
    const [file, setFile] = useState(null);

    const handleUpload = async (event) => {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData();
        formData.append('file', file); // Append file to form data

        try {
            const response = await fetch('http://127.0.0.1:5010/api/add', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json(); // Parse JSON data
            setResult('Predicted Class: ' + data.predicted_class); // Display prediction result
        } catch (error) {
            setResult('Error: ' + error.message); // Display error message
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            handleUpload(event); // Automatically call upload when file is selected
        }
    };

    return (
        <Container sx={{ padding: '20px' }}>
            <Typography variant="h4">Upload an Image for Prediction</Typography>
            <form onSubmit={(e) => e.preventDefault()}>
                <TextField
                    type="file"
                    inputProps={{ accept: 'image/*' }}
                    onChange={handleFileChange}
                    required
                    sx={{ marginBottom: '20px' }}
                />
                {/* Button can be removed or kept for manual submission */}
                {/* <Button variant="contained" type="submit">Predict</Button> */}
            </form>
            <Typography variant="body1" sx={{ marginTop: '20px', fontWeight: 'bold' }}>
                {result}
            </Typography>
        </Container>
    );
}

export default WishListApp;